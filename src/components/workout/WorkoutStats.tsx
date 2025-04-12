
import React from 'react';
import { Clock, Dumbbell, Tag } from 'lucide-react';
import { Workout } from '@/types/workout';

interface WorkoutStatsProps {
  workout: Workout;
  totalSets: number;
}

const WorkoutStats: React.FC<WorkoutStatsProps> = ({ workout, totalSets }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center p-3 bg-dark-300 rounded-md">
        <Dumbbell className="h-5 w-5 mr-3 text-fitbloom-purple" />
        <span>{workout.exercises.length} Exercises</span>
      </div>
      <div className="flex items-center p-3 bg-dark-300 rounded-md">
        <Clock className="h-5 w-5 mr-3 text-fitbloom-purple" />
        <span>~{totalSets} Sets Total</span>
      </div>
      <div className="flex items-center p-3 bg-dark-300 rounded-md">
        <Tag className="h-5 w-5 mr-3 text-fitbloom-purple" />
        <span>Day {workout.day}</span>
      </div>
    </div>
  );
};

export default WorkoutStats;
