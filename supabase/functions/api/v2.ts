
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Common types and utilities
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Extended API handler with more mobile-friendly endpoints
 */
export async function handleApiV2Request(req: Request, endpoint: string) {
  try {
    // Extract authentication from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with the user's token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    // Get user data
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Handle different API endpoints
    switch (endpoint) {
      case 'sync':
        return handleSyncRequest(req, supabase, authData.user);
      case 'analytics/workouts':
        return handleWorkoutAnalytics(req, supabase, authData.user);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error(`API v2 error:`, error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

/**
 * Handle data synchronization requests
 */
async function handleSyncRequest(req: Request, supabase: any, user: any) {
  // Get the last sync timestamp from query params
  const url = new URL(req.url);
  const since = url.searchParams.get('since');
  
  try {
    const results = {
      workouts: [],
      programs: [],
      exercises: [],
      workoutLogs: [],
    };
    
    // If 'since' parameter is provided, only get data updated after that timestamp
    const query = since ? `.gt('updated_at', '${since}')` : '';
    
    // Get workouts that the user created or has access to
    const { data: workouts } = await supabase.rpc('get_accessible_workouts', {
      user_id: user.id,
      p_limit: 100,
      p_offset: 0
    });
    
    results.workouts = workouts || [];
    
    // Get programs
    const { data: programs } = await supabase
      .from('programs')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false })
      .limit(100);
      
    results.programs = programs || [];
    
    // Get user's workout logs
    const { data: workoutLogs } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
      
    results.workoutLogs = workoutLogs || [];
    
    // Return all synchronized data
    return new Response(
      JSON.stringify({ data: results, lastSynced: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error synchronizing data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

/**
 * Handle workout analytics requests
 */
async function handleWorkoutAnalytics(req: Request, supabase: any, user: any) {
  try {
    // Get workout log counts over time
    const { data: logCounts, error: logError } = await supabase.rpc('get_workout_log_counts', {
      p_user_id: user.id
    });
    
    if (logError) throw logError;
    
    // Get most used exercise types
    const { data: exerciseData, error: exerciseError } = await supabase.rpc('get_most_used_exercises', {
      p_user_id: user.id,
      p_limit: 5
    });
    
    if (exerciseError) throw exerciseError;
    
    // Calculate workout totals
    const { data: totals, error: totalsError } = await supabase
      .from('workout_logs')
      .select('duration')
      .eq('user_id', user.id);
      
    if (totalsError) throw totalsError;
    
    // Calculate total workout time
    const totalWorkoutTime = totals?.reduce((sum, log) => sum + (log.duration || 0), 0) || 0;
    
    // Calculate workout streak
    const { data: streak, error: streakError } = await supabase.rpc('calculate_workout_streak', {
      p_user_id: user.id
    });
    
    if (streakError) throw streakError;
    
    return new Response(
      JSON.stringify({
        data: {
          logCounts: logCounts || [],
          popularExercises: exerciseData || [],
          totalWorkoutTime,
          workoutCount: totals?.length || 0,
          currentStreak: streak?.current_streak || 0,
          longestStreak: streak?.longest_streak || 0
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error retrieving analytics' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
