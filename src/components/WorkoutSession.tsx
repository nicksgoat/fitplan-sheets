
import React from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import WorkoutTable from './WorkoutTable';
import CircuitControls from './CircuitControls';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const WorkoutSession = ({ sessionId }: { sessionId: string }) => {
  const { program, addExercise } = useWorkout();

  // If no program or no session, return null
  if (!program) return null;

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
