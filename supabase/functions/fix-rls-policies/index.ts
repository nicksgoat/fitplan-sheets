
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
    // Create Supabase admin client with service role key to bypass RLS
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Execute the SQL to fix club_members RLS policies and fix infinite recursion
    const { data, error } = await adminSupabase.rpc('run_sql_query', {
      query: `
        -- First, drop the problematic RLS policies
        DROP POLICY IF EXISTS "Club admins can manage members" ON public.club_members;
        DROP POLICY IF EXISTS "Club members are viewable by club members" ON public.club_members;
        DROP POLICY IF EXISTS "Users can view their own club memberships" ON public.club_members;
        DROP POLICY IF EXISTS "Users can insert their own club memberships" ON public.club_members;
        
        -- Create security definer functions if they don't exist
        CREATE OR REPLACE FUNCTION public.is_club_admin(club_id_param uuid, user_id_param uuid)
        RETURNS boolean
        LANGUAGE sql
        STABLE SECURITY DEFINER
        AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.club_members
            WHERE club_id = club_id_param 
            AND user_id = user_id_param
            AND (role = 'admin' OR role = 'moderator')
          );
        $$;
        
        CREATE OR REPLACE FUNCTION public.is_club_member_safe(club_id_param uuid, user_id_param uuid)
        RETURNS boolean
        LANGUAGE sql
        STABLE SECURITY DEFINER
        AS $$
          SELECT EXISTS (
            SELECT 1 
            FROM public.club_members 
            WHERE club_id = club_id_param 
            AND user_id = user_id_param
          );
        $$;
        
        -- Recreate policies using security definer functions
        CREATE POLICY "Club admins can manage members safely"
        ON public.club_members
        FOR ALL
        USING (
          public.is_club_admin(club_id, auth.uid())
        );
        
        CREATE POLICY "Club members are viewable by club members safely"
        ON public.club_members
        FOR SELECT
        USING (
          public.is_club_member_safe(club_id, auth.uid())
        );
        
        -- Add policies for user's own records
        CREATE POLICY "Users can view their own club memberships"
        ON public.club_members
        FOR SELECT
        USING (
          user_id = auth.uid()
        );
        
        CREATE POLICY "Users can insert their own club memberships"
        ON public.club_members
        FOR INSERT
        WITH CHECK (
          user_id = auth.uid()
        );
      `
    });
    
    if (error) {
      console.error("Error fixing RLS policies:", error);
      throw error;
    }
    
    // Now fix the club_messages policies
    const { data: messagesData, error: messagesError } = await adminSupabase.rpc('run_sql_query', {
      query: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Messages are viewable by club members" ON public.club_messages;
        DROP POLICY IF EXISTS "Members can create messages" ON public.club_messages;
        
        -- Create club_messages RLS policies
        CREATE POLICY "Members can view club messages"
        ON public.club_messages
        FOR SELECT
        USING (
          public.is_club_member_safe(club_id, auth.uid())
        );
        
        CREATE POLICY "Members can create club messages"
        ON public.club_messages
        FOR INSERT
        WITH CHECK (
          public.is_club_member_safe(club_id, auth.uid())
          AND user_id = auth.uid()
        );
        
        -- Additional policy for updating pinned status (admin only)
        CREATE POLICY "Admins can update message pinned status"
        ON public.club_messages
        FOR UPDATE
        USING (
          public.is_club_admin(club_id, auth.uid())
        )
        WITH CHECK (
          public.is_club_admin(club_id, auth.uid())
        );
      `
    });
    
    if (messagesError) {
      console.error("Error fixing club_messages policies:", messagesError);
      throw messagesError;
    }
    
    // Fix club_events policies
    const { data: eventsData, error: eventsError } = await adminSupabase.rpc('run_sql_query', {
      query: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Events are viewable by club members" ON public.club_events;
        DROP POLICY IF EXISTS "Admins can manage events" ON public.club_events;
        
        -- Create club_events RLS policies
        CREATE POLICY "Members can view club events"
        ON public.club_events
        FOR SELECT
        USING (
          public.is_club_member_safe(club_id, auth.uid())
        );
        
        CREATE POLICY "Admins can manage club events"
        ON public.club_events
        FOR ALL
        USING (
          public.is_club_admin(club_id, auth.uid())
        );
      `
    });
    
    if (eventsError) {
      console.error("Error fixing club_events policies:", eventsError);
      throw eventsError;
    }
    
    // Fix club_posts policies
    const { data: postsData, error: postsError } = await adminSupabase.rpc('run_sql_query', {
      query: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Posts are viewable by club members" ON public.club_posts;
        DROP POLICY IF EXISTS "Members can create posts" ON public.club_posts;
        
        -- Create club_posts RLS policies
        CREATE POLICY "Members can view club posts"
        ON public.club_posts
        FOR SELECT
        USING (
          public.is_club_member_safe(club_id, auth.uid())
        );
        
        CREATE POLICY "Members can create club posts"
        ON public.club_posts
        FOR INSERT
        WITH CHECK (
          public.is_club_member_safe(club_id, auth.uid())
          AND user_id = auth.uid()
        );
        
        -- Users can delete their own posts
        CREATE POLICY "Users can delete their own posts"
        ON public.club_posts
        FOR DELETE
        USING (
          user_id = auth.uid()
        );
      `
    });
    
    if (postsError) {
      console.error("Error fixing club_posts policies:", postsError);
      throw postsError;
    }
    
    // Return the success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "RLS policies fixed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('Error fixing RLS policies:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred fixing RLS policies'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
