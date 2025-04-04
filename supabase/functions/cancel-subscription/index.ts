
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.3.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the user from the auth header
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("No authorization token");

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) throw new Error("Authentication failed");
    
    // Get the request body
    const { subscriptionId, atPeriodEnd = true } = await req.json();
    
    if (!subscriptionId) {
      throw new Error("Subscription ID is required");
    }

    // Get the subscription from Supabase to verify ownership
    const { data: subscriptionData, error: subError } = await supabase
      .from("club_subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("user_id", userData.user.id)
      .single();

    if (subError || !subscriptionData) {
      throw new Error("Subscription not found or you don't have permission to cancel it");
    }

    // Cancel the subscription in Stripe if there is a Stripe subscription ID
    if (subscriptionData.stripe_subscription_id) {
      await stripe.subscriptions.update(subscriptionData.stripe_subscription_id, {
        cancel_at_period_end: atPeriodEnd,
      });
    }

    // Update the subscription in Supabase
    const canceledAt = !atPeriodEnd ? new Date().toISOString() : null;
    const { data: updatedSub, error: updateError } = await supabase
      .from("club_subscriptions")
      .update({
        cancel_at_period_end: atPeriodEnd,
        canceled_at: canceledAt,
        status: !atPeriodEnd ? "canceled" : "active",
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update subscription in database: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: atPeriodEnd
          ? "Subscription will be canceled at the end of the current billing period"
          : "Subscription canceled immediately",
        subscription: updatedSub,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error canceling subscription:", errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
