
import React from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import WorkoutTable from './WorkoutTable';
import CircuitControls from './CircuitControls';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const WorkoutSession = ({ sessionId }: { sessionId: string }) => {
  const { program, addExercise } = useWorkout();
  const navigate = useNavigate();

  // If no program, return null
  if (!program) {
    return (
      <div className="p-4 text-center border border-dashed border-gray-500 rounded-md">
        <p>No program loaded</p>
      </div>
    );
  }

  // Get the current workout
  const currentWorkout = program.workouts.find(w => w.id === sessionId);
  
  // Handle case when currentWorkout is not found
  if (!currentWorkout) {
    return (
      <div className="p-4 text-center border border-dashed border-gray-500 rounded-md">
        <p>Workout not found</p>
        <Button 
          className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          size="sm"
          onClick={() => navigate('/sheets')}
        >
          Return to Workouts
        </Button>
      </div>
    );
  }

  // Navigate to the workout logger
  const handleLogWorkout = () => {
    navigate(`/workout-logger/${currentWorkout.id}?programId=${program.id}`);
  };

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
          <Button 
            onClick={handleLogWorkout} 
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            Log Workout
          </Button>
        </div>
      </div>
      <WorkoutTable session={currentWorkout} />
    </div>
  );
};

export default WorkoutSession;
