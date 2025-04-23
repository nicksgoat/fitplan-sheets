
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { supabaseClient } = await req.json();
    
    // SQL for creating the get_referral_stats RPC function
    const sql = `
      CREATE OR REPLACE FUNCTION public.get_referral_stats()
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result json;
        user_id uuid;
      BEGIN
        -- Get the user ID from the authenticated user
        user_id := auth.uid();
        
        -- Return stats in a structured JSON object
        SELECT json_build_object(
          'totalReferralCodes', (SELECT COUNT(*) FROM referral_codes WHERE creator_id = user_id),
          'totalReferrals', (SELECT COUNT(*) FROM referral_transactions 
                            JOIN referral_codes ON referral_transactions.referral_code_id = referral_codes.id 
                            WHERE referral_codes.creator_id = user_id),
          'totalCommissionEarnings', COALESCE((SELECT SUM(commission_amount) FROM referral_transactions 
                                             JOIN referral_codes ON referral_transactions.referral_code_id = referral_codes.id 
                                             WHERE referral_codes.creator_id = user_id), 0),
          'totalDiscountGiven', COALESCE((SELECT SUM(discount_amount) FROM referral_transactions 
                                       JOIN referral_codes ON referral_transactions.referral_code_id = referral_codes.id 
                                       WHERE referral_codes.creator_id = user_id), 0),
          'referralSummary', (SELECT json_agg(referral_codes.*) FROM referral_codes 
                             WHERE creator_id = user_id),
          'recentTransactions', (SELECT json_agg(
                               json_build_object(
                                'id', t.id,
                                'referral_code_id', t.referral_code_id,
                                'purchase_amount', t.purchase_amount,
                                'commission_amount', t.commission_amount, 
                                'discount_amount', t.discount_amount,
                                'created_at', t.created_at,
                                'product_type', t.product_type,
                                'product_id', t.product_id,
                                'referral_codes', json_build_object('code', rc.code)
                               )
                             ) FROM referral_transactions t
                              JOIN referral_codes rc ON t.referral_code_id = rc.id
                              WHERE rc.creator_id = user_id
                              ORDER BY t.created_at DESC
                              LIMIT 10)
        ) INTO result;
        
        RETURN result;
      END;
      $$;
    `;
    
    // Execute the SQL to create the function
    const { error } = await supabaseClient.rpc('run_sql_query', { query: sql });
    
    if (error) {
      console.error('Error creating get_referral_stats function:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'get_referral_stats function created successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
