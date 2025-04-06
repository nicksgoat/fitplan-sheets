
import { useLibrary } from "@/contexts/LibraryContext";
import { useWorkout } from "@/contexts/WorkoutContext";
import { createLibraryProgram, createLibraryWeek, createLibraryWorkout } from "@/utils/presets";
import { useCallback } from "react";
import { toast } from "sonner";
import { useDrag } from "react-dnd";
import { Workout } from "@/types/workout";

// Define the draggable item type for consistency across components
export const ItemTypes = {
  LIBRARY_WORKOUT: 'library-workout',
  WORKOUT: 'workout'
};

export const useWorkoutLibraryIntegration = () => {
  const { 
    saveWorkout: addWorkoutToLibrary, 
    saveWeek: addWeekToLibrary, 
    saveProgram: addProgramToLibrary,
    workouts: libraryWorkouts 
  } = useLibrary();
  
  // Try to use the WorkoutContext, but handle the case where it might not be available
  let workoutContext;
  try {
    workoutContext = useWorkout();
  } catch (error) {
    // WorkoutContext is not available, provide fallback values
    workoutContext = {
      program: null,
      activeWorkoutId: null,
      activeWeekId: null,
      loadWorkoutFromLibrary: () => {}
    };
  }
  
  const { 
    program, 
    activeWorkoutId, 
    activeWeekId,
    loadWorkoutFromLibrary 
  } = workoutContext;
  
  // Get active workout from program
  const getActiveWorkout = useCallback(() => {
    if (!program || !activeWorkoutId) return null;
    return program.workouts.find(w => w.id === activeWorkoutId) || null;
  }, [program, activeWorkoutId]);
  
  // Get active week from program
  const getActiveWeek = useCallback(() => {
    if (!program || !activeWeekId) return null;
    return program.weeks.find(w => w.id === activeWeekId) || null;
  }, [program, activeWeekId]);
  
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
  
  // Create a hook for making a workout draggable, with onDragStart callback
  const useDraggableLibraryWorkout = (workout: Workout, onDragStart?: () => void) => {
    return useDrag(() => ({
      type: ItemTypes.LIBRARY_WORKOUT,
      item: () => { 
        // Execute the onDragStart callback if provided
        if (onDragStart) {
          onDragStart();
        }
        
        // Return the item data
        return {
          id: workout.id, 
          fromLibrary: true,
          workout: workout // Include the entire workout for easier access
        };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      })
    }));
  };
  
  return {
    saveCurrentWorkoutToLibrary,
    saveCurrentWeekToLibrary: useCallback((name?: string) => {
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
    }, [getActiveWeek, addWeekToLibrary]),
    saveCurrentProgramToLibrary: useCallback((name?: string) => {
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
    }, [program, addProgramToLibrary]),
    useDraggableLibraryWorkout,
    ItemTypes,
    libraryWorkouts
  };
};
