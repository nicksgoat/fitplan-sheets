
import { useState, useEffect, useCallback } from "react";
import { 
  getWorkoutLibrary,
  getProgramLibrary,
  getWeekLibrary,
  addWorkoutToLibrary,
  addProgramToLibrary,
  addWeekToLibrary,
  removeWorkoutFromLibrary,
  removeProgramFromLibrary,
  removeWeekFromLibrary
} from "@/utils/presets";
import { Workout, WorkoutProgram, WorkoutWeek } from "@/types/workout";
import { toast } from "sonner";

export function useWorkoutLibrary() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [weeks, setWeeks] = useState<WorkoutWeek[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load data from localStorage
  useEffect(() => {
    setWorkouts(getWorkoutLibrary());
    setPrograms(getProgramLibrary());
    setWeeks(getWeekLibrary());
    setIsLoaded(true);
  }, []);
  
  // Save workout to library
  const saveWorkout = useCallback((workout: Workout, name?: string) => {
    if (name) {
      workout.name = name;
    }
    
    // Make sure we have a savedAt timestamp
    workout.savedAt = workout.savedAt || new Date().toISOString();
    workout.lastModified = new Date().toISOString();
    
    addWorkoutToLibrary(workout);
    setWorkouts(getWorkoutLibrary());
    toast.success("Workout saved to library");
  }, []);
  
  // Save program to library
  const saveProgram = useCallback((program: WorkoutProgram, name?: string) => {
    if (name) {
      program.name = name;
    }
    
    // Make sure we have a savedAt timestamp
    program.savedAt = program.savedAt || new Date().toISOString();
    program.lastModified = new Date().toISOString();
    
    addProgramToLibrary(program);
    setPrograms(getProgramLibrary());
    toast.success("Program saved to library");
  }, []);
  
  // Save week to library
  const saveWeek = useCallback((week: WorkoutWeek, name?: string) => {
    if (name) {
      week.name = name;
    }
    
    // Make sure we have a savedAt timestamp
    week.savedAt = week.savedAt || new Date().toISOString();
    week.lastModified = new Date().toISOString();
    
    addWeekToLibrary(week);
    setWeeks(getWeekLibrary());
    toast.success("Week saved to library");
  }, []);
  
  // Remove workout from library
  const removeWorkout = useCallback((workoutId: string) => {
    removeWorkoutFromLibrary(workoutId);
    setWorkouts(getWorkoutLibrary());
    toast.success("Workout removed from library");
  }, []);
  
  // Remove program from library
  const removeProgram = useCallback((programId: string) => {
    removeProgramFromLibrary(programId);
    setPrograms(getProgramLibrary());
    toast.success("Program removed from library");
  }, []);
  
  // Remove week from library
  const removeWeek = useCallback((weekId: string) => {
    removeWeekFromLibrary(weekId);
    setWeeks(getWeekLibrary());
    toast.success("Week removed from library");
  }, []);
  
  return {
    workouts,
    programs,
    weeks,
    isLoaded,
    saveWorkout,
    saveProgram,
    saveWeek,
    removeWorkout,
    removeProgram,
    removeWeek
  };
}
