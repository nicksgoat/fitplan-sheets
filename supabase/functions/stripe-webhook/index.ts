
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
          const { error } = await supabase
            .from('club_members')
            .update({
              membership_type: 'premium',
              premium_expires_at: oneMonthLater.toISOString(),
              stripe_subscription_id: session.subscription,
            })
            .eq('club_id', clubId)
            .eq('user_id', userId);
          
          if (error) {
            console.error('Error updating membership:', error);
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
          // Find the subscription in our database
          const { data, error } = await supabase
            .from('club_members')
            .select('*')
            .eq('stripe_subscription_id', subscriptionId);
          
          if (error || !data.length) {
            console.error('Error finding subscription:', error);
            break;
          }
          
          // Extend the expiry date
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          
          const { error: updateError } = await supabase
            .from('club_members')
            .update({
              premium_expires_at: oneMonthLater.toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
          
          if (updateError) {
            console.error('Error updating subscription:', updateError);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        // Handle subscription cancellations
        const subscription = event.data.object;
        
        const { error } = await supabase
          .from('club_members')
          .update({
            membership_type: 'free',
            premium_expires_at: null,
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (error) {
          console.error('Error downgrading membership:', error);
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
