
import { useState } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { toast } from 'sonner';
import { useLibrary } from '@/contexts/LibraryContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WorkoutDetail from '@/components/details/WorkoutDetail';
import ProgramDetail from '@/components/details/ProgramDetail';
import { ItemType } from '@/lib/types';
import ActivityMetrics from './ActivityMetrics';
import ScheduledGoalList from './ScheduledGoalList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// This is a component that mimics the ActivityCard in the UI library
// We need to create it since it's not actually exported from the module
const ActivityCard = ({ 
  title, 
  category, 
  metrics, 
  dailyGoals, 
  onToggleGoal, 
  onAddGoal, 
  onViewDetails 
}) => {
  return (
    <Card className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{category}</CardDescription>
          </div>
          {onViewDetails && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewDetails}
              className="text-xs"
            >
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Metrics section */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {Array.isArray(metrics) && metrics.map((metric, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-xs text-gray-400">{metric.label}</div>
              <div className="text-xl font-semibold">{metric.value}</div>
              <div className="text-xs text-gray-400">{metric.unit}</div>
            </div>
          ))}
        </div>

        {/* Daily goals section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Today's Goals</h3>
            {onAddGoal && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onAddGoal}
                className="text-xs"
              >
                Add Goal
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {Array.isArray(dailyGoals) && dailyGoals.map(goal => (
              <div 
                key={goal.id} 
                className="flex items-center gap-2 p-2 rounded-md bg-gray-800/50 cursor-pointer hover:bg-gray-800"
                onClick={() => onToggleGoal(goal.id)}
              >
                <div className={`h-4 w-4 rounded-full ${goal.isCompleted ? 'bg-green-500' : 'border border-gray-400'}`}></div>
                <span className={`text-sm ${goal.isCompleted ? 'line-through text-gray-400' : ''}`}>
                  {goal.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
