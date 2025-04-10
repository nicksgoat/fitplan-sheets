
import React from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns';
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

const ActivityMetrics: React.FC = () => {
  const { activeSchedule } = useSchedule();
  
  const metrics = calculateMetrics(activeSchedule);
  
  // Return the metrics array directly - this component is meant to be used as a prop value
  return metrics.length > 0 
    ? metrics 
    : [
        { label: "Move", value: "0", trend: 0, unit: "cal" },
        { label: "Exercise", value: "0", trend: 0, unit: "min" },
        { label: "Stand", value: "0", trend: 0, unit: "hrs" }
      ];
};

export default ActivityMetrics;
