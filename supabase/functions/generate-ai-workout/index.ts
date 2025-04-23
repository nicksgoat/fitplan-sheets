
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateWorkoutFromHistory(userId: string, workoutHistory: any[]) {
  console.log("Generating workout from history for user:", userId);
  
  try {
    const prompt = `
You are an expert fitness coach tasked with creating a new workout based on a user's workout history. 
Here are the user's previous workouts: ${JSON.stringify(workoutHistory)}

Based on these workouts, please design a new workout that:
1. Follows a similar pattern but introduces progression
2. Keeps the user's preferred exercise types but adds appropriate variations
3. Maintains a similar intensity level with slight increases where appropriate
4. Follows the FitBloom workout structure with exercises, sets, reps, etc.

Return a structured JSON workout object formatted exactly like this:
{
  "workout": {
    "name": "Generated Workout Name",
    "description": "Brief description of this workout",
    "difficulty": "beginner|intermediate|advanced",
    "duration": estimatedMinutes,
    "targetMuscles": ["primary", "secondary"],
    "exercises": [
      {
        "name": "Exercise Name",
        "sets": 3,
        "reps": "8-10",
        "restBetweenSets": "60s",
        "notes": "Form tips or other notes"
      }
    ]
  }
}

Do not include any explanations, only the JSON response.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a fitness coach AI that creates optimized workout plans." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("OpenAI API response received");
    
    // Extract the generated workout from the response
    const generatedContent = data.choices[0].message.content;
    
    try {
      // Try to parse the response as JSON
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : generatedContent;
      const parsedWorkout = JSON.parse(jsonStr);
      return parsedWorkout;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      // If parsing fails, return the raw content
      return { workout: { error: true, rawContent: generatedContent } };
    }
  } catch (error) {
    console.error("Error generating workout from history:", error);
    return { error: error.message || "Failed to generate workout" };
  }
}

async function processUploadedContent(content: string, contentType: string, userId: string) {
  console.log("Processing uploaded content for user:", userId);
  
  try {
    let prompt = `
You are an expert fitness coach tasked with extracting workout information from the following ${contentType} content and converting it into a structured workout format.

Here is the content:
${content}

Please extract the workout details and structure them into a valid FitBloom workout object formatted exactly like this:
{
  "workout": {
    "name": "Extracted Workout Name",
    "description": "Brief description based on the content",
    "difficulty": "beginner|intermediate|advanced",
    "duration": estimatedMinutes,
    "targetMuscles": ["primary muscle groups targeted"],
    "exercises": [
      {
        "name": "Exercise Name",
        "sets": numberOfSets,
        "reps": "repRange or fixed number",
        "restBetweenSets": "restTimeInSeconds",
        "notes": "Any notes about the exercise from the content"
      }
    ]
  }
}

If the content appears to contain multiple workouts, please process only the first complete workout.
Do not include any explanations, only the JSON response.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a fitness coach AI that extracts and structures workout information." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    console.log("OpenAI API response received for content processing");
    
    // Extract the generated workout from the response
    const generatedContent = data.choices[0].message.content;
    
    try {
      // Try to parse the response as JSON
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : generatedContent;
      const parsedWorkout = JSON.parse(jsonStr);
      return parsedWorkout;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      // If parsing fails, return the raw content
      return { workout: { error: true, rawContent: generatedContent } };
    }
  } catch (error) {
    console.error("Error processing uploaded content:", error);
    return { error: error.message || "Failed to process content" };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { userId, type, workoutHistory, content, contentType } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let result;
    
    if (type === "history") {
      if (!workoutHistory || !Array.isArray(workoutHistory) || workoutHistory.length === 0) {
        return new Response(
          JSON.stringify({ error: "Valid workout history is required" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log("Processing workout history generation");
      result = await generateWorkoutFromHistory(userId, workoutHistory);
    } 
    else if (type === "content") {
      if (!content || !contentType) {
        return new Response(
          JSON.stringify({ error: "Content and content type are required" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log("Processing uploaded content");
      result = await processUploadedContent(content, contentType, userId);
    }
    else {
      return new Response(
        JSON.stringify({ error: "Invalid generation type" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-ai-workout function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
