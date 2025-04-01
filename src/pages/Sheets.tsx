
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
import PublicLibraryInfo from "@/components/PublicLibraryInfo";

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
    // Only initialize if there are no weeks yet or weeks array is empty
    if (program && program.weeks && program.weeks.length === 0) {
      const newWeekId = addWeek("programId");
      // Check if newWeekId is a string before using it
      if (typeof newWeekId === 'string') {
        setActiveWeekId(newWeekId);
        
        // Find the new week that was just created
        const newWeek = program.weeks.find(w => w.id === newWeekId);
        if (newWeek && newWeek.workouts && newWeek.workouts.length > 0) {
          // Set the first workout in the week as active
          setActiveWorkoutId(newWeek.workouts[0]);
        }
      }
    }
  }, [program, addWeek, setActiveWeekId, setActiveWorkoutId]);
  
  // Handle empty state - no program
  if (!program) {
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
              const newWeekId = addWeek("programId");
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
  
  // Initialize empty program structure if needed
  if (!program.weeks) {
    program.weeks = [];
  }
  
  if (!program.workouts) {
    program.workouts = [];
  }
  
  // If we have a program but no active workout selected and there are workouts available
  if (!activeWorkoutId && program.workouts.length > 0) {
    // Auto-select the first workout
    setActiveWorkoutId(program.workouts[0].id);
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
      
      {/* Public Library Info Widget */}
      <PublicLibraryInfo />
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
