
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
      throw new Error('Unauthorized or invalid token');
    }
    
    const userId = authData.user.id;
    
    // Parse the request body
    const { action, club_id } = await req.json();
    
    let result;
    
    switch (action) {
      case 'get_user_subscriptions':
        // Get all subscriptions for the current user
        result = await supabase
          .from('club_subscriptions')
          .select('*')
          .eq('user_id', userId);
        break;
        
      case 'get_user_club_subscription':
        // Get subscription for a specific club
        if (!club_id) {
          throw new Error('club_id is required for this action');
        }
        
        result = await supabase
          .from('club_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('club_id', club_id);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return new Response(
      JSON.stringify(result.data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in get-subscription-rpcs:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing your request'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
