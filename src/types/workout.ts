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
  maxWeight?: string;  // New field to store max weight
}

export interface MaxWeightRecord {
  exerciseName: string;  // We use the exercise name as a key for consistency
  maxWeight: string;
  weightType: WeightType;
  date: string;  // When the max was recorded
}

export interface UserMaxWeights {
  records: Record<string, MaxWeightRecord>; // Keyed by exercise name
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

export type CellType = 'name' | 'sets' | 'reps' | 'weight' | 'intensity' | 'rest' | 'notes' | 'max';
export type ExerciseCellType = 'name' | 'notes' | 'max';
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

// New callback type for exercise creation
export type ExerciseCallback = (exerciseId: string) => void;

// New callback type for max weight updates
export type MaxWeightCallback = (exerciseName: string, maxWeight: string, weightType: WeightType) => void;

// Weight calculation modes
export type WeightCalculationMode = 
  | 'direct'       // Direct weight input (default)
  | 'percentage';  // Calculate based on percentage of max

// New type for weight calculation direction
export type CalculationDirection = 
  | 'weight-to-percentage'  // Calculate percentage from weight
  | 'percentage-to-weight'; // Calculate weight from percentage
