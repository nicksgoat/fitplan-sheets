
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
    // Extract user token from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase admin client with service role key to bypass RLS
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Parse the request body
    const { query, params = [] } = await req.json();
    console.log("Executing SQL query:", query);
    console.log("With params:", params);
    
    // Execute the SQL query using the new function
    const { data, error } = await adminSupabase.rpc('run_sql_query_with_params', {
      query: query,
      params_array: Array.isArray(params) ? params : Object.values(params)
    });
    
    if (error) {
      console.error("Error executing SQL query:", error);
      throw error;
    }
    
    console.log("SQL query executed successfully:", data);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: "SQL query executed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('Error executing SQL query:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred executing SQL query'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
