
import React from 'react';
import { Clock, Dumbbell, Tag } from 'lucide-react';
import { Workout } from '@/types/workout';
import { Badge } from '@/components/ui/badge';

interface WorkoutStatsProps {
  workout: Workout;
  totalSets?: number; // Make totalSets optional to prevent errors
}

const WorkoutStats: React.FC<WorkoutStatsProps> = ({
  workout,
  totalSets = 0 // Provide a default value
}) => {
  // Calculate total sets if not provided
  const calculatedTotalSets = totalSets || workout.exercises.reduce((total, exercise) => 
    total + (exercise.sets?.length || 0), 0);
  
  // Determine difficulty based on intensity and number of sets
  const getDifficulty = () => {
    if (calculatedTotalSets > 25) return 'Advanced';
    if (calculatedTotalSets > 15) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-col items-center p-2 bg-dark-300 rounded-md">
        <Dumbbell className="h-4 w-4 mb-1 text-fitbloom-purple" />
        <span className="text-xs text-center">{workout.exercises.length} exercises</span>
      </div>
      <div className="flex flex-col items-center p-2 bg-dark-300 rounded-md">
        <Clock className="h-4 w-4 mb-1 text-fitbloom-purple" />
        <span className="text-xs text-center">{calculatedTotalSets} sets</span>
      </div>
      <div className="flex flex-col items-center p-2 bg-dark-300 rounded-md">
        <Tag className="h-4 w-4 mb-1 text-fitbloom-purple" />
        <Badge className="text-xs px-2 py-0 h-5 bg-amber-600">{getDifficulty()}</Badge>
      </div>
    </div>
  );
};

export default WorkoutStats;
