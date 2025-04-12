
import React from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import WorkoutTable from './WorkoutTable';
import CircuitControls from './CircuitControls';  // Ensure this import is added

const WorkoutSession = ({ sessionId }: { sessionId: string }) => {
  const { program } = useWorkout();

  // If no program or no session, return null
  if (!program) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{program.name}</h2>
        <CircuitControls sessionId={sessionId} />  // Add this line
      </div>
      <WorkoutTable session={program.workouts.find(w => w.id === sessionId)!} />
    </div>
  );
};

export default WorkoutSession;
