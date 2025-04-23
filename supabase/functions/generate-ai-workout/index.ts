
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_KEY ?? ''
    );

    // Get the workout generation parameters from the request
    const {
      userId,
      fitnessLevel,
      targetMuscles = [],
      duration,
      equipment = [],
      goals,
      additionalNotes
    } = await req.json();

    // Validate required parameters
    if (!userId || !fitnessLevel || targetMuscles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-ai-workout] Generating workout for user ${userId}`, {
      fitnessLevel,
      targetMuscles,
      duration,
      equipment,
      goals
    });

    // Create the prompt for the AI
    const systemPrompt = `You are an expert fitness trainer specializing in creating personalized workout plans. 
    Create a detailed workout routine based on the user's requirements. Format your response as a JSON object with the following structure:
    {
      "name": "Workout name",
      "description": "Brief description of the workout",
      "difficulty": "beginner|intermediate|advanced",
      "duration": Number of minutes,
      "targetMuscles": ["muscle1", "muscle2"],
      "exercises": [
        {
          "name": "Exercise name",
          "sets": Number of sets,
          "reps": "Repetition count or range (e.g., '10' or '8-12')",
          "restBetweenSets": "Rest period in seconds",
          "notes": "Any specific instructions"
        }
      ]
    }
    Make sure the workout is tailored to the user's fitness level, equipment availability, and goals. The response should be valid JSON.`;

    const userPrompt = `Create a workout plan with these requirements:
    - Fitness level: ${fitnessLevel}
    - Target muscles: ${targetMuscles.join(', ')}
    - Workout duration: ${duration || 'flexible'} minutes
    - Available equipment: ${equipment.length > 0 ? equipment.join(', ') : 'bodyweight only'}
    - Goals: ${goals || 'general fitness'}
    ${additionalNotes ? `- Additional notes: ${additionalNotes}` : ''}`;

    // Call OpenAI to generate the workout
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-ai-workout] Calling OpenAI API');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('[generate-ai-workout] OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate workout', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    const workoutContent = openAIData.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let parsedWorkout;
    try {
      // Extract JSON from the response (in case it includes markdown formatting)
      const jsonMatch = workoutContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedWorkout = JSON.parse(jsonMatch[0]);
      } else {
        parsedWorkout = JSON.parse(workoutContent);
      }
    } catch (error) {
      console.error('[generate-ai-workout] Error parsing OpenAI response:', error, workoutContent);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse generated workout', 
          rawContent: workoutContent 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the generated workout in the database
    const { data: workoutTemplate, error: templateError } = await supabase
      .from('ai_workout_templates')
      .insert({
        name: parsedWorkout.name,
        description: parsedWorkout.description,
        difficulty: parsedWorkout.difficulty,
        target_muscles: parsedWorkout.targetMuscles,
        duration: parsedWorkout.duration,
        created_by: userId,
        metadata: {
          exercises: parsedWorkout.exercises,
          equipment: equipment
        }
      })
      .select()
      .single();

    if (templateError) {
      console.error('[generate-ai-workout] Error saving workout template:', templateError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save workout template', 
          details: templateError.message,
          workout: parsedWorkout
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the generation in history
    const { error: historyError } = await supabase
      .from('ai_workout_generations')
      .insert({
        user_id: userId,
        prompt: userPrompt,
        result_workout_id: workoutTemplate.id,
        parameters: {
          fitnessLevel,
          targetMuscles,
          duration,
          equipment,
          goals,
          additionalNotes
        }
      });

    if (historyError) {
      console.error('[generate-ai-workout] Error saving generation history:', historyError);
      // We continue even if history saving fails
    }

    // Return the generated workout
    return new Response(
      JSON.stringify({ 
        workout: {
          ...parsedWorkout,
          id: workoutTemplate.id,
          created_at: workoutTemplate.created_at
        },
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-ai-workout] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
