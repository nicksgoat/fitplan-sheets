
import { Workout, WorkoutProgram } from './workout';

// Enhanced ScheduledWorkout type with name
export interface ScheduledWorkout {
  id: string;
  date: string; // ISO date string
  workoutId: string; // Reference to original workout
  programId: string; // Reference to the program
  completed: boolean;
  progress?: number; // Optional progress percentage (0-100)
  name?: string; // Add workout name to scheduled workout
}

// Program Schedule type
export interface ProgramSchedule {
  id: string;
  programId: string;
  programName: string;
  startDate: string;
  endDate?: string;
  scheduledWorkouts: ScheduledWorkout[];
  active: boolean;
  createdAt: string;
}
