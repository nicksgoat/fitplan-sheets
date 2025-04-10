
import { FC } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { isToday, parseISO, format } from 'date-fns';
import { Goal } from '@/components/ui/activity-card';

// Convert today's workouts to goals
export const workoutsToGoals = (scheduledWorkouts: any[]): Goal[] => {
  if (!scheduledWorkouts || scheduledWorkouts.length === 0) return [];
  
  const todayWorkouts = scheduledWorkouts.filter(workout => 
    isToday(parseISO(workout.date))
  );
  
  return todayWorkouts.map(workout => ({
    id: workout.id,
    title: workout.name || `Workout at ${format(parseISO(workout.date), 'h:mm a')}`,
    isCompleted: workout.completed
  }));
};

interface ScheduledGoalListProps {
  onToggleGoal?: (goalId: string) => void;
}

const ScheduledGoalList: FC<ScheduledGoalListProps> = ({ onToggleGoal }) => {
  const { activeSchedule } = useSchedule();
  const goals = activeSchedule ? workoutsToGoals(activeSchedule.scheduledWorkouts) : [];

  return { goals };
};

export default ScheduledGoalList;
