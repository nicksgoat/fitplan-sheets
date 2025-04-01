
import React, { useEffect } from "react";
import { WorkoutProvider, useWorkout } from "@/contexts/WorkoutContext";
import WorkoutHeader from "@/components/WorkoutHeader";
import WeekTabs from "@/components/WeekTabs";
import SessionTabs from "@/components/SessionTabs";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutMobilePreview from "@/components/WorkoutMobilePreview";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const WorkoutApp: React.FC = () => {
  const { 
    program, 
    activeWorkoutId,
    addWeek,
    addWorkout,
    setActiveWeekId,
    setActiveWorkoutId
  } = useWorkout();
  
  // Initialize with Week 1 and Day 1 when the component loads
  useEffect(() => {
    // Only initialize if there are no weeks yet
    if (program && program.weeks.length === 0) {
      const newWeekId = addWeek();
      // Check if newWeekId is a string before using it
      if (typeof newWeekId === 'string') {
        const newWorkoutId = addWorkout(newWeekId);
        setActiveWeekId(newWeekId);
        if (typeof newWorkoutId === 'string') {
          setActiveWorkoutId(newWorkoutId);
        }
      }
    }
  }, [program, addWeek, addWorkout, setActiveWeekId, setActiveWorkoutId]);
  
  // Handle empty state - no program or empty program (this is a fallback)
  if (!program || program.weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-dark-200 border border-dark-300 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Create Your First Workout</h2>
          <p className="text-gray-400 mb-6">
            Start by creating your first workout day to begin building your training program.
          </p>
          <Button 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={() => {
              // Create a new week
              const newWeekId = addWeek();
              // Check if newWeekId is a string before using it
              if (typeof newWeekId === 'string') {
                const newWorkoutId = addWorkout(newWeekId);
                setActiveWeekId(newWeekId);
                if (typeof newWorkoutId === 'string') {
                  setActiveWorkoutId(newWorkoutId);
                }
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Workout
          </Button>
        </div>
      </div>
    );
  }
  
  // If we have a program but no active workout selected
  if (!activeWorkoutId && program.workouts.length > 0) {
    // Auto-select the first workout
    setActiveWorkoutId(program.workouts[0].id);
    return <div className="text-center py-4">Loading workout...</div>;
  }
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WeekTabs />
          <SessionTabs />
          {activeWorkoutId && (
            <motion.div
              key={activeWorkoutId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <WorkoutSession sessionId={activeWorkoutId} />
            </motion.div>
          )}
        </div>
        
        <div className="hidden lg:block">
          <div className="sticky top-24">
            {activeWorkoutId && (
              <WorkoutMobilePreview sessionId={activeWorkoutId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sheets: React.FC = () => {
  return (
    <WorkoutProvider>
      <div className="min-h-screen py-4 px-4 bg-dark-100 text-white">
        <WorkoutHeader />
        <WorkoutApp />
      </div>
    </WorkoutProvider>
  );
};

export default Sheets;
