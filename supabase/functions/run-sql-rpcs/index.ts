
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
  
  let authUser = null;
  
  try {
    // Extract user token from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with user's JWT token
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
    
    // Get the current user's ID
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error("Auth error:", authError);
      throw new Error('Unauthorized or invalid token');
    }
    
    authUser = authData.user;
    console.log("Authorized user ID:", authUser.id);
    
    // Parse the request body
    const { sqlName, params } = await req.json();
    console.log(`Processing RPC: ${sqlName}, params:`, params);
    
    let result;
    
    // Execute the appropriate SQL RPC based on the sqlName parameter
    switch (sqlName) {
      case 'join_club':
        // Handle joining a club
        console.log(`[JOIN_CLUB] User ${params.user_id} joining club ${params.club_id}`);
        
        // Check if user is already a member
        const { data: existingMember, error: memberCheckError } = await supabase
          .from('club_members')
          .select('*')
          .eq('club_id', params.club_id)
          .eq('user_id', params.user_id)
          .maybeSingle();
          
        console.log("[JOIN_CLUB] Existing member check:", existingMember, memberCheckError);
        
        if (existingMember) {
          console.log("[JOIN_CLUB] User already a member, returning existing membership");
          return new Response(
            JSON.stringify(existingMember),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
          
        // Insert new membership record directly with SQL
        const { data: newMembership, error: insertError } = await supabase
          .from('club_members')
          .insert({
            club_id: params.club_id,
            user_id: params.user_id,
            role: params.role || 'member',
            status: 'active',
            membership_type: params.membership_type || 'free'
          })
          .select()
          .single();
          
        console.log("[JOIN_CLUB] Insert result:", newMembership, insertError);
          
        if (insertError) {
          console.error("[JOIN_CLUB] Error inserting membership:", insertError);
          throw insertError;
        }
        
        console.log("[JOIN_CLUB] Successfully joined club");
        return new Response(
          JSON.stringify(newMembership),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      // Add other SQL RPCs here as needed
      
      default:
        throw new Error(`Unknown SQL RPC: ${sqlName}`);
    }
  } catch (error) {
    console.error('Error in SQL RPC:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing your request',
        user_id: authUser?.id || null
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
