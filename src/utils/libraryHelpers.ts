
import { 
  WorkoutSession, 
  WorkoutWeek, 
  WorkoutProgram,
  WeekLibraryItem, 
  ProgramLibraryItem
} from "@/types/workout";
import { getWeekLibrary as getWeekLibraryItems, getProgramLibrary as getProgramLibraryItems } from "./presets";

// Helper functions to extract actual data from library items
export function getWeekLibraryData(): WorkoutWeek[] {
  return getWeekLibraryItems().map(item => item.data);
}

export function getProgramLibraryData(): WorkoutProgram[] {
  return getProgramLibraryItems().map(item => item.data);
}
