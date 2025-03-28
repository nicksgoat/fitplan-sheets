
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workout } from "@/types/workout";

const SessionTabs: React.FC = () => {
  const { program, activeWorkoutId, activeWeekId, setActiveWorkoutId, addWorkout } = useWorkout();
  
  if (!program) return null;
  if (!activeWeekId) return null;
  
  const currentWeek = program.weeks.find(w => w.id === activeWeekId);
  if (!currentWeek) return null;
  
  // Safely get workouts in the current week
  const workoutsInWeek = currentWeek.workouts
    ? currentWeek.workouts
      .map(workoutId => program.workouts?.find(s => s.id === workoutId))
      .filter(workout => workout !== undefined) as Workout[]
    : [];
  
  if (workoutsInWeek.length <= 0) return null;
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {workoutsInWeek.map((workout) => (
          <button
            key={workout.id}
            className={cn(
              "px-4 py-2 rounded-t-lg text-sm font-medium relative",
              "transition-colors duration-200 whitespace-nowrap",
              activeWorkoutId === workout.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveWorkoutId(workout.id)}
          >
            {workout.name}
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
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2 flex items-center gap-1 text-muted-foreground"
          onClick={() => addWorkout(activeWeekId)}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Add Session</span>
        </Button>
      </div>
    </div>
  );
};

export default SessionTabs;
