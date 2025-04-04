
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Set up Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the user from the auth header
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("No authorization token");

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) throw new Error("Authentication failed");
    
    // Get the request params
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    
    if (!action) {
      throw new Error("Action parameter is required");
    }

    let result;
    
    switch (action) {
      case "get_user_subscriptions": {
        // Get all subscriptions for the current user
        const { data, error } = await supabase
          .from("club_subscriptions")
          .select("*")
          .eq("user_id", userData.user.id);
        
        if (error) throw error;
        result = data || [];
        break;
      }
      
      case "get_user_club_subscription": {
        // Get specific club subscription
        const clubId = url.searchParams.get("club_id");
        if (!clubId) throw new Error("club_id parameter is required");
        
        const { data, error } = await supabase
          .from("club_subscriptions")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("club_id", clubId);
        
        if (error) throw error;
        result = data || [];
        break;
      }
      
      case "get_subscription_by_session": {
        // Get subscription by Stripe session ID
        const sessionId = url.searchParams.get("session_id");
        if (!sessionId) throw new Error("session_id parameter is required");
        
        const { data, error } = await supabase
          .from("club_subscriptions")
          .select("*")
          .eq("stripe_session_id", sessionId);
        
        if (error) throw error;
        result = data || [];
        break;
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in subscription RPC: ${errorMessage}`);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
