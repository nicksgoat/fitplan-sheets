
import { Goal } from '@/components/ui/activity-card';
import { isToday, parseISO } from 'date-fns';
import { useSchedule } from '@/contexts/ScheduleContext';

interface ScheduledGoalListProps {
  onToggleGoal: (goalId: string) => void;
}

// Convert today's workouts to goals
const workoutsToGoals = (scheduledWorkouts: any[]): Goal[] => {
  if (!scheduledWorkouts || scheduledWorkouts.length === 0) return [];
  
  const todayWorkouts = scheduledWorkouts.filter(workout => 
    isToday(parseISO(workout.date))
  );
  
  return todayWorkouts.map(workout => ({
    id: workout.id,
    title: workout.name || `Workout at ${workout.date}`,
    isCompleted: workout.completed
  }));
};

const ScheduledGoalList: React.FC<ScheduledGoalListProps> = ({ onToggleGoal }) => {
  const { activeSchedule } = useSchedule();
  
  // Generate goals from scheduled workouts
  const goals = activeSchedule 
    ? workoutsToGoals(activeSchedule.scheduledWorkouts)
    : [];
    
  return goals.length > 0 
    ? goals 
    : [{ id: "empty", title: "Start a program to see goals here", isCompleted: false }];
};

export default ScheduledGoalList;
