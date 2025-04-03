
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { userId, clubId } = await req.json();

    if (!userId || !clubId) {
      throw new Error('Missing required parameters: userId and clubId');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user has a membership for this club
    const { data, error } = await supabase
      .from('club_members')
      .select('*')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message, hasSubscription: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Check if premium membership has expired
    let hasPremium = false;
    if (data.membership_type === 'premium') {
      const premiumExpires = data.premium_expires_at ? new Date(data.premium_expires_at) : null;
      hasPremium = premiumExpires ? premiumExpires > new Date() : false;
    }

    return new Response(
      JSON.stringify({
        hasSubscription: true,
        membershipType: data.membership_type,
        hasPremium: hasPremium,
        premiumExpiresAt: data.premium_expires_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
