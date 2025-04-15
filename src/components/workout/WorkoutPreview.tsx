
import React from 'react';
import { Workout } from '@/types/workout';
import ExerciseCard from '@/components/workout-preview/ExerciseCard';
import { EyeOff } from 'lucide-react';

interface WorkoutPreviewProps {
  workout: Workout;
  blurred?: boolean;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout, blurred = false }) => {
  // Create a map of circuit IDs to circuit exercises for efficient lookup
  const circuitMap = new Map();
  
  // Populate the circuit map with exercises that belong to circuits
  workout.exercises.forEach(exercise => {
    if (exercise.isInCircuit && exercise.circuitId) {
      if (!circuitMap.has(exercise.circuitId)) {
        circuitMap.set(exercise.circuitId, []);
      }
      circuitMap.get(exercise.circuitId).push(exercise);
    }
  });
  
  // Get top-level exercises (not in groups, not in circuits)
  const topLevelExercises = workout.exercises.filter(ex => 
    !ex.isInCircuit || (ex.isCircuit && ex.circuitId)
  );

  if (blurred) {
    // For blurred preview, only show the first exercise and blur the rest
    const firstExercise = topLevelExercises[0];
    const remainingCount = topLevelExercises.length - 1;

    return (
      <div className="workout-preview">
        {firstExercise && (
          <ExerciseCard 
            key={firstExercise.id}
            exercise={firstExercise}
            index={0}
            allExercises={workout.exercises}
            circuitMap={circuitMap}
          />
        )}
        
        {remainingCount > 0 && (
          <div className="mt-4 p-4 bg-dark-300/80 rounded-lg backdrop-blur border border-dark-border flex flex-col items-center justify-center text-center gap-2">
            <EyeOff className="h-6 w-6 text-gray-400 mb-1" />
            <p className="text-gray-300 font-medium">
              {remainingCount} more {remainingCount === 1 ? 'exercise' : 'exercises'} available
            </p>
            <p className="text-gray-400 text-sm">
              Purchase this workout to see the complete details
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="workout-preview">
      {topLevelExercises.map((exercise, idx) => (
        <ExerciseCard 
          key={exercise.id}
          exercise={exercise}
          index={idx}
          allExercises={workout.exercises}
          circuitMap={circuitMap}
        />
      ))}
    </div>
  );
};

export default WorkoutPreview;
