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
  'POST /workouts': createWorkout,
  'PUT /workouts/:id': updateWorkout,
  'DELETE /workouts/:id': deleteWorkout,
  
  // Programs API
  'GET /programs': getPrograms,
  'GET /programs/:id': getProgramById,
  'POST /programs': createProgram,
  'PUT /programs/:id': updateProgram,
  'DELETE /programs/:id': deleteProgram,
  
  // User data API
  'GET /user/profile': getUserProfile,
  'POST /user/profile': updateUserProfile,
  
  // Club API
  'GET /clubs': getUserClubs,
  'GET /clubs/:id': getClubDetails,
  
  // Media API
  'POST /media/upload': uploadMedia,
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

// Handler implementations for existing routes
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
  
  // Get detailed workout data with all related exercise data and circuits
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      exercises:exercises(
        id, name, notes, is_circuit, is_in_circuit, circuit_id, circuit_order, 
        is_group, group_id, rep_type, intensity_type, weight_type, library_exercise_id,
        sets:exercise_sets(
          id, reps, weight, intensity, intensity_type, weight_type, rest
        )
      ),
      circuits:circuits(
        id, name, rounds, rest_between_exercises, rest_between_rounds,
        circuit_exercises:circuit_exercises(
          id, exercise_id, exercise_order
        )
      ),
      weeks:weeks(
        id, name, order_num,
        programs:programs(
          id, name, user_id, is_public, price, is_purchasable, slug,
          creator:profiles(
            id, display_name, username, avatar_url
          )
        )
      )
    `)
    .eq('id', workoutId)
    .single();
  
  if (error) throw error;
  
  // Check if user has access to this workout
  const hasAccess = await checkWorkoutAccess(supabase, user.id, workoutId);
  if (!hasAccess && data.weeks?.programs?.user_id !== user.id) {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // Process the data to create a proper structure for mobile
  // Add is_creator flag to make it easier for mobile client
  const isCreator = data.weeks?.programs?.user_id === user.id;
  
  // Get shared clubs information to show on mobile
  const { data: sharedWithClubs, error: sharedError } = await supabase
    .from('club_shared_workouts')
    .select(`
      id, 
      clubs:club_id(
        id, name, logo_url
      )
    `)
    .eq('workout_id', workoutId);
  
  if (sharedError) {
    console.error("Error fetching shared clubs:", sharedError);
  }
  
  // Organize the circuits and their exercises
  const circuitMap = new Map();
  
  if (data.circuits && data.circuits.length > 0) {
    for (const circuit of data.circuits) {
      circuitMap.set(circuit.id, {
        ...circuit,
        exercises: [] // Will be populated with the actual exercise objects
      });
    }
    
    // For each exercise that belongs to a circuit, add it to the appropriate circuit
    if (data.exercises) {
      for (const exercise of data.exercises) {
        if (exercise.is_in_circuit && exercise.circuit_id && circuitMap.has(exercise.circuit_id)) {
          const circuitObj = circuitMap.get(exercise.circuit_id);
          circuitObj.exercises.push(exercise);
        }
      }
      
      // Sort the exercises in each circuit by their order
      for (const circuit of circuitMap.values()) {
        circuit.exercises.sort((a, b) => (a.circuit_order || 0) - (b.circuit_order || 0));
      }
    }
  }
  
  // Convert the Map to an array for the response
  const circuits = Array.from(circuitMap.values());
  
  // Format the response to include all the details
  const enhancedData = {
    ...data,
    circuits: circuits,
    isCreator,
    sharedWithClubs: sharedWithClubs || [],
    hasAccess: true
  };
  
  return new Response(
    JSON.stringify({ data: enhancedData }),
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

// New handlers for content creation and management
async function createWorkout(context) {
  const { supabase, user, req } = context;
  
  try {
    const requestData = await req.json();
    const { name, week_id, day_num } = requestData;
    
    if (!name || !week_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name and week_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Create the workout
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        name,
        week_id,
        day_num: day_num || 1,
        slug
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create a default exercise (mobile apps often expect at least one exercise)
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercises')
      .insert({
        workout_id: data.id,
        name: 'Exercise 1'
      })
      .select()
      .single();
      
    if (exerciseError) throw exerciseError;
    
    // Create a default set for the exercise
    const { error: setError } = await supabase
      .from('exercise_sets')
      .insert({
        exercise_id: exerciseData.id,
        reps: '',
        weight: '',
        intensity: '',
        rest: ''
      });
      
    if (setError) throw setError;
    
    return new Response(
      JSON.stringify({ 
        data,
        message: 'Workout created successfully with default exercise'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error creating workout:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create workout' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function updateWorkout(context) {
  const { supabase, user, params, req } = context;
  const workoutId = params.id;
  
  try {
    const requestData = await req.json();
    const { name, day_num } = requestData;
    
    const updates = {};
    if (name !== undefined) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (day_num !== undefined) updates.day_num = day_num;
    
    // Check for workout ownership or access rights
    const { data: workoutCheck, error: accessError } = await supabase
      .from('workouts')
      .select('week_id')
      .eq('id', workoutId)
      .single();
      
    if (accessError) throw accessError;
    
    // Check if user has rights to this workout through the program
    const { data: weekCheck } = await supabase
      .from('weeks')
      .select('program_id')
      .eq('id', workoutCheck.week_id)
      .single();
      
    if (!weekCheck) throw new Error('Week not found');
    
    const { data: programCheck } = await supabase
      .from('programs')
      .select('user_id')
      .eq('id', weekCheck.program_id)
      .single();
      
    if (!programCheck) throw new Error('Program not found');
    
    // Verify user owns the program or has access
    if (programCheck.user_id !== user.id) {
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
    }
    
    // Update the workout
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ 
        data, 
        message: 'Workout updated successfully'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error updating workout:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update workout' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function deleteWorkout(context) {
  const { supabase, user, params } = context;
  const workoutId = params.id;
  
  try {
    // Check for workout ownership or access rights (same as updateWorkout)
    const { data: workoutCheck, error: accessError } = await supabase
      .from('workouts')
      .select('week_id')
      .eq('id', workoutId)
      .single();
      
    if (accessError) throw accessError;
    
    // Verify ownership chain
    const { data: weekCheck } = await supabase
      .from('weeks')
      .select('program_id')
      .eq('id', workoutCheck.week_id)
      .single();
      
    const { data: programCheck } = await supabase
      .from('programs')
      .select('user_id')
      .eq('id', weekCheck.program_id)
      .single();
      
    if (programCheck.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied: You do not own this workout' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Delete the workout (cascade should handle related records)
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ 
        message: 'Workout deleted successfully'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error deleting workout:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete workout' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function createProgram(context) {
  const { supabase, user, req } = context;
  
  try {
    const requestData = await req.json();
    const { name, is_public = false } = requestData;
    
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Create the program
    const { data: programData, error: programError } = await supabase
      .from('programs')
      .insert({
        name,
        user_id: user.id,
        is_public,
        slug
      })
      .select()
      .single();
    
    if (programError) throw programError;
    
    // Create a default week
    const { data: weekData, error: weekError } = await supabase
      .from('weeks')
      .insert({
        program_id: programData.id,
        name: 'Week 1',
        order_num: 1
      })
      .select()
      .single();
      
    if (weekError) throw weekError;
    
    // Create a default workout for the week
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        week_id: weekData.id,
        name: 'Day 1',
        day_num: 1,
        slug: 'day-1'
      })
      .select()
      .single();
      
    if (workoutError) throw workoutError;
    
    return new Response(
      JSON.stringify({ 
        data: {
          program: programData,
          week: weekData,
          workout: workoutData
        },
        message: 'Program created successfully with default week and workout'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error creating program:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create program' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function updateProgram(context) {
  const { supabase, user, params, req } = context;
  const programId = params.id;
  
  try {
    const requestData = await req.json();
    const { name, is_public } = requestData;
    
    const updates = {};
    if (name !== undefined) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (is_public !== undefined) updates.is_public = is_public;
    
    // Check for program ownership
    const { data: programCheck, error: accessError } = await supabase
      .from('programs')
      .select('user_id')
      .eq('id', programId)
      .single();
      
    if (accessError) throw accessError;
    
    if (programCheck.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied: You do not own this program' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Update the program
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', programId)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ 
        data, 
        message: 'Program updated successfully'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error updating program:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update program' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function deleteProgram(context) {
  const { supabase, user, params } = context;
  const programId = params.id;
  
  try {
    // Check for program ownership
    const { data: programCheck, error: accessError } = await supabase
      .from('programs')
      .select('user_id')
      .eq('id', programId)
      .single();
      
    if (accessError) throw accessError;
    
    if (programCheck.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied: You do not own this program' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Delete the program (cascade should handle related records)
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId);
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ 
        message: 'Program deleted successfully'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error deleting program:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete program' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

// Media upload handler
async function uploadMedia(context) {
  const { supabase, user, req } = context;
  
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'workout'; // workout, profile, exercise
    const relatedId = formData.get('relatedId');
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No file provided or invalid file' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Determine the bucket and path based on the type
    let bucket, path;
    switch (type) {
      case 'profile':
        bucket = 'profiles';
        path = `${user.id}/avatar`;
        break;
      case 'workout':
        bucket = 'workouts';
        path = `${relatedId || 'misc'}/${file.name}`;
        break;
      case 'exercise':
        bucket = 'exercises';
        path = `${relatedId || 'misc'}/${file.name}`;
        break;
      default:
        bucket = 'media';
        path = `${user.id}/${file.name}`;
    }
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return new Response(
      JSON.stringify({ 
        data: { path, publicUrl },
        message: 'File uploaded successfully'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error uploading media:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload file' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
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
