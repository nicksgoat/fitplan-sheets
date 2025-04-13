
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email?: string;
    phone?: string;
    raw_user_meta_data?: {
      name?: string;
    };
  };
  schema: string;
}

serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json();
    
    // Only proceed if this is a new user signup
    if (payload.type !== "INSERT" || payload.table !== "users" || payload.schema !== "auth") {
      return new Response(JSON.stringify({ message: "Not a user insert event" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { id, email, phone, raw_user_meta_data } = payload.record;
    
    // Generate a base for the username from email or phone
    let baseUsername = "";
    if (email) {
      // Extract the part before @ in the email
      baseUsername = email.split("@")[0];
    } else if (phone) {
      // For phone numbers, just use "user" as base
      baseUsername = "user";
    } else {
      baseUsername = "user";
    }
    
    // Clean the username (remove special chars except underscore)
    baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    
    // Make sure username is not too long
    if (baseUsername.length > 20) {
      baseUsername = baseUsername.substring(0, 20);
    }
    
    // Add random numbers to ensure uniqueness
    let username = baseUsername;
    let attempts = 0;
    let usernameUnique = false;
    
    while (!usernameUnique && attempts < 5) {
      // Check if username exists
      const { data: existingUser } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      
      if (!existingUser) {
        usernameUnique = true;
      } else {
        // Add some random digits to make it unique
        username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
        attempts++;
      }
    }
    
    // Create profile with the generated username
    const { error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id,
        username,
        display_name: raw_user_meta_data?.name || baseUsername,
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
    
    return new Response(JSON.stringify({ 
      message: "Profile created successfully", 
      userId: id,
      username
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in webhook handler:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
