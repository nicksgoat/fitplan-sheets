
// AI Workout Tools Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import OpenAI from "https://esm.sh/openai@4.0.0"

// Create OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') || '',
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers });
    }

    // Parse request body
    const { currentWorkout, userPrompt, workoutHistory, fileContent, fileName, action } = await req.json();

    // Get session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not authorized' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle different actions
    if (action === 'parse_document') {
      return handleDocumentParsing(fileContent, fileName, headers);
    } else if (action === 'analyze_history') {
      return handleHistoryAnalysis(workoutHistory, headers);
    } else {
      // Default action - process user prompt
      return handleUserPrompt(currentWorkout, userPrompt, headers);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function handleUserPrompt(currentWorkout, userPrompt, headers) {
  // Process user prompt with OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a professional fitness assistant. Help the user create or modify their workout based on their requests."
      },
      {
        role: "user", 
        content: `I'm working on this workout: ${JSON.stringify(currentWorkout)}. ${userPrompt}`
      }
    ],
    temperature: 0.7,
  });

  const aiResponse = response.choices[0].message.content;

  return new Response(
    JSON.stringify({ 
      message: aiResponse,
      suggestions: extractWorkoutSuggestions(aiResponse)
    }),
    { 
      headers: { ...headers, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleDocumentParsing(fileContent, fileName, headers) {
  // Process document content with OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a specialized fitness assistant that converts workout documents into structured workout objects. Extract the workout name, exercises, sets, reps, and any other relevant information."
      },
      {
        role: "user", 
        content: `This is content from a file named "${fileName}". Please convert it to a structured workout format: \n\n${fileContent}`
      }
    ],
    temperature: 0.5,
  });
  
  const aiResponse = response.choices[0].message.content;
  
  // Parse structured workout from AI response
  try {
    // Generate a sample workout as proof of concept
    // In a real implementation, we'd extract this from the AI response
    const workout = {
      id: crypto.randomUUID(),
      name: `Workout from ${fileName}`,
      description: "Generated from uploaded document",
      difficulty: "intermediate",
      duration: 45,
      targetMuscles: ["chest", "triceps", "shoulders"],
      exercises: [
        {
          name: "Bench Press",
          sets: 4,
          reps: "8-10",
          restBetweenSets: "90s",
          notes: "Focus on form"
        },
        {
          name: "Tricep Pushdown",
          sets: 3,
          reps: "12-15",
          restBetweenSets: "60s",
          notes: ""
        }
      ]
    };
    
    return new Response(
      JSON.stringify({ 
        workout,
        aiResponse
      }),
      { 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Failed to parse workout from document",
        aiResponse 
      }),
      { 
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleHistoryAnalysis(workoutHistory, headers) {
  // Process workout history with OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a specialized fitness assistant that analyzes workout history and suggests new workouts based on progressions, patterns, and best practices."
      },
      {
        role: "user", 
        content: `Based on this workout history, create a new progressive workout: ${JSON.stringify(workoutHistory)}`
      }
    ],
    temperature: 0.7,
  });
  
  const aiResponse = response.choices[0].message.content;
  
  // Generate a sample workout as proof of concept
  // In a real implementation, we'd extract this from the AI response
  const workout = {
    id: crypto.randomUUID(),
    name: "Progressive Workout Plan",
    description: "Generated based on your workout history",
    difficulty: "advanced",
    duration: 60,
    targetMuscles: ["full body"],
    exercises: [
      {
        name: "Squat",
        sets: 4,
        reps: "6-8",
        restBetweenSets: "120s",
        notes: "Progressive overload from previous workouts"
      },
      {
        name: "Deadlift",
        sets: 3,
        reps: "8",
        restBetweenSets: "180s",
        notes: ""
      },
      {
        name: "Pull-ups",
        sets: 4,
        reps: "8-10",
        restBetweenSets: "90s",
        notes: ""
      }
    ]
  };
  
  return new Response(
    JSON.stringify({ 
      workout,
      aiResponse
    }),
    { 
      headers: { ...headers, 'Content-Type': 'application/json' } 
    }
  );
}

function extractWorkoutSuggestions(aiResponse) {
  // Extract structured suggestions from AI response
  // This is a placeholder implementation
  return {
    exercises: [],
    modifications: []
  };
}
