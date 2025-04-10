
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
    
    // First create the function if it doesn't exist
    await adminSupabase.rpc('run_sql_query', {
      query: `
        CREATE OR REPLACE FUNCTION public.get_nfl_combine_averages()
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          WITH averages AS (
            SELECT
              '40yd' AS drill_name,
              ROUND(AVG(NULLIF("40yd"::numeric, 0)), 2)::text AS avg_score,
              ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY "40yd"::numeric), 2)::text AS top_score
            FROM "NFL Combine Database"
            WHERE "40yd" IS NOT NULL AND "40yd"::numeric > 0
            
            UNION ALL
            
            SELECT
              'Vertical' AS drill_name,
              ROUND(AVG(NULLIF("Vertical"::numeric, 0)), 2)::text AS avg_score,
              ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY "Vertical"::numeric), 2)::text AS top_score
            FROM "NFL Combine Database"
            WHERE "Vertical" IS NOT NULL AND "Vertical"::numeric > 0
            
            UNION ALL
            
            SELECT
              'Bench' AS drill_name,
              ROUND(AVG(NULLIF("Bench"::numeric, 0)), 2)::text AS avg_score,
              ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY "Bench"::numeric), 2)::text AS top_score
            FROM "NFL Combine Database"
            WHERE "Bench" IS NOT NULL AND "Bench"::numeric > 0
            
            UNION ALL
            
            SELECT
              'Broad Jump' AS drill_name,
              ROUND(AVG(NULLIF("Broad Jump"::numeric, 0)), 2)::text AS avg_score,
              ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY "Broad Jump"::numeric), 2)::text AS top_score
            FROM "NFL Combine Database"
            WHERE "Broad Jump" IS NOT NULL AND "Broad Jump"::numeric > 0
            
            UNION ALL
            
            SELECT
              '3Cone' AS drill_name,
              ROUND(AVG(NULLIF("3Cone"::numeric, 0)), 2)::text AS avg_score,
              ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY "3Cone"::numeric), 2)::text AS top_score
            FROM "NFL Combine Database"
            WHERE "3Cone" IS NOT NULL AND "3Cone"::numeric > 0
            
            UNION ALL
            
            SELECT
              'Shuttle' AS drill_name,
              ROUND(AVG(NULLIF("Shuttle"::numeric, 0)), 2)::text AS avg_score,
              ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY "Shuttle"::numeric), 2)::text AS top_score
            FROM "NFL Combine Database"
            WHERE "Shuttle" IS NOT NULL AND "Shuttle"::numeric > 0
          )
          
          SELECT jsonb_agg(row_to_json(averages)) INTO result
          FROM averages;
          
          RETURN COALESCE(result, '[]'::jsonb);
        END;
        $$;
      `
    });
    
    // Then create a function to calculate a user's combine estimations
    await adminSupabase.rpc('run_sql_query', {
      query: `
        CREATE OR REPLACE FUNCTION public.calculate_user_combine_estimates(user_id_param UUID)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          -- For now return placeholder data
          -- In real implementation, this would calculate based on user_exercise_logs
          
          -- Delete existing estimations for this user
          DELETE FROM user_combine_estimations WHERE user_id = user_id_param;
          
          -- Insert placeholder estimations
          INSERT INTO user_combine_estimations 
            (user_id, drill_name, estimated_score, estimation_type)
          VALUES
            (user_id_param, '40yd', '4.65', 'placeholder'),
            (user_id_param, 'Vertical', '36.5', 'placeholder'),
            (user_id_param, 'Bench', '22', 'placeholder'),
            (user_id_param, 'Broad Jump', '122', 'placeholder'),
            (user_id_param, '3Cone', '6.88', 'placeholder'),
            (user_id_param, 'Shuttle', '4.21', 'placeholder')
          RETURNING jsonb_agg(row_to_json(user_combine_estimations)) INTO result;
          
          RETURN COALESCE(result, '[]'::jsonb);
        END;
        $$;
      `
    });
    
    // Run the averages calculation for immediate testing
    const { data, error } = await adminSupabase.rpc('get_nfl_combine_averages');
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Combine analytics functions created successfully",
        data
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error setting up combine analytics:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred setting up combine analytics'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
