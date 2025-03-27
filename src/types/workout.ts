
export interface Set {
  id: string;
  reps: string;
  weight: string;
  intensity: string;
  intensityType?: IntensityType;
  weightType?: WeightType;
  rest: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes: string;
  isCircuit?: boolean;
  isInCircuit?: boolean;
  circuitId?: string;
  circuitOrder?: number;
  isGroup?: boolean;
  groupId?: string;
  repType?: RepType;
  intensityType?: IntensityType;
  weightType?: WeightType;
}

export interface Circuit {
  id: string;
  name: string;
  exercises: string[]; // Array of exercise IDs
  rounds?: string;
  restBetweenExercises?: string;
  restBetweenRounds?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  day: number;
  exercises: Exercise[];
  circuits: Circuit[];
  weekId?: string; // New field to associate session with a week
}

export interface WorkoutWeek {
  id: string;
  name: string;
  order: number;
  sessions: string[]; // Array of session IDs
}

export interface WorkoutProgram {
  id: string;
  name: string;
  sessions: WorkoutSession[];
  weeks: WorkoutWeek[]; // New weeks array
}

export type CellType = 'name' | 'sets' | 'reps' | 'weight' | 'intensity' | 'rest' | 'notes';
export type ExerciseCellType = 'name' | 'notes';
export type SetCellType = 'reps' | 'weight' | 'intensity' | 'rest';

export type WorkoutType = 'standard' | 'circuit' | 'superset' | 'emom' | 'amrap' | 'tabata';

// Rep types
export type RepType = 
  | 'fixed'        // Standard fixed reps (e.g., "12")
  | 'range'        // Rep range (e.g., "8-12")
  | 'descending'   // Decreasing reps (e.g., "12, 10, 8")
  | 'time'         // Time-based (e.g., "30s" or "1m")
  | 'each-side'    // Each side (e.g., "12e/s")
  | 'amrap';       // As many reps as possible

// Intensity types
export type IntensityType =
  | 'rpe'           // Rate of Perceived Exertion (e.g., "8.5")
  | 'arpe'          // Adjusted RPE (e.g., "7.5")
  | 'percent'       // Percentage of max (e.g., "75%")
  | 'absolute'      // Absolute weight (e.g., "185 lbs")
  | 'velocity';     // Velocity-based (e.g., "0.8 m/s")

// Weight types
export type WeightType =
  | 'pounds'        // Weight in pounds (e.g., "185 lbs")
  | 'kilos'         // Weight in kilograms (e.g., "80 kg")
  | 'distance-m'    // Distance in meters (e.g., "100m")
  | 'distance-ft'   // Distance in feet (e.g., "50ft")
  | 'distance-yd'   // Distance in yards (e.g., "25yd")
  | 'distance-mi';  // Distance in miles (e.g., "0.5mi")
