import React from 'react';
import { Clock, Dumbbell, Tag } from 'lucide-react';
import { Workout } from '@/types/workout';
interface WorkoutStatsProps {
  workout: Workout;
  totalSets: number;
}
const WorkoutStats: React.FC<WorkoutStatsProps> = ({
  workout,
  totalSets
}) => {
  return;
};
export default WorkoutStats;