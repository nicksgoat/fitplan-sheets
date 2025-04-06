
import { useState, useEffect } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { format, parseISO, startOfToday, isToday, isFuture, isPast } from 'date-fns';
import { ActivityCard, Goal, Metric } from '@/components/ui/activity-card';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLibrary } from '@/contexts/LibraryContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WorkoutDetail from '@/components/details/WorkoutDetail';
import ProgramDetail from '@/components/details/ProgramDetail';
import { ItemType } from '@/lib/types';

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
const workoutsToGoals = (scheduledWorkouts: any[]): Goal[] => {
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

const ActivityScheduleCard = () => {
  const { activeSchedule, completeWorkout, getScheduledWorkoutById } = useSchedule();
  const { workouts, programs } = useLibrary();
  
  // Generate goals from scheduled workouts
  const [goals, setGoals] = useState<Goal[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  // Dialogs
  const [showProgramDetail, setShowProgramDetail] = useState(false);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  
  // Update state when activeSchedule changes
  useEffect(() => {
    if (activeSchedule) {
      const updatedGoals = workoutsToGoals(activeSchedule.scheduledWorkouts);
      setGoals(updatedGoals);
      
      // Update metrics
      setMetrics(calculateMetrics(activeSchedule));
    } else {
      setGoals([]);
      setMetrics([]);
    }
  }, [activeSchedule]);
  
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

  const handleViewProgramDetails = () => {
    if (activeSchedule) {
      setShowProgramDetail(true);
    } else {
      toast.error("No active program to view");
    }
  };

  const handleViewWorkoutDetails = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setShowWorkoutDetail(true);
  };
  
  // Find the program in the library
  const programData = activeSchedule && programs.find(p => p.id === activeSchedule.programId);
  
  // Convert program to ItemType for the detail view
  const programItem: ItemType | undefined = programData ? {
    id: programData.id,
    title: programData.name,
    type: 'program',
    creator: 'You',
    imageUrl: 'https://placehold.co/600x400?text=Program',
    tags: ['Program', 'Custom'],
    duration: `${programData.weeks?.length || 0} weeks`,
    difficulty: 'intermediate',
    isFavorite: false,
    description: `${programData.name} - A program with ${programData.workouts?.length || 0} workouts`,
    isCustom: true
  } : undefined;

  // Find the selected workout for the details view
  const selectedWorkoutData = selectedWorkoutId && 
    workouts.find(w => w.id === selectedWorkoutId);

  // Convert workout to ItemType for the detail view 
  const workoutItem: ItemType | undefined = selectedWorkoutData ? {
    id: selectedWorkoutData.id,
    title: selectedWorkoutData.name,
    type: 'workout',
    creator: 'You',
    imageUrl: 'https://placehold.co/600x400?text=Workout',
    tags: ['Workout', 'Custom'],
    duration: `${selectedWorkoutData.exercises.length} exercises`,
    difficulty: 'intermediate',
    isFavorite: false,
    description: `${selectedWorkoutData.name} with ${selectedWorkoutData.exercises.length} exercises`,
    isCustom: true
  } : undefined;

  // Find the scheduled workout if it exists
  const scheduledWorkout = selectedWorkoutId && getScheduledWorkoutById(selectedWorkoutId);
  
  return (
    <>
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
        onViewDetails={handleViewProgramDetails}
      />

      {/* Program Detail Dialog */}
      {programItem && programData && (
        <Dialog open={showProgramDetail} onOpenChange={setShowProgramDetail}>
          <DialogContent className="p-0 border-0 max-w-4xl bg-transparent shadow-none">
            <ProgramDetail 
              item={programItem}
              programData={programData}
              onClose={() => setShowProgramDetail(false)} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Workout Detail Dialog */}
      {workoutItem && selectedWorkoutData && (
        <Dialog open={showWorkoutDetail} onOpenChange={setShowWorkoutDetail}>
          <DialogContent className="p-0 border-0 max-w-4xl bg-transparent shadow-none">
            <WorkoutDetail 
              item={workoutItem}
              workoutData={selectedWorkoutData}
              onClose={() => setShowWorkoutDetail(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ActivityScheduleCard;
