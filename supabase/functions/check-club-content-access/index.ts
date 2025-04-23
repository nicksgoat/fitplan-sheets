
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Parse request body
    const { contentId, contentType, userId } = await req.json();

    if (!contentId || !contentType) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: contentId and contentType are required" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth token if not provided in request
    let authenticatedUserId = userId;
    if (!authenticatedUserId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        authenticatedUserId = data.user.id;
      } else {
        return new Response(
          JSON.stringify({ error: "Authorization header missing" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check access based on content type
    if (contentType !== "workout" && contentType !== "program") {
      return new Response(
        JSON.stringify({ error: "Invalid content type. Must be 'workout' or 'program'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine table and field names
    const tableName = contentType === "workout" ? "club_shared_workouts" : "club_shared_programs";
    const idField = contentType === "workout" ? "workout_id" : "program_id";

    // Get all clubs that the content is shared with
    const { data: sharedData, error: sharedError } = await supabase
      .from(tableName)
      .select("club_id")
      .eq(idField, contentId);

    if (sharedError) {
      return new Response(
        JSON.stringify({ error: `Error checking shared content: ${sharedError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sharedData || sharedData.length === 0) {
      return new Response(
        JSON.stringify({ 
          hasAccess: false, 
          sharedWithClubs: [],
          message: "Content is not shared with any clubs" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get club IDs that the content is shared with
    const sharedClubIds = sharedData.map(item => item.club_id);

    // Check if user is a member of any of these clubs
    const { data: memberData, error: memberError } = await supabase
      .from("club_members")
      .select("club_id")
      .eq("user_id", authenticatedUserId)
      .eq("status", "active")
      .in("club_id", sharedClubIds);

    if (memberError) {
      return new Response(
        JSON.stringify({ error: `Error checking club membership: ${memberError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine if user has access
    const hasAccess = memberData && memberData.length > 0;
    
    // Get club details for UI display
    let clubDetails = [];
    if (sharedClubIds.length > 0) {
      const { data: clubs } = await supabase
        .from("clubs")
        .select("id, name, logo_url")
        .in("id", sharedClubIds);
        
      clubDetails = clubs || [];
    }

    return new Response(
      JSON.stringify({
        hasAccess,
        sharedWithClubs: sharedClubIds,
        clubDetails,
        memberOfClubs: memberData?.map(m => m.club_id) || []
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
