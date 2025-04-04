
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
        console.log(`[JOIN_CLUB] User ${authUser.id} joining club ${params.club_id}`);
        
        try {
          // Check if user is already a member - use admin client to avoid RLS issues
          const { data: existingMember, error: memberCheckError } = await adminSupabase
            .from('club_members')
            .select('*')
            .eq('club_id', params.club_id)
            .eq('user_id', authUser.id)
            .maybeSingle();
            
          console.log("[JOIN_CLUB] Existing member check:", existingMember, memberCheckError);
          
          if (existingMember) {
            console.log("[JOIN_CLUB] User already a member, returning existing membership");
            return new Response(
              JSON.stringify(existingMember),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }
            
          // Insert new membership record with admin client to bypass RLS
          const { data: newMembership, error: insertError } = await adminSupabase
            .from('club_members')
            .insert({
              club_id: params.club_id,
              user_id: authUser.id,
              role: params.role || 'member',
              status: params.status || 'active',
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
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } catch (error) {
          console.error("[JOIN_CLUB] Error:", error);
          throw new Error(`Failed to join club: ${error.message}`);
        }
        
      case 'check_club_member':
        // RPC to check if a user is a member without triggering the infinite recursion
        console.log(`[CHECK_CLUB_MEMBER] Checking if user ${params.user_id || authUser.id} is member of club ${params.club_id}`);
        
        try {
          // Use admin client to bypass RLS policies completely
          const { data: memberData, error: checkError } = await adminSupabase
            .from('club_members')
            .select('*')
            .eq('club_id', params.club_id)
            .eq('user_id', params.user_id || authUser.id)
            .maybeSingle();
            
          console.log("[CHECK_CLUB_MEMBER] Check result:", memberData, checkError);
          
          return new Response(
            JSON.stringify({ 
              is_member: !!memberData, 
              member_data: memberData 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } catch (error) {
          console.error("[CHECK_CLUB_MEMBER] Error:", error);
          throw new Error(`Failed to check club membership: ${error.message}`);
        }
      
      case 'update_member_role':
        // Handle updating member role
        console.log(`[UPDATE_MEMBER_ROLE] Updating role to ${params.role} for member ${params.member_id}`);
        
        try {
          // Update the member role using admin client to bypass RLS
          const { data: updatedMember, error: updateError } = await adminSupabase
            .from('club_members')
            .update({ role: params.role })
            .eq('id', params.member_id)
            .select()
            .single();
            
          console.log("[UPDATE_MEMBER_ROLE] Update result:", updatedMember, updateError);
            
          if (updateError) {
            console.error("[UPDATE_MEMBER_ROLE] Error updating role:", updateError);
            throw updateError;
          }
          
          return new Response(
            JSON.stringify(updatedMember),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } catch (error) {
          console.error("[UPDATE_MEMBER_ROLE] Error:", error);
          throw new Error(`Failed to update member role: ${error.message}`);
        }
      
      case 'leave_club':
        // Handle leaving a club
        console.log(`[LEAVE_CLUB] User ${authUser.id} leaving club ${params.club_id}`);
        
        try {
          // Delete the membership record using admin client to bypass RLS
          const { error: deleteError } = await adminSupabase
            .from('club_members')
            .delete()
            .eq('club_id', params.club_id)
            .eq('user_id', authUser.id);
            
          if (deleteError) {
            console.error("[LEAVE_CLUB] Error leaving club:", deleteError);
            throw deleteError;
          }
          
          console.log("[LEAVE_CLUB] Successfully left club");
          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } catch (error) {
          console.error("[LEAVE_CLUB] Error:", error);
          throw new Error(`Failed to leave club: ${error.message}`);
        }
      
      case 'get_club_members':
        // Get all members of a club
        console.log(`[GET_CLUB_MEMBERS] Getting members for club ${params.club_id}`);
        
        try {
          // First get the raw members data
          const { data: membersData, error: membersError } = await adminSupabase
            .from('club_members')
            .select('*')
            .eq('club_id', params.club_id);
            
          if (membersError) {
            console.error("[GET_CLUB_MEMBERS] Error fetching members:", membersError);
            throw membersError;
          }
          
          // Now fetch the profiles for each member in a separate query
          if (membersData && membersData.length > 0) {
            const userIds = membersData.map(member => member.user_id);
            
            const { data: profilesData, error: profilesError } = await adminSupabase
              .from('profiles')
              .select('*')
              .in('id', userIds);
            
            if (profilesError) {
              console.error("[GET_CLUB_MEMBERS] Error fetching profiles:", profilesError);
            }
            
            // Join the profiles with the members
            const membersWithProfiles = membersData.map(member => {
              const profile = profilesData?.find(p => p.id === member.user_id);
              return { ...member, profile };
            });
            
            console.log(`[GET_CLUB_MEMBERS] Found ${membersWithProfiles.length} members with profiles`);
            
            return new Response(
              JSON.stringify(membersWithProfiles),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }
          
          console.log(`[GET_CLUB_MEMBERS] Found ${membersData?.length || 0} members`);
          
          return new Response(
            JSON.stringify(membersData || []),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } catch (error) {
          console.error("[GET_CLUB_MEMBERS] Error:", error);
          throw new Error(`Failed to get club members: ${error.message}`);
        }
      
      case 'get_user_clubs':
        // Get all clubs that a user is a member of
        console.log(`[GET_USER_CLUBS] Getting clubs for user ${authUser.id}`);
        
        try {
          // First get the club memberships using admin client
          const { data: memberships, error: membershipError } = await adminSupabase
            .from('club_members')
            .select('*')
            .eq('user_id', authUser.id);
          
          if (membershipError) {
            console.error("[GET_USER_CLUBS] Error fetching memberships:", membershipError);
            throw membershipError;
          }
          
          if (!memberships || memberships.length === 0) {
            console.log("[GET_USER_CLUBS] No memberships found");
            return new Response(
              JSON.stringify([]),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }
          
          // Get club details for each membership
          const clubIds = memberships.map(m => m.club_id);
          const { data: clubs, error: clubsError } = await adminSupabase
            .from('clubs')
            .select('*')
            .in('id', clubIds);
          
          if (clubsError) {
            console.error("[GET_USER_CLUBS] Error fetching clubs:", clubsError);
            throw clubsError;
          }
          
          // Join memberships with clubs
          const userClubs = memberships.map(membership => {
            const club = clubs?.find(c => c.id === membership.club_id);
            return club ? { membership, club } : null;
          }).filter(Boolean);
          
          console.log(`[GET_USER_CLUBS] Found ${userClubs.length} user clubs`);
          
          return new Response(
            JSON.stringify(userClubs),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } catch (error) {
          console.error("[GET_USER_CLUBS] Error:", error);
          throw new Error(`Failed to get user clubs: ${error.message}`);
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
