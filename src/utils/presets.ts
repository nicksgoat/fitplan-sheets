
import { Workout, WorkoutWeek, WorkoutProgram } from "@/types/workout";
import { v4 } from "uuid";

// Local storage keys
const WORKOUT_LIBRARY_KEY = "fitplan_workout_library";
const WEEK_LIBRARY_KEY = "fitplan_week_library";
const PROGRAM_LIBRARY_KEY = "fitplan_program_library";

// Get library items from localStorage
export const getWorkoutLibrary = (): Workout[] => {
  try {
    const libraryJSON = localStorage.getItem(WORKOUT_LIBRARY_KEY);
    return libraryJSON ? JSON.parse(libraryJSON) : [];
  } catch (error) {
    console.error("Error loading workout library:", error);
    return [];
  }
};

export const getWeekLibrary = (): WorkoutWeek[] => {
  try {
    const libraryJSON = localStorage.getItem(WEEK_LIBRARY_KEY);
    return libraryJSON ? JSON.parse(libraryJSON) : [];
  } catch (error) {
    console.error("Error loading week library:", error);
    return [];
  }
};

export const getProgramLibrary = (): WorkoutProgram[] => {
  try {
    const libraryJSON = localStorage.getItem(PROGRAM_LIBRARY_KEY);
    return libraryJSON ? JSON.parse(libraryJSON) : [];
  } catch (error) {
    console.error("Error loading program library:", error);
    return [];
  }
};

// Add items to library
export const addWorkoutToLibrary = (workout: Workout): void => {
  try {
    const library = getWorkoutLibrary();
    
    // Generate a new ID to avoid conflicts
    const workoutCopy = {
      ...workout,
      id: v4(),
      savedAt: new Date().toISOString()
    };
    
    library.push(workoutCopy);
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
  } catch (error) {
    console.error("Error saving workout to library:", error);
  }
};

export const addWeekToLibrary = (week: WorkoutWeek): void => {
  try {
    const library = getWeekLibrary();
    
    // Generate a new ID to avoid conflicts
    const weekCopy = {
      ...week,
      id: v4(),
      savedAt: new Date().toISOString()
    };
    
    library.push(weekCopy);
    localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
  } catch (error) {
    console.error("Error saving week to library:", error);
  }
};

export const addProgramToLibrary = (program: WorkoutProgram): void => {
  try {
    const library = getProgramLibrary();
    
    // Generate a new ID to avoid conflicts
    const programCopy = {
      ...program,
      id: v4(),
      savedAt: new Date().toISOString()
    };
    
    library.push(programCopy);
    localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
  } catch (error) {
    console.error("Error saving program to library:", error);
  }
};

// Remove items from library
export const removeWorkoutFromLibrary = (workoutId: string): void => {
  try {
    const library = getWorkoutLibrary();
    const updatedLibrary = library.filter(workout => workout.id !== workoutId);
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(updatedLibrary));
  } catch (error) {
    console.error("Error removing workout from library:", error);
  }
};

export const removeWeekFromLibrary = (weekId: string): void => {
  try {
    const library = getWeekLibrary();
    const updatedLibrary = library.filter(week => week.id !== weekId);
    localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(updatedLibrary));
  } catch (error) {
    console.error("Error removing week from library:", error);
  }
};

export const removeProgramFromLibrary = (programId: string): void => {
  try {
    const library = getProgramLibrary();
    const updatedLibrary = library.filter(program => program.id !== programId);
    localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(updatedLibrary));
  } catch (error) {
    console.error("Error removing program from library:", error);
  }
};
