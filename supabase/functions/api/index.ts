
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define our API routes with their handlers
const routes = {
  // Workouts API
  'GET /workouts': getWorkouts,
  'GET /workouts/:id': getWorkoutById,
  
  // Programs API
  'GET /programs': getPrograms,
  'GET /programs/:id': getProgramById,
  
  // User data API
  'GET /user/profile': getUserProfile,
  'POST /user/profile': updateUserProfile,
  
  // Club API
  'GET /clubs': getUserClubs,
  'GET /clubs/:id': getClubDetails,
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    
    // Parse the URL and method to determine which handler to use
    const url = new URL(req.url);
    const path = url.pathname.replace('/api', '');
    const method = req.method;
    
    // Find the matching route
    const routePattern = Object.keys(routes).find(route => {
      const [routeMethod, routePath] = route.split(' ');
      if (routeMethod !== method) return false;
      
      // Convert route pattern to regex
      const routeRegex = new RegExp(
        '^' + routePath.replace(/:\w+/g, '([^/]+)') + '$'
      );
      
      return routeRegex.test(path);
    });
    
    if (!routePattern) {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Extract params from the URL if any
    const [routeMethod, routePath] = routePattern.split(' ');
    const paramNames = (routePath.match(/:\w+/g) || [])
      .map(param => param.substring(1));
    
    const pathRegex = new RegExp(
      '^' + routePath.replace(/:\w+/g, '([^/]+)') + '$'
    );
    const paramValues = path.match(pathRegex)?.slice(1) || [];
    
    const params = Object.fromEntries(
      paramNames.map((name, i) => [name, paramValues[i]])
    );
    
    // Create the context object to pass to the handler
    const context = {
      req,
      supabase,
      user: authData.user,
      params,
      url,
      query: Object.fromEntries(url.searchParams),
    };
    
    // Call the handler
    const handler = routes[routePattern];
    return await handler(context);
    
  } catch (error) {
    console.error('API error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Handler implementations
async function getWorkouts(context) {
  const { supabase, user, query } = context;
  const limit = parseInt(query.limit) || 10;
  const offset = parseInt(query.offset) || 0;
  
  // Get workouts the user has access to
  const { data, error } = await supabase.rpc('get_accessible_workouts', {
    user_id: user.id,
    p_limit: limit,
    p_offset: offset
  });
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getWorkoutById(context) {
  const { supabase, user, params } = context;
  const workoutId = params.id;
  
  // Get detailed workout data
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      exercises:exercises(
        id, name, notes,
        sets:exercise_sets(*)
      ),
      weeks:weeks(
        programs:programs(user_id)
      )
    `)
    .eq('id', workoutId)
    .single();
  
  if (error) throw error;
  
  // Check if user has access to this workout
  const hasAccess = await checkWorkoutAccess(supabase, user.id, workoutId);
  if (!hasAccess) {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
  
  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getPrograms(context) {
  const { supabase, user, query } = context;
  const limit = parseInt(query.limit) || 10;
  const offset = parseInt(query.offset) || 0;
  
  // Get programs the user has access to
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .limit(limit)
    .offset(offset);
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getProgramById(context) {
  const { supabase, user, params } = context;
  const programId = params.id;
  
  // Get detailed program data
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      weeks:weeks(
        id, name, order_num,
        workouts:workouts(
          id, name, day_num
        )
      )
    `)
    .eq('id', programId)
    .single();
  
  if (error) throw error;
  
  // Check if user has access to this program
  if (data.user_id !== user.id && !data.is_public) {
    // Check if purchased or club shared
    const hasAccess = await checkProgramAccess(supabase, user.id, programId);
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  }
  
  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getUserProfile(context) {
  const { supabase, user } = context;
  
  // Get user profile data
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function updateUserProfile(context) {
  const { supabase, user, req } = context;
  
  // Parse the request body
  const reqBody = await req.json();
  
  // Fields that are allowed to be updated
  const allowedFields = ['display_name', 'bio', 'website', 'social_links'];
  
  // Filter out any fields that shouldn't be updated
  const updates = Object.fromEntries(
    Object.entries(reqBody)
      .filter(([key]) => allowedFields.includes(key))
  );
  
  // Update the profile
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getUserClubs(context) {
  const { supabase, user } = context;
  
  // Use our existing SQL RPC function to get user clubs
  const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
    body: {
      sqlName: 'get_user_clubs'
    }
  });
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getClubDetails(context) {
  const { supabase, user, params } = context;
  const clubId = params.id;
  
  // Check if user is a member of the club
  const { data: memberData } = await supabase.functions.invoke('run-sql-rpcs', {
    body: {
      sqlName: 'check_club_member',
      params: {
        club_id: clubId,
        user_id: user.id
      }
    }
  });
  
  if (!memberData || !memberData.is_member) {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
  
  // Get club details
  const { data: clubData, error: clubError } = await supabase
    .from('clubs')
    .select(`
      *,
      members:club_members(
        id, user_id, role, 
        status, membership_type
      )
    `)
    .eq('id', clubId)
    .single();
  
  if (clubError) throw clubError;
  
  return new Response(
    JSON.stringify({ data: clubData }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Helper functions
async function checkWorkoutAccess(supabase, userId, workoutId) {
  // 1. Check if user is the creator
  const { data: workoutData } = await supabase
    .from('workouts')
    .select('weeks(programs(user_id))')
    .eq('id', workoutId)
    .maybeSingle();
    
  if (workoutData?.weeks?.programs?.user_id === userId) {
    return true;
  }
  
  // 2. Check if user purchased the workout
  const { data: purchaseData } = await supabase
    .from('workout_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_id', workoutId)
    .eq('status', 'completed')
    .maybeSingle();
    
  if (purchaseData) {
    return true;
  }
  
  // 3. Check if workout is shared with a club the user is a member of
  const { data: sharedData } = await supabase
    .from('club_shared_workouts')
    .select('club_id')
    .eq('workout_id', workoutId);
    
  if (sharedData && sharedData.length > 0) {
    const clubIds = sharedData.map(item => item.club_id);
    
    // Check if user is a member of any of these clubs
    const { data: memberData } = await supabase
      .from('club_members')
      .select('id')
      .eq('user_id', userId)
      .in('club_id', clubIds)
      .maybeSingle();
      
    if (memberData) {
      return true;
    }
  }
  
  return false;
}

async function checkProgramAccess(supabase, userId, programId) {
  // Similar to checkWorkoutAccess but for programs
  
  // 1. Check if user purchased the program
  const { data: purchaseData } = await supabase
    .from('program_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .eq('status', 'completed')
    .maybeSingle();
    
  if (purchaseData) {
    return true;
  }
  
  // 2. Check if program is shared with a club the user is a member of
  const { data: sharedData } = await supabase
    .from('club_shared_programs')
    .select('club_id')
    .eq('program_id', programId);
    
  if (sharedData && sharedData.length > 0) {
    const clubIds = sharedData.map(item => item.club_id);
    
    // Check if user is a member of any of these clubs
    const { data: memberData } = await supabase
      .from('club_members')
      .select('id')
      .eq('user_id', userId)
      .in('club_id', clubIds)
      .maybeSingle();
      
    if (memberData) {
      return true;
    }
  }
  
  return false;
}
