
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
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    console.log("Creating SQL functions for mobile API...");
    
    // Create get_accessible_workouts function
    const { error: workoutsFnError } = await adminSupabase.rpc('run_sql_query', {
      query: `
        CREATE OR REPLACE FUNCTION public.get_accessible_workouts(
          user_id uuid,
          p_limit integer DEFAULT 10,
          p_offset integer DEFAULT 0
        )
        RETURNS SETOF workouts
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $function$
        DECLARE
          workout_record workouts%rowtype;
        BEGIN
          -- Return workouts created by the user
          FOR workout_record IN 
            SELECT w.* FROM workouts w
            JOIN weeks wk ON w.week_id = wk.id
            JOIN programs p ON wk.program_id = p.id
            WHERE p.user_id = user_id
            LIMIT p_limit OFFSET p_offset
          LOOP
            RETURN NEXT workout_record;
          END LOOP;

          -- Return workouts purchased by the user
          FOR workout_record IN 
            SELECT w.* FROM workouts w
            JOIN workout_purchases wp ON w.id = wp.workout_id
            WHERE wp.user_id = user_id
            AND wp.status = 'completed'
            AND NOT EXISTS ( -- Avoid duplicates from above
              SELECT 1 FROM weeks wk
              JOIN programs p ON wk.program_id = p.id
              WHERE wk.id = w.week_id AND p.user_id = user_id
            )
            LIMIT p_limit OFFSET p_offset
          LOOP
            RETURN NEXT workout_record;
          END LOOP;
          
          -- Return workouts shared with clubs the user is a member of
          FOR workout_record IN 
            SELECT w.* FROM workouts w
            JOIN club_shared_workouts csw ON w.id = csw.workout_id
            JOIN club_members cm ON csw.club_id = cm.club_id
            WHERE cm.user_id = user_id
            AND NOT EXISTS ( -- Avoid duplicates from above
              SELECT 1 FROM weeks wk
              JOIN programs p ON wk.program_id = p.id
              WHERE wk.id = w.week_id AND p.user_id = user_id
            )
            AND NOT EXISTS (
              SELECT 1 FROM workout_purchases wp
              WHERE wp.workout_id = w.id AND wp.user_id = user_id AND wp.status = 'completed'
            )
            LIMIT p_limit OFFSET p_offset
          LOOP
            RETURN NEXT workout_record;
          END LOOP;
          
          RETURN;
        END;
        $function$;
      `
    });
    
    if (workoutsFnError) {
      console.error("Error creating get_accessible_workouts function:", workoutsFnError);
      throw workoutsFnError;
    }
    
    console.log("SQL functions created successfully");
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create SQL functions'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
