
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
    // Create Supabase admin client with service role key to bypass RLS
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Execute the SQL to create the function
    const { data, error } = await adminSupabase.rpc('run_sql_query', {
      query: `
        CREATE OR REPLACE FUNCTION public.run_sql_query(query text)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          EXECUTE 'WITH query_result AS (' || query || ') 
                   SELECT jsonb_agg(row_to_json(query_result)) FROM query_result' INTO result;
          RETURN COALESCE(result, '[]'::jsonb);
        EXCEPTION WHEN OTHERS THEN
          RAISE EXCEPTION 'SQL Error: %', SQLERRM;
        END;
        $$;
      `
    });
    
    if (error) {
      console.error("Error creating SQL function:", error);
      throw error;
    }
    
    console.log("SQL function created successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "SQL function created successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating SQL function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred creating SQL function'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
