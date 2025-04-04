
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.18.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const { subscriptionId, atPeriodEnd = true } = await req.json();

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: atPeriodEnd,
    });

    // Return the updated subscription data
    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
          current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error canceling subscription' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
