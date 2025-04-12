
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.5.0?dts";

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
    // Get request body
    const { itemType, itemId, itemName, price, userId, creatorId, guestEmail, isGuest } = await req.json();

    if (!itemType || !itemId || !price || (!userId && !guestEmail) || !creatorId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client for auth user data
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Handle guest vs authenticated user
    let customerEmail = '';
    
    if (isGuest && guestEmail) {
      customerEmail = guestEmail;
    } else {
      // Get user email for Stripe customer creation
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError || !userData?.email) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user data' }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      customerEmail = userData.email;
    }

    // Calculate platform fee (10%)
    const platformFee = price * 0.1;
    const creatorEarnings = price - platformFee;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
              description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} purchase`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: itemType === 'club' ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin')}/purchase-success?item=${itemType}&id=${itemId}${isGuest ? '&guest=true' : ''}`,
      cancel_url: `${req.headers.get('origin')}/purchase-cancel`,
      client_reference_id: userId,
      customer_email: customerEmail,
      metadata: {
        itemType,
        itemId,
        userId: isGuest ? `guest_${guestEmail}` : userId,
        creatorId,
        platformFee: platformFee.toFixed(2),
        creatorEarnings: creatorEarnings.toFixed(2),
        isGuest: isGuest ? 'true' : 'false',
        guestEmail: isGuest ? guestEmail : undefined
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
