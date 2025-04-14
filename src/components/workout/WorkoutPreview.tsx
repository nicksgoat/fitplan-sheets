
import React from 'react';
import { Workout } from '@/types/workout';
import ExerciseCard from '@/components/workout-preview/ExerciseCard';

interface WorkoutPreviewProps {
  workout: Workout;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout }) => {
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
