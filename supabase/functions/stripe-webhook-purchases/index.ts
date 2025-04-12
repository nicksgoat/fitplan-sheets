import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.5.0?dts";

// This endpoint handles Stripe webhook events for purchases
serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_PURCHASES');
    
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Handle specific events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract metadata
      const { itemType, itemId, userId, platformFee, creatorEarnings, referralSource } = session.metadata;
      
      if (itemType === 'program') {
        // Record program purchase
        const { error } = await supabase
          .from('program_purchases')
          .insert({
            program_id: itemId,
            user_id: userId,
            amount_paid: session.amount_total / 100, // Convert from cents
            platform_fee: parseFloat(platformFee),
            creator_earnings: parseFloat(creatorEarnings),
            stripe_session_id: session.id,
            purchase_date: new Date().toISOString(),
            status: 'completed',
            referral_source: referralSource || 'direct'
          });
          
        if (error) {
          console.error('Error recording program purchase:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to record program purchase' }),
            { status: 500 }
          );
        }
      } 
      else if (itemType === 'workout') {
        // Record workout purchase
        const { error } = await supabase
          .from('workout_purchases')
          .insert({
            workout_id: itemId,
            user_id: userId,
            amount_paid: session.amount_total / 100, // Convert from cents
            platform_fee: parseFloat(platformFee),
            creator_earnings: parseFloat(creatorEarnings),
            stripe_session_id: session.id,
            purchase_date: new Date().toISOString(),
            status: 'completed',
            referral_source: referralSource || 'direct'
          });
          
        if (error) {
          console.error('Error recording workout purchase:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to record workout purchase' }),
            { status: 500 }
          );
        }
      }
      else if (itemType === 'club') {
        // Record club subscription purchase
        // This would be implemented based on how club memberships are structured
        // For now, using the club_subscriptions table
        const { error } = await supabase
          .from('club_subscriptions')
          .insert({
            club_id: itemId,
            user_id: userId,
            plan_amount: session.amount_total / 100, // Convert from cents
            stripe_subscription_id: session.subscription || null,
            status: 'active',
            plan_interval: 'month', // Default to monthly for now
            current_period_start: new Date().toISOString(),
            // Set current_period_end to 1 month from now
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
          
        if (error) {
          console.error('Error recording club subscription:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to record club subscription' }),
            { status: 500 }
          );
        }
        
        // Also update the club_members table to reflect premium status
        const { error: memberError } = await supabase
          .from('club_members')
          .update({
            membership_type: 'premium',
            stripe_subscription_id: session.subscription || null,
            premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('club_id', itemId)
          .eq('user_id', userId);
          
        if (memberError) {
          console.error('Error updating club member:', memberError);
        }
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
