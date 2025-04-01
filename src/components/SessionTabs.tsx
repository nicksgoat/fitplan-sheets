
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workout } from "@/types/workout";

const SessionTabs: React.FC = () => {
  const { 
    program, 
    activeWorkoutId, 
    activeWeekId, 
    setActiveWorkoutId, 
    addWorkout,
    updateWorkoutName 
  } = useWorkout();
  
  if (!program) return null;
  if (!activeWeekId) return null;
  if (!program.weeks) return null;
  if (!program.workouts) return null;
  
  const currentWeek = program.weeks.find(w => w.id === activeWeekId);
  if (!currentWeek) return null;
  
  // Safely get workouts in the current week
  const workoutsInWeek = currentWeek.workouts
    ? currentWeek.workouts
      .map(workoutId => program.workouts?.find(s => s.id === workoutId))
      .filter(workout => workout !== undefined) as Workout[]
    : [];
  
  // Sort workouts by day number
  const sortedWorkouts = [...workoutsInWeek].sort((a, b) => a.day - b.day);
  
  // Check if we can add more workouts (maximum 7 per week)
  const canAddWorkout = workoutsInWeek.length < 7;
  
  if (workoutsInWeek.length <= 0) return null;
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {sortedWorkouts.map((workout) => (
          <button
            key={workout.id}
            className={cn(
              "px-4 py-2 rounded-t-lg text-sm font-medium relative",
              "transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5",
              activeWorkoutId === workout.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveWorkoutId(workout.id)}
          >
            <Calendar className="h-4 w-4" />
            <span>Day {workout.day}</span>
            {activeWorkoutId === workout.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
        
        {canAddWorkout && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 flex items-center gap-1 text-muted-foreground"
            onClick={() => addWorkout(activeWeekId)}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Add Day</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SessionTabs;
