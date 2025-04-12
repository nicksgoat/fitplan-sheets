
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
    console.log("Checkout function started");
    
    // Get request body
    const body = await req.json();
    const { itemType, itemId, itemName, price, userId, creatorId, guestEmail, isGuest, referralSource } = body;
    
    console.log("Request params:", { itemType, itemId, itemName, price, userId });

    if (!itemType || !itemId || !price || (!userId && !guestEmail) || !creatorId) {
      console.log("Missing parameters:", { itemType, itemId, price, userId, creatorId, guestEmail });
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
      console.log("Stripe secret key missing");
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

    console.log("Stripe initialized successfully");

    // Initialize Supabase client for auth user data
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log("Supabase credentials missing");
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized");
    
    // Handle guest vs authenticated user
    let customerEmail = '';
    
    if (isGuest && guestEmail) {
      customerEmail = guestEmail;
      console.log("Using guest email:", guestEmail);
    } else {
      try {
        // Get user email for Stripe customer creation
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (userError || !userData?.email) {
          console.log("Failed to fetch user data:", userError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch user data' }),
            { 
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
        
        customerEmail = userData.email;
        console.log("Using authenticated user email:", customerEmail);
      } catch (error) {
        console.log("Error fetching user data:", error);
        return new Response(
          JSON.stringify({ error: 'Error fetching user data' }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }

    // Calculate platform fee (10%)
    const platformFee = price * 0.1;
    const creatorEarnings = price - platformFee;

    console.log("Creating checkout session with prices:", { 
      total: price, 
      platformFee, 
      creatorEarnings 
    });

    // Create checkout session
    try {
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
          guestEmail: isGuest ? guestEmail : undefined,
          referralSource: referralSource || 'direct'
        },
      });

      console.log("Checkout session created successfully:", { sessionId: session.id });
      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      return new Response(
        JSON.stringify({ error: `Stripe error: ${stripeError.message}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Uncaught error in checkout function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
