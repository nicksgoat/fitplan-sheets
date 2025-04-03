
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.5.0?dts";

// This endpoint needs to be available without authentication
serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Stripe keys not configured' }),
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        { status: 400 }
      );
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extract metadata
        const clientRef = session.client_reference_id;
        if (!clientRef) break;
        
        const [clubId, userId, type, productId] = clientRef.split(':');
        
        if (type === 'premium') {
          // For premium membership
          // Set up subscription with expiry date
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          
          // Update membership in database
          const { error: memberError } = await supabase
            .from('club_members')
            .update({
              membership_type: 'premium',
              premium_expires_at: oneMonthLater.toISOString(),
              stripe_subscription_id: session.subscription,
            })
            .eq('club_id', clubId)
            .eq('user_id', userId);
          
          if (memberError) {
            console.error('Error updating membership:', memberError);
          }

          // Also record in subscriptions table
          if (session.subscription) {
            // Get subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            
            const { error: subError } = await supabase
              .from('club_subscriptions')
              .insert({
                user_id: userId,
                club_id: clubId,
                stripe_subscription_id: session.subscription,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                plan_amount: session.amount_total / 100,
                plan_currency: session.currency,
                plan_interval: 'month'
              });
            
            if (subError) {
              console.error('Error recording subscription:', subError);
            }
          }
        } else if (type === 'product') {
          // For one-time product purchase
          const { error } = await supabase
            .from('club_product_purchases')
            .insert({
              product_id: productId,
              user_id: userId,
              amount_paid: session.amount_total / 100,
              currency: session.currency,
              stripe_session_id: session.id,
              status: 'completed',
            });
          
          if (error) {
            console.error('Error recording product purchase:', error);
          }
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        // Handle subscription renewals
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Find the subscription in our database
          const { data: subscriptions, error: findError } = await supabase
            .from('club_subscriptions')
            .select('*')
            .eq('stripe_subscription_id', subscriptionId);
          
          if (findError || !subscriptions.length) {
            console.error('Error finding subscription:', findError);
            break;
          }
          
          const dbSubscription = subscriptions[0];
          
          // Update subscription record
          const { error: subUpdateError } = await supabase
            .from('club_subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end
            })
            .eq('stripe_subscription_id', subscriptionId);
          
          if (subUpdateError) {
            console.error('Error updating subscription record:', subUpdateError);
          }
          
          // Extend the expiry date in club_members
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          
          const { error: memberUpdateError } = await supabase
            .from('club_members')
            .update({
              premium_expires_at: oneMonthLater.toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
          
          if (memberUpdateError) {
            console.error('Error updating subscription in club_members:', memberUpdateError);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        // Handle subscription cancellations
        const subscription = event.data.object;
        
        // Update club_members
        const { error: memberError } = await supabase
          .from('club_members')
          .update({
            membership_type: 'free',
            premium_expires_at: null,
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (memberError) {
          console.error('Error downgrading membership:', memberError);
        }
        
        // Update club_subscriptions
        const { error: subError } = await supabase
          .from('club_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (subError) {
          console.error('Error updating subscription record:', subError);
        }
        break;
      }
      
      case 'charge.refunded': {
        // Handle refunds
        const charge = event.data.object;
        
        // Find the purchase using the payment intent
        const { data: purchases, error: findError } = await supabase
          .from('club_product_purchases')
          .select('*')
          .eq('stripe_session_id', charge.payment_intent);
        
        if (findError || !purchases.length) {
          console.error('Error finding purchase for refund:', findError);
          break;
        }
        
        // Update the purchase record with refund info
        const { error: updateError } = await supabase
          .from('club_product_purchases')
          .update({
            status: 'refunded',
            refund_status: 'processed',
            refund_processed_at: new Date().toISOString()
          })
          .eq('stripe_session_id', charge.payment_intent);
        
        if (updateError) {
          console.error('Error updating purchase with refund info:', updateError);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
