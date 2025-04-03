
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.5.0?dts";

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
    const { productId, membershipType, clubId, userId } = await req.json();

    if (!clubId || !userId || !membershipType) {
      throw new Error('Missing required parameters: clubId, userId, and membershipType');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get club details to determine price
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (clubError) {
      throw new Error(`Error fetching club: ${clubError.message}`);
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('display_name, username, email')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user profile: ${userError.message}`);
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Handle different membership types
    if (membershipType === 'premium') {
      // For premium membership, create a subscription
      const price = club.premium_price || 9.99;
      const priceInCents = Math.round(price * 100);
      
      // Generate success and cancel URLs
      const origin = req.headers.get('origin') || 'https://fitbloom.app';
      const successUrl = `${origin}/clubs/${clubId}?checkout=success`;
      const cancelUrl = `${origin}/clubs/${clubId}?checkout=cancelled`;
      
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Premium Membership - ${club.name}`,
                description: 'Monthly premium membership',
              },
              unit_amount: priceInCents,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: `${clubId}:${userId}:premium`,
        customer_email: userData.email,
        metadata: {
          clubId,
          userId,
          membershipType: 'premium',
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          url: session.url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (productId) {
      // For VIP products, handle as one-time payment
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('club_products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (productError) {
        throw new Error(`Error fetching product: ${productError.message}`);
      }
      
      // Generate success and cancel URLs
      const origin = req.headers.get('origin') || 'https://fitbloom.app';
      const successUrl = `${origin}/clubs/${clubId}?checkout=success`;
      const cancelUrl = `${origin}/clubs/${clubId}?checkout=cancelled`;
      
      // Create Stripe checkout session for one-time payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: product.price_currency || 'usd',
              product_data: {
                name: product.name,
                description: product.description || 'VIP Product',
              },
              unit_amount: product.price_amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: `${clubId}:${userId}:product:${productId}`,
        customer_email: userData.email,
        metadata: {
          clubId,
          userId,
          productId,
          productType: product.product_type,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          url: session.url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      throw new Error('Invalid request parameters');
    }
  } catch (error) {
    console.error('Error in create-checkout:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred during checkout' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
