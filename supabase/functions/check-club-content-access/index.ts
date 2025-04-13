
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const body = await req.json();
    const { userId, contentId, contentType } = body;
    
    if (!userId || !contentId || !contentType || !['workout', 'program'].includes(contentType)) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters or invalid content type',
          hasAccess: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration', hasAccess: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if the content is shared with any clubs that the user is a member of
    const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
    
    // Get clubs that the content is shared with
    const { data: sharedData, error: sharedError } = await supabase
      .from(tableName)
      .select('club_id')
      .eq(`${contentType}_id`, contentId);
    
    if (sharedError) {
      console.error(`Error checking shared ${contentType}:`, sharedError);
      return new Response(
        JSON.stringify({ error: `Error checking shared ${contentType}`, hasAccess: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // If not shared with any clubs, return no access
    if (!sharedData || sharedData.length === 0) {
      return new Response(
        JSON.stringify({ hasAccess: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Get the club IDs the content is shared with
    const clubIds = sharedData.map(item => item.club_id);
    
    // Check if the user is a member of any of these clubs
    const { data: memberData, error: memberError } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('club_id', clubIds);
    
    if (memberError) {
      console.error("Error checking club membership:", memberError);
      return new Response(
        JSON.stringify({ error: 'Error checking club membership', hasAccess: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // If user is a member of at least one club the content is shared with, grant access
    const hasAccess = memberData && memberData.length > 0;
    
    return new Response(
      JSON.stringify({ hasAccess, sharedWithClubs: clubIds }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error in check-club-content-access:", error);
    return new Response(
      JSON.stringify({ error: error.message, hasAccess: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
