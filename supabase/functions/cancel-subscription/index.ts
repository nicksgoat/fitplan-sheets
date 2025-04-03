
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.0.0?no-check";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    // Create Stripe client
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { subscriptionId, atPeriodEnd } = await req.json();
    
    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Subscription ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if subscription exists and belongs to the user
    const { data: subscription, error: subscriptionError } = await supabase
      .from('club_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subscriptionError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found or does not belong to the user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cancel the subscription in Stripe
    if (subscription.stripe_subscription_id) {
      try {
        if (atPeriodEnd) {
          // Cancel at period end
          await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            cancel_at_period_end: true,
          });
        } else {
          // Cancel immediately
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        }
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return new Response(
          JSON.stringify({ error: 'Failed to cancel subscription in Stripe' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update subscription in database
    const updateData = atPeriodEnd
      ? {
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
        }
      : {
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          status: 'canceled',
        };

    const { data: updatedSubscription, error: updateError } = await supabase
      .from('club_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update subscription in database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If immediate cancellation, also update club_members table
    if (!atPeriodEnd) {
      await supabase
        .from('club_members')
        .update({
          membership_type: 'free',
          premium_expires_at: null,
          stripe_subscription_id: null,
        })
        .eq('user_id', user.id)
        .eq('club_id', subscription.club_id);
    }

    // Return updated subscription
    return new Response(
      JSON.stringify({
        success: true,
        message: atPeriodEnd
          ? 'Subscription will be canceled at the end of the billing period'
          : 'Subscription has been canceled immediately',
        subscription: updatedSubscription,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cancel-subscription function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
