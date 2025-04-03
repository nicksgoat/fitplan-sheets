
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { purchaseId, reason } = await req.json();
    
    if (!purchaseId) {
      return new Response(
        JSON.stringify({ error: 'Purchase ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if purchase exists and belongs to the user
    const { data: purchase, error: purchaseError } = await supabase
      .from('club_product_purchases')
      .select('*')
      .eq('id', purchaseId)
      .eq('user_id', user.id)
      .single();

    if (purchaseError || !purchase) {
      return new Response(
        JSON.stringify({ error: 'Purchase not found or does not belong to the user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if purchase is eligible for refund (not already refunded and within 30 days)
    if (purchase.status === 'refunded') {
      return new Response(
        JSON.stringify({ error: 'Purchase has already been refunded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const purchaseDateObj = new Date(purchase.purchase_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (purchaseDateObj < thirtyDaysAgo) {
      return new Response(
        JSON.stringify({ error: 'Refund can only be requested within 30 days of purchase' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update purchase with refund request
    const { data: updatedPurchase, error: updateError } = await supabase
      .from('club_product_purchases')
      .update({
        refund_status: 'requested',
        refund_requested_at: new Date().toISOString(),
        refund_reason: reason
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating purchase:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to request refund' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return updated purchase
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Refund requested successfully',
        purchase: updatedPurchase
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refund-request function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
