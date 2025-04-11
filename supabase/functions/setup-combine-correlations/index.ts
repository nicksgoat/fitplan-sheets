
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
    
    // First create the combine_correlations table if it doesn't exist
    await adminSupabase.rpc('run_sql_query', {
      query: `
        CREATE TABLE IF NOT EXISTS public.combine_correlations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          drill_name TEXT NOT NULL,
          exercise_name TEXT NOT NULL,
          exercise_category TEXT,
          correlation_strength NUMERIC NOT NULL,
          is_direct_measurement BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `
    });
    
    // Add sample correlations between exercises and combine drills
    const { error: clearError } = await adminSupabase.rpc('run_sql_query', {
      query: `TRUNCATE TABLE public.combine_correlations;`
    });
    
    if (clearError) {
      console.error("Error clearing correlations:", clearError);
    }
    
    const correlationsData = [
      // 40-yard dash correlations
      { drill_name: '40yd', exercise_name: '40 Yard Sprint', exercise_category: 'cardio', correlation_strength: 0.95, is_direct_measurement: true },
      { drill_name: '40yd', exercise_name: 'Box Jumps', exercise_category: 'plyometric', correlation_strength: 0.7, is_direct_measurement: false },
      { drill_name: '40yd', exercise_name: 'Squat', exercise_category: 'barbell', correlation_strength: 0.65, is_direct_measurement: false },
      { drill_name: '40yd', exercise_name: 'Deadlift', exercise_category: 'barbell', correlation_strength: 0.6, is_direct_measurement: false },
      { drill_name: '40yd', exercise_name: 'Hill Sprints', exercise_category: 'cardio', correlation_strength: 0.8, is_direct_measurement: false },
      
      // Vertical jump correlations
      { drill_name: 'Vertical', exercise_name: 'Vertical Jump', exercise_category: 'plyometric', correlation_strength: 0.95, is_direct_measurement: true },
      { drill_name: 'Vertical', exercise_name: 'Squat Jump', exercise_category: 'bodyweight', correlation_strength: 0.85, is_direct_measurement: false },
      { drill_name: 'Vertical', exercise_name: 'Calf Raises', exercise_category: 'machine', correlation_strength: 0.6, is_direct_measurement: false },
      { drill_name: 'Vertical', exercise_name: 'Box Jumps', exercise_category: 'plyometric', correlation_strength: 0.8, is_direct_measurement: false },
      { drill_name: 'Vertical', exercise_name: 'Romanian Deadlift', exercise_category: 'barbell', correlation_strength: 0.65, is_direct_measurement: false },
      
      // Bench press correlations
      { drill_name: 'Bench', exercise_name: 'Bench Press', exercise_category: 'barbell', correlation_strength: 0.95, is_direct_measurement: true },
      { drill_name: 'Bench', exercise_name: 'Incline Press', exercise_category: 'barbell', correlation_strength: 0.8, is_direct_measurement: false },
      { drill_name: 'Bench', exercise_name: 'Tricep Extensions', exercise_category: 'cable', correlation_strength: 0.7, is_direct_measurement: false },
      { drill_name: 'Bench', exercise_name: 'Chest Fly', exercise_category: 'machine', correlation_strength: 0.65, is_direct_measurement: false },
      { drill_name: 'Bench', exercise_name: 'Push-ups', exercise_category: 'bodyweight', correlation_strength: 0.6, is_direct_measurement: false },
      
      // Broad jump correlations
      { drill_name: 'Broad Jump', exercise_name: 'Broad Jump', exercise_category: 'plyometric', correlation_strength: 0.95, is_direct_measurement: true },
      { drill_name: 'Broad Jump', exercise_name: 'Squat', exercise_category: 'barbell', correlation_strength: 0.75, is_direct_measurement: false },
      { drill_name: 'Broad Jump', exercise_name: 'Lunges', exercise_category: 'bodyweight', correlation_strength: 0.7, is_direct_measurement: false },
      { drill_name: 'Broad Jump', exercise_name: 'Deadlift', exercise_category: 'barbell', correlation_strength: 0.7, is_direct_measurement: false },
      { drill_name: 'Broad Jump', exercise_name: 'Jump Squats', exercise_category: 'plyometric', correlation_strength: 0.85, is_direct_measurement: false },
      
      // 3-cone correlations
      { drill_name: '3Cone', exercise_name: '3-Cone Drill', exercise_category: 'agility', correlation_strength: 0.95, is_direct_measurement: true },
      { drill_name: '3Cone', exercise_name: 'Lateral Lunges', exercise_category: 'bodyweight', correlation_strength: 0.7, is_direct_measurement: false },
      { drill_name: '3Cone', exercise_name: 'Agility Ladder', exercise_category: 'agility', correlation_strength: 0.8, is_direct_measurement: false },
      { drill_name: '3Cone', exercise_name: 'Lateral Bounds', exercise_category: 'plyometric', correlation_strength: 0.75, is_direct_measurement: false },
      { drill_name: '3Cone', exercise_name: 'Hip Abduction', exercise_category: 'machine', correlation_strength: 0.65, is_direct_measurement: false },
      
      // Shuttle correlations
      { drill_name: 'Shuttle', exercise_name: 'Shuttle Run', exercise_category: 'agility', correlation_strength: 0.95, is_direct_measurement: true },
      { drill_name: 'Shuttle', exercise_name: 'Side Shuffles', exercise_category: 'agility', correlation_strength: 0.8, is_direct_measurement: false },
      { drill_name: 'Shuttle', exercise_name: 'Lateral Box Jumps', exercise_category: 'plyometric', correlation_strength: 0.75, is_direct_measurement: false },
      { drill_name: 'Shuttle', exercise_name: 'Jump Rope', exercise_category: 'cardio', correlation_strength: 0.6, is_direct_measurement: false },
      { drill_name: 'Shuttle', exercise_name: 'T-Drill', exercise_category: 'agility', correlation_strength: 0.85, is_direct_measurement: false },
    ];
    
    // Insert sample correlations
    for (const correlation of correlationsData) {
      const { error: insertError } = await adminSupabase.rpc('run_sql_query', {
        query: `
          INSERT INTO public.combine_correlations 
            (drill_name, exercise_name, exercise_category, correlation_strength, is_direct_measurement)
          VALUES 
            ('${correlation.drill_name}', '${correlation.exercise_name}', '${correlation.exercise_category}', ${correlation.correlation_strength}, ${correlation.is_direct_measurement})
        `
      });
      
      if (insertError) {
        console.error(`Error inserting correlation for ${correlation.drill_name} - ${correlation.exercise_name}:`, insertError);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Combine correlations setup complete",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error setting up combine correlations:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred setting up combine correlations'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
