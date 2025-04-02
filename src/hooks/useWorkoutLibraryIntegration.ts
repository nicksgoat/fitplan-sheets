
import { useLibrary } from "@/contexts/LibraryContext";
import { useWorkout } from "@/contexts/WorkoutContext";
import { createLibraryProgram, createLibraryWeek, createLibraryWorkout } from "@/utils/presets";
import { useCallback } from "react";
import { toast } from "sonner";

export const useWorkoutLibraryIntegration = () => {
  const { 
    saveWorkout: addWorkoutToLibrary, 
    saveWeek: addWeekToLibrary, 
    saveProgram: addProgramToLibrary 
  } = useLibrary();
  
  const { program, getActiveWorkout, getActiveWeek } = useWorkout();
  
  const saveCurrentWorkoutToLibrary = useCallback((name?: string) => {
    const workout = getActiveWorkout();
    if (!workout) {
      toast.error("No active workout to save");
      return;
    }
    
    const workoutToSave = createLibraryWorkout(
      name || workout.name, 
      workout.exercises
    );
    
    // Set the day number
    workoutToSave.day = workout.day;
    
    addWorkoutToLibrary(workoutToSave, name);
    toast.success(`Workout "${workoutToSave.name}" saved to library`);
  }, [getActiveWorkout, addWorkoutToLibrary]);
  
  const saveCurrentWeekToLibrary = useCallback((name?: string) => {
    const week = getActiveWeek();
    if (!week) {
      toast.error("No active week to save");
      return;
    }
    
    const weekToSave = createLibraryWeek(
      name || week.name,
      week.workouts
    );
    
    addWeekToLibrary(weekToSave, name);
    toast.success(`Week "${weekToSave.name}" saved to library`);
  }, [getActiveWeek, addWeekToLibrary]);
  
  const saveCurrentProgramToLibrary = useCallback((name?: string) => {
    if (!program) {
      toast.error("No program to save");
      return;
    }
    
    const programToSave = createLibraryProgram(
      name || program.name,
      program.workouts,
      program.weeks
    );
    
    addProgramToLibrary(programToSave, name);
    toast.success(`Program "${programToSave.name}" saved to library`);
    
    // Logging to debug if program is being saved correctly
    console.log("Program saved to library:", programToSave);
  }, [program, addProgramToLibrary]);
  
  return {
    saveCurrentWorkoutToLibrary,
    saveCurrentWeekToLibrary,
    saveCurrentProgramToLibrary
  };
};
