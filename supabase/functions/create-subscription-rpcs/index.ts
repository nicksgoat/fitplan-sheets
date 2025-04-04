
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Important: This uses the service role key which has admin privileges.
// This is safe in an Edge Function but would be insecure on the client.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create or verify RPCs for club subscriptions
    const setupResponse = await setupSubscriptionRPCs();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Club subscription RPCs created/updated successfully",
        details: setupResponse
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error creating subscription RPCs:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});

async function setupSubscriptionRPCs() {
  // Define the SQL for creating RPC functions
  const rpcFunctions = `
    -- Function to get user subscriptions
    CREATE OR REPLACE FUNCTION get_user_subscriptions()
    RETURNS SETOF club_subscriptions
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT * FROM club_subscriptions WHERE user_id = auth.uid()
      ORDER BY created_at DESC;
    $$;

    -- Function to get user subscription for a specific club
    CREATE OR REPLACE FUNCTION get_user_club_subscription(
      user_id_param UUID,
      club_id_param UUID
    )
    RETURNS SETOF club_subscriptions
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT * FROM club_subscriptions 
      WHERE user_id = user_id_param
      AND club_id = club_id_param
      ORDER BY created_at DESC
      LIMIT 1;
    $$;

    -- Function to get subscription by session ID
    CREATE OR REPLACE FUNCTION get_subscription_by_session(
      session_id_param TEXT
    )
    RETURNS SETOF club_subscriptions
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT * FROM club_subscriptions 
      WHERE stripe_subscription_id = session_id_param
      ORDER BY created_at DESC
      LIMIT 1;
    $$;
  `;

  // Execute the SQL to create/update functions
  const { error } = await supabase.rpc('run_sql_query', {
    query: rpcFunctions
  });

  if (error) {
    console.error("Error creating RPC functions:", error);
    throw new Error(`Error creating subscription RPCs: ${error.message}`);
  }

  return {
    message: "Subscription RPC functions created or updated successfully",
    functions: [
      "get_user_subscriptions",
      "get_user_club_subscription",
      "get_subscription_by_session"
    ]
  };
}
