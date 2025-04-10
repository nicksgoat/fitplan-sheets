
import { FC } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { isToday, parseISO } from 'date-fns';
import { Metric } from '@/components/ui/activity-card';

// Calculate metrics based on scheduled/completed workouts
export const calculateMetrics = (activeSchedule: any): Metric[] => {
  if (!activeSchedule) return [];
  
  const todayWorkouts = activeSchedule.scheduledWorkouts.filter((workout: any) => 
    isToday(parseISO(workout.date))
  );
  
  const completedWorkouts = activeSchedule.scheduledWorkouts.filter((workout: any) => 
    workout.completed
  );
  
  const totalWorkouts = activeSchedule.scheduledWorkouts.length;
  
  // Calculate the overall progress percentage
  const progressPercentage = totalWorkouts > 0 
    ? Math.round((completedWorkouts.length / totalWorkouts) * 100) 
    : 0;
  
  // Calculate workout minutes (35 minutes per workout is an estimate)
  const exerciseMinutes = completedWorkouts.length * 35;
  
  // Calculate stand hours (assume 1 hour per completed workout)
  const standHours = completedWorkouts.length;
  
  return [
    { 
      label: "Move", 
      value: `${progressPercentage * 5}`,  // Simulate calories burned
      trend: progressPercentage, 
      unit: "cal" 
    },
    { 
      label: "Exercise", 
      value: `${exerciseMinutes}`, 
      trend: Math.min(100, Math.round((exerciseMinutes / 60) * 100)),
      unit: "min" 
    },
    { 
      label: "Stand", 
      value: `${standHours}`, 
      trend: Math.min(100, standHours * 8),
      unit: "hrs" 
    }
  ];
};

interface ActivityMetricsProps {
  // Any props the component might need
}

const ActivityMetrics: FC<ActivityMetricsProps> = () => {
  const { activeSchedule } = useSchedule();
  const metrics = calculateMetrics(activeSchedule);

  // Return the metrics data for use in the parent component
  return (
    <>
      {/* This component doesn't render UI directly but passes data to parent */}
      {/* This is empty Fragment to satisfy React component requirements */}
    </>
  );
};

export default ActivityMetrics;
