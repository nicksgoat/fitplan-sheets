
import React, { useMemo } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { Exercise, Workout } from '@/types/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import ExerciseCard from '@/components/workout-preview/ExerciseCard';
import { formatDuration } from '@/utils/timeUtils';

interface WorkoutMobilePreviewProps {
  sessionId: string;
}

const WorkoutMobilePreview: React.FC<WorkoutMobilePreviewProps> = ({ sessionId }) => {
  const { program } = useWorkout();
  
  const workout = useMemo(() => {
    if (!program) return null;
    return program.workouts.find(w => w.id === sessionId) || null;
  }, [program, sessionId]);
  
  // Calculate total estimated time
  const estimatedTime = useMemo(() => {
    if (!workout) return 0;
    
    // Rough estimate: 45 seconds per set + rest times
    let totalSeconds = 0;
    
    workout.exercises.forEach(exercise => {
      if (!exercise.isCircuit) {
        exercise.sets.forEach(set => {
          // 45 seconds per set
          totalSeconds += 45;
          
          // Add rest time if specified
          if (set.rest) {
            const restSeconds = parseInt(set.rest);
            if (!isNaN(restSeconds)) {
              totalSeconds += restSeconds;
            }
          }
        });
      }
    });
    
    // Add circuit time estimates
    const circuits = workout.circuits || [];
    circuits.forEach(circuit => {
      // Estimate 2 minutes per exercise in circuit
      totalSeconds += (circuit.exercises.length * 120);
    });
    
    return totalSeconds;
  }, [workout]);
  
  // Create map of circuit IDs to array of exercises in that circuit
  const circuitMap = useMemo(() => {
    if (!workout) return new Map<string, Exercise[]>();
    
    const map = new Map<string, Exercise[]>();
    
    workout.exercises.forEach(exercise => {
      if (exercise.isInCircuit && exercise.circuitId) {
        if (!map.has(exercise.circuitId)) {
          map.set(exercise.circuitId, []);
        }
        map.get(exercise.circuitId)?.push(exercise);
      }
    });
    
    // Sort circuit exercises by circuit order if available
    map.forEach((exercises, circuitId) => {
      map.set(
        circuitId,
        [...exercises].sort((a, b) => {
          if (a.circuitOrder !== undefined && b.circuitOrder !== undefined) {
            return a.circuitOrder - b.circuitOrder;
          }
          return 0;
        })
      );
    });
    
    return map;
  }, [workout]);
  
  if (!workout) {
    return (
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Workout Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400 flex flex-col items-center justify-center py-12">
            <Dumbbell className="w-8 h-8 mb-2 text-gray-500" />
            <p>No workout selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const nonCircuitExercises = workout.exercises.filter(
    exercise => !exercise.isInCircuit || !exercise.circuitId
  );
  
  return (
    <Card className="bg-dark-200 border-dark-300 overflow-hidden">
      <CardHeader className="pb-2 border-b border-dark-300">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{workout.name}</CardTitle>
          <div className="text-xs text-gray-400">
            {formatDuration(estimatedTime)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 max-h-[calc(100vh-220px)] overflow-y-auto hide-scrollbar">
        {nonCircuitExercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            allExercises={workout.exercises}
            circuitMap={circuitMap}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default WorkoutMobilePreview;
