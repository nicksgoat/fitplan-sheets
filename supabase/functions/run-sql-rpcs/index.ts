
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
    
    // Parse the request body
    const { sqlName, params } = await req.json();
    
    // Execute the named SQL function based on the sqlName
    let result;
    let error;
    
    switch (sqlName) {
      case 'get_user_clubs':
        ({ data: result, error } = await getUserClubs(supabase, authData.user.id));
        break;
      case 'get_accessible_workouts':
        ({ data: result, error } = await getAccessibleWorkouts(supabase, authData.user.id, params));
        break;
      case 'check_club_member':
        ({ data: result, error } = await checkClubMember(supabase, params.club_id, authData.user.id));
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown SQL function: ${sqlName}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
    }
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

// SQL function implementations
async function getUserClubs(supabase, userId) {
  return await supabase
    .from('club_members')
    .select(`
      club_id,
      role,
      membership_type,
      clubs:club_id (
        id,
        name,
        description,
        logo_url,
        banner_url,
        club_type,
        membership_type,
        creator_id
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active');
}

async function getAccessibleWorkouts(supabase, userId, params = {}) {
  const limit = params?.limit || 10;
  const offset = params?.offset || 0;
  
  // First get workouts the user has created (via programs)
  const { data: createdWorkouts, error: createdError } = await supabase
    .from('workouts')
    .select(`
      id,
      name,
      day_num,
      created_at,
      updated_at,
      price,
      is_purchasable,
      slug,
      weeks!inner (
        programs!inner (
          user_id
        )
      )
    `)
    .eq('weeks.programs.user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (createdError) throw createdError;
  
  // Then get workouts the user has purchased
  const { data: purchasedWorkouts, error: purchasedError } = await supabase
    .from('workout_purchases')
    .select(`
      workouts:workout_id (
        id,
        name,
        day_num,
        created_at,
        updated_at,
        price,
        is_purchasable,
        slug,
        weeks (
          programs (
            user_id
          )
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });
    
  if (purchasedError) throw purchasedError;
  
  // Then get workouts shared with clubs the user is a member of
  const { data: clubMemberships, error: clubError } = await supabase
    .from('club_members')
    .select('club_id')
    .eq('user_id', userId)
    .eq('status', 'active');
    
  if (clubError) throw clubError;
  
  let sharedWorkouts = [];
  
  if (clubMemberships && clubMemberships.length > 0) {
    const clubIds = clubMemberships.map(membership => membership.club_id);
    
    const { data: sharedData, error: sharedError } = await supabase
      .from('club_shared_workouts')
      .select(`
        workouts:workout_id (
          id,
          name,
          day_num,
          created_at,
          updated_at,
          price,
          is_purchasable,
          slug,
          weeks (
            programs (
              user_id
            )
          )
        )
      `)
      .in('club_id', clubIds)
      .order('created_at', { ascending: false });
      
    if (sharedError) throw sharedError;
    
    if (sharedData) {
      sharedWorkouts = sharedData.map(item => item.workouts);
    }
  }
  
  // Combine all workouts, remove duplicates, and sort
  const purchasedWorkoutsData = purchasedWorkouts
    ? purchasedWorkouts
        .filter(item => item.workouts)
        .map(item => ({
          ...item.workouts,
          accessType: 'purchased'
        }))
    : [];
    
  const sharedWorkoutsData = sharedWorkouts
    .filter(Boolean)
    .map(workout => ({
      ...workout,
      accessType: 'shared'
    }));
    
  const createdWorkoutsData = createdWorkouts
    ? createdWorkouts.map(workout => ({
        ...workout,
        accessType: 'created'
      }))
    : [];
    
  // Combine all workouts
  const allWorkouts = [
    ...createdWorkoutsData,
    ...purchasedWorkoutsData,
    ...sharedWorkoutsData
  ];
  
  // Remove duplicates by workout ID
  const uniqueWorkouts = allWorkouts.filter(
    (workout, index, self) =>
      index === self.findIndex((w) => w.id === workout.id)
  );
  
  // Sort by created date (newest first)
  uniqueWorkouts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  return { data: uniqueWorkouts };
}

async function checkClubMember(supabase, clubId, userId) {
  const { data, error } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
    
  if (error) throw error;
  
  return { data: { is_member: !!data } };
}
