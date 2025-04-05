
import React, { useEffect } from "react";
import { WorkoutProvider, useWorkout } from "@/contexts/WorkoutContext";
import WorkoutHeader from "@/components/WorkoutHeader";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutMobilePreview from "@/components/WorkoutMobilePreview";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LibraryProvider } from "@/contexts/LibraryContext";
import WorkoutCalendar from "@/components/workout/WorkoutCalendar";

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
    // Only initialize if the program exists but has no weeks yet
    if (program) {
      if (program.weeks.length === 0) {
        const newWeekId = addWeek();
        // Check if newWeekId is a string before using it
        if (typeof newWeekId === 'string') {
          const newWorkoutId = addWorkout(newWeekId);
          setActiveWeekId(newWeekId);
          if (typeof newWorkoutId === 'string') {
            setActiveWorkoutId(newWorkoutId);
          }
        }
      } else if (program.weeks.length > 0 && !activeWorkoutId) {
        // If we have weeks but no active workout, set the first week and workout
        setActiveWeekId(program.weeks[0].id);
        
        // Find first workout in the active week
        const firstWeekWorkouts = program.weeks[0].workouts;
        if (firstWeekWorkouts.length > 0) {
          setActiveWorkoutId(firstWeekWorkouts[0]);
        } else if (program.workouts.length > 0) {
          // If no workouts in first week, use the first workout regardless of week
          setActiveWorkoutId(program.workouts[0].id);
        }
      }
    }
  }, [program, addWeek, addWorkout, setActiveWeekId, setActiveWorkoutId, activeWorkoutId]);
  
  // Handle empty state - no program or empty program (this is a fallback)
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
  
  // If we have a program but no weeks
  if (program.weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-dark-200 border border-dark-300 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Create Your First Week</h2>
          <p className="text-gray-400 mb-6">
            Start by creating your first week to organize your workouts.
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
            Create New Week
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <WorkoutCalendar onSelectWorkout={(workoutId) => setActiveWorkoutId(workoutId)} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
      <LibraryProvider>
        <div className="min-h-screen py-4 px-4 bg-dark-100 text-white">
          <WorkoutHeader />
          <WorkoutApp />
        </div>
      </LibraryProvider>
    </WorkoutProvider>
  );
};

export default Sheets;
