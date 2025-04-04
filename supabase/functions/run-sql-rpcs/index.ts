
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
    
    // Always create a separate admin client with service role key
    // This bypasses RLS policies and avoids infinite recursion
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Execute the appropriate SQL RPC based on the sqlName parameter
    switch (sqlName) {
      case 'join_club':
        // Handle joining a club
        console.log(`[JOIN_CLUB] User ${params.user_id} joining club ${params.club_id}`);
        
        try {
          // Check if user is already a member
          const { data: existingMember, error: memberCheckError } = await adminSupabase
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
            
          // Insert new membership record with admin client to bypass RLS
          const { data: newMembership, error: insertError } = await adminSupabase
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
        } catch (error) {
          console.error("[JOIN_CLUB] Error:", error);
          throw new Error(`Failed to join club: ${error.message}`);
        }
        
      case 'check_club_member':
        // New RPC to check if a user is a member without triggering the infinite recursion
        console.log(`[CHECK_CLUB_MEMBER] Checking if user ${params.user_id} is member of club ${params.club_id}`);
        
        try {
          const { data: memberData, error: checkError } = await adminSupabase
            .from('club_members')
            .select('*')
            .eq('club_id', params.club_id)
            .eq('user_id', params.user_id)
            .maybeSingle();
            
          console.log("[CHECK_CLUB_MEMBER] Check result:", memberData, checkError);
          
          return new Response(
            JSON.stringify({ 
              is_member: !!memberData, 
              member_data: memberData 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("[CHECK_CLUB_MEMBER] Error:", error);
          throw new Error(`Failed to check club membership: ${error.message}`);
        }
      
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
