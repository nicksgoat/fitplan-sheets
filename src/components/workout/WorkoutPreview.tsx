
import React from 'react';
import { Workout } from '@/types/workout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Clock, Tag } from 'lucide-react';

interface WorkoutPreviewProps {
  workout: Workout;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  workout
}) => {
  // Calculate stats
  const totalSets = workout.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0);

  // Get a subset of exercises to preview (first 3)
  const previewExercises = workout.exercises.slice(0, 3);
  
  // Calculate equipment types
  const equipmentTypes = new Set<string>();
  workout.exercises.forEach(exercise => {
    if (exercise.name.toLowerCase().includes('dumbbell')) equipmentTypes.add('Dumbbells');
    if (exercise.name.toLowerCase().includes('barbell')) equipmentTypes.add('Barbell');
    if (exercise.name.toLowerCase().includes('machine')) equipmentTypes.add('Machine');
    if (exercise.name.toLowerCase().includes('cable')) equipmentTypes.add('Cable');
    if (exercise.name.toLowerCase().includes('bodyweight')) equipmentTypes.add('Bodyweight');
  });

  // Determine difficulty based on intensity and number of sets
  const getDifficulty = () => {
    if (totalSets > 25) return 'Advanced';
    if (totalSets > 15) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 bg-dark-300 rounded-md">
          <Dumbbell className="h-4 w-4 mb-1 text-fitbloom-purple" />
          <span className="text-xs text-center">{workout.exercises.length} exercises</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-dark-300 rounded-md">
          <Clock className="h-4 w-4 mb-1 text-fitbloom-purple" />
          <span className="text-xs text-center">{totalSets} sets</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-dark-300 rounded-md">
          <Tag className="h-4 w-4 mb-1 text-fitbloom-purple" />
          <Badge className="text-xs px-2 py-0 h-5 bg-amber-600">{getDifficulty()}</Badge>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-1">Sample Exercise</h4>
        <Card className="bg-dark-300 border-dark-400">
          <CardContent className="p-2">
            {previewExercises.length > 0 && (
              <div key={previewExercises[0].id} className="flex justify-between items-center">
                <span className="font-medium text-sm">{previewExercises[0].name}</span>
                <span className="text-xs text-gray-400">{previewExercises[0].sets?.length || 0} sets</span>
              </div>
            )}
            {workout.exercises.length > 1 && (
              <div className="text-center text-xs text-gray-500 mt-1">
                + {workout.exercises.length - 1} more exercises
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-fitbloom-purple flex-shrink-0" />
        <span className="text-xs text-gray-300">Equipment: {Array.from(equipmentTypes).join(', ') || 'Various'}</span>
      </div>
    </div>
  );
};

export default WorkoutPreview;
