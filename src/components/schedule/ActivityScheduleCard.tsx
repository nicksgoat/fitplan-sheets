
import { useState, useEffect } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { format, parseISO, startOfToday, isToday, isFuture, isPast } from 'date-fns';
import { ActivityCard, Goal, Metric } from '@/components/ui/activity-card';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Calculate metrics based on scheduled/completed workouts
const calculateMetrics = (activeSchedule: any): Metric[] => {
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

// Convert today's workouts to goals
const workoutsToGoals = (activeSchedule: any): Goal[] => {
  if (!activeSchedule) return [];
  
  const todayWorkouts = activeSchedule.scheduledWorkouts.filter((workout: any) => 
    isToday(parseISO(workout.date))
  );
  
  return todayWorkouts.map((workout: any) => ({
    id: workout.id,
    title: workout.name || `Workout at ${format(parseISO(workout.date), 'h:mm a')}`,
    isCompleted: workout.completed
  }));
};

const ActivityScheduleCard = () => {
  const { activeSchedule, completeWorkout } = useSchedule();
  const { workouts } = useLibrary();
  
  // Generate goals from scheduled workouts
  const [goals, setGoals] = useState<Goal[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  
  // Update state when activeSchedule changes
  useEffect(() => {
    if (activeSchedule) {
      // Enhance scheduled workouts with names from the library
      const enhancedWorkouts = activeSchedule.scheduledWorkouts.map((sw: any) => {
        const workoutData = workouts.find(w => w.id === sw.workoutId);
        return {
          ...sw,
          name: workoutData?.name || 'Unknown Workout'
        };
      });
      
      // Update the goals with real workout data
      const todayWorkouts = enhancedWorkouts.filter((workout: any) => 
        isToday(parseISO(workout.date))
      );
      
      const updatedGoals = todayWorkouts.map((workout: any) => ({
        id: workout.id,
        title: workout.name,
        isCompleted: workout.completed
      }));
      
      setGoals(updatedGoals);
      
      // Update metrics
      setMetrics(calculateMetrics({
        ...activeSchedule,
        scheduledWorkouts: enhancedWorkouts
      }));
    } else {
      setGoals([]);
      setMetrics([]);
    }
  }, [activeSchedule, workouts]);
  
  const handleToggleGoal = (goalId: string) => {
    completeWorkout(goalId);
    
    // Update local state immediately for responsive UI
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, isCompleted: true }
        : goal
    ));
    
    // Show success toast
    toast.success("Workout marked as completed!");
  };
  
  const handleAddGoal = () => {
    if (!activeSchedule) {
      toast.error("You need an active program to add goals");
      return;
    }
    
    // Navigate to library to start a program
    // This is a placeholder - in a real app, you'd have a workflow to add a custom workout
    toast.info("To add workouts to your schedule, start a program from the library.");
  };
  
  return (
    <ActivityCard
      title={activeSchedule ? "Today's Progress" : "No Active Program"}
      category={activeSchedule ? `Program: ${activeSchedule.programName || "Active Program"}` : "Schedule"}
      metrics={metrics.length > 0 ? metrics : [
        { label: "Move", value: "0", trend: 0, unit: "cal" },
        { label: "Exercise", value: "0", trend: 0, unit: "min" },
        { label: "Stand", value: "0", trend: 0, unit: "hrs" }
      ]}
      dailyGoals={goals.length > 0 ? goals : [
        { id: "empty", title: "Start a program to see goals here", isCompleted: false }
      ]}
      onAddGoal={handleAddGoal}
      onToggleGoal={handleToggleGoal}
      onViewDetails={() => {
        // Navigate to schedule details
      }}
    />
  );
};

export default ActivityScheduleCard;
