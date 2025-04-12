
import React from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import WorkoutTable from './WorkoutTable';
import CircuitControls from './CircuitControls';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { buildCreatorProductUrl, generateSlug } from '@/utils/urlUtils';
import { useNavigate } from 'react-router-dom';

const WorkoutSession = ({ sessionId }: { sessionId: string }) => {
  const { program, addExercise } = useWorkout();
  const { user } = useAuth();
  const navigate = useNavigate();

  // If no program or no session, return null
  if (!program) return null;

  // Get the current workout
  const currentWorkout = program.workouts.find(w => w.id === sessionId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{program.name}</h2>
        <div className="flex items-center gap-2 justify-end">
          <CircuitControls sessionId={sessionId} />
          <Button 
            onClick={() => addExercise(sessionId)} 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Exercise
          </Button>
        </div>
      </div>
      <WorkoutTable session={program.workouts.find(w => w.id === sessionId)!} />
    </div>
  );
};

export default WorkoutSession;
