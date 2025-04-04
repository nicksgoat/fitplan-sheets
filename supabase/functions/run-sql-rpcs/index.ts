
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for SQL execution parameters
    const { sqlName, params } = await req.json();
    
    if (!sqlName) {
      throw new Error('SQL name must be provided');
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Execute the stored SQL function by name with optional parameters
    console.log(`Executing SQL function: ${sqlName} with params:`, params);
    
    // Use service role to bypass RLS for certain operations
    let data;
    let error;
    
    if (sqlName === 'join_club' && params.club_id && params.user_id) {
      // Special handling for joining clubs to bypass RLS
      const { data: joinData, error: joinError } = await supabaseAdmin
        .from('club_members')
        .insert({
          club_id: params.club_id,
          user_id: params.user_id,
          role: 'member',
          status: 'active',
          membership_type: 'free'
        })
        .select();
      
      data = joinData;
      error = joinError;
    } else {
      // Regular RPC call for other functions
      const result = await supabaseAdmin.rpc(sqlName, params || {});
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("SQL RPC error:", error);
      throw error;
    }

    console.log("SQL RPC success, data:", data);
    return new Response(
      JSON.stringify({ 
        success: true, 
        data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error executing SQL RPC:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error executing SQL RPC" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
