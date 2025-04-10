
import { useState } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { ActivityCard } from '@/components/ui/activity-card';
import { toast } from 'sonner';
import { useLibrary } from '@/contexts/LibraryContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WorkoutDetail from '@/components/details/WorkoutDetail';
import ProgramDetail from '@/components/details/ProgramDetail';
import { ItemType } from '@/lib/types';
import ActivityMetrics from './ActivityMetrics';
import ScheduledGoalList from './ScheduledGoalList';

const ActivityScheduleCard = () => {
  const { activeSchedule, getScheduledWorkoutById } = useSchedule();
  const { workouts, programs } = useLibrary();

  // Dialogs
  const [showProgramDetail, setShowProgramDetail] = useState(false);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const handleToggleGoal = (goalId: string) => {
    // Open workout detail when clicking on a goal
    setSelectedWorkoutId(goalId);
    setShowWorkoutDetail(true);
  };
  
  const handleAddGoal = () => {
    if (!activeSchedule) {
      toast.error("You need an active program to add goals");
      return;
    }
    
    // Navigate to library to start a program
    toast.info("To add workouts to your schedule, start a program from the library.");
  };

  const handleViewProgramDetails = () => {
    if (activeSchedule) {
      setShowProgramDetail(true);
    } else {
      toast.error("No active program to view");
    }
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
  const scheduledWorkout = selectedWorkoutId && getScheduledWorkoutById(selectedWorkoutId);
  
  // Find the actual workout data based on workoutId from the scheduled workout
  const selectedWorkoutData = scheduledWorkout && 
    workouts.find(w => w.id === scheduledWorkout.workoutId);

  // Convert workout to ItemType for the detail view 
  const workoutItem: ItemType | undefined = selectedWorkoutData ? {
    id: selectedWorkoutData.id,
    title: scheduledWorkout?.name || selectedWorkoutData.name,
    type: 'workout',
    creator: 'You',
    imageUrl: 'https://placehold.co/600x400?text=Workout',
    tags: ['Workout', 'Custom'],
    duration: `${selectedWorkoutData.exercises.length} exercises`,
    difficulty: 'intermediate',
    isFavorite: false,
    description: `${scheduledWorkout?.name || selectedWorkoutData.name} with ${selectedWorkoutData.exercises.length} exercises`,
    isCustom: true
  } : undefined;

  return (
    <>
      <ActivityCard
        title={activeSchedule ? "Today's Progress" : "No Active Program"}
        category={activeSchedule ? `Program: ${activeSchedule.programName || "Active Program"}` : "Schedule"}
        metrics={<ActivityMetrics />}
        dailyGoals={<ScheduledGoalList onToggleGoal={handleToggleGoal} />}
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
