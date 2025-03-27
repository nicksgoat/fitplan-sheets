// Exercise categories
export type ExerciseCategory = 
  | "barbell"
  | "dumbbell" 
  | "machine" 
  | "bodyweight" 
  | "kettlebell"
  | "cable"
  | "cardio"
  | "other";

// Primary muscles
export type PrimaryMuscle = 
  | "chest" 
  | "back" 
  | "shoulders" 
  | "biceps" 
  | "triceps" 
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "forearms"
  | "full body"
  | "upper chest"
  | "core"
  | "other";

// Exercise model
export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: PrimaryMuscle;
  secondaryMuscles?: PrimaryMuscle[];
  category: ExerciseCategory;
  description?: string;
  instructions?: string;
}

// Sample exercise library
export const exerciseLibrary: Exercise[] = [
  {
    id: "bb-bench-press",
    name: "Barbell Bench Press",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "shoulders"],
    category: "barbell",
    description: "Classic compound pushing movement for chest development",
    instructions: "Lie on a bench, grip the bar slightly wider than shoulder width, lower to chest and press up"
  },
  {
    id: "bb-squat",
    name: "Barbell Back Squat",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    category: "barbell",
    description: "Fundamental lower body compound movement",
    instructions: "Position bar on upper back, feet shoulder width apart, squat down until thighs are parallel or below, then stand back up"
  },
  {
    id: "bb-deadlift",
    name: "Barbell Deadlift",
    primaryMuscle: "back",
    secondaryMuscles: ["glutes", "hamstrings", "quadriceps", "forearms"],
    category: "barbell",
    description: "Full body pulling movement focusing on posterior chain",
    instructions: "Stand with feet hip-width apart, bend down to grip bar with hands just outside legs, lift by driving through heels while keeping back straight"
  },
  {
    id: "bb-overhead-press",
    name: "Barbell Overhead Press",
    primaryMuscle: "shoulders",
    secondaryMuscles: ["triceps", "upper chest"],
    category: "barbell",
    description: "Vertical pressing movement for shoulder development",
    instructions: "Hold bar at shoulder height, press overhead until arms are fully extended, lower back to shoulders"
  },
  {
    id: "bb-row",
    name: "Barbell Bent Over Row",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "forearms", "shoulders"],
    category: "barbell",
    description: "Compound pulling movement for back thickness",
    instructions: "Bend at hips until torso is nearly parallel to floor, pull bar to lower chest/upper abdomen, lower and repeat"
  },
  {
    id: "db-bench-press",
    name: "Dumbbell Bench Press",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "shoulders"],
    category: "dumbbell",
    description: "Chest pressing movement with greater range of motion than barbell version",
    instructions: "Lie on bench with dumbbells at shoulder level, press up until arms extended, lower and repeat"
  },
  {
    id: "db-shoulder-press",
    name: "Dumbbell Shoulder Press",
    primaryMuscle: "shoulders",
    secondaryMuscles: ["triceps"],
    category: "dumbbell",
    description: "Overhead pressing movement with dumbbells for balanced shoulder development",
    instructions: "Sit with back supported, dumbbells at shoulder height, press overhead until arms extended, lower and repeat"
  },
  {
    id: "db-row",
    name: "Dumbbell Row",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "forearms"],
    category: "dumbbell",
    description: "Unilateral back exercise targeting lats and mid-back",
    instructions: "Place one hand and knee on bench, pull dumbbell to hip/ribcage with elbow close to body, lower and repeat"
  },
  {
    id: "db-lunge",
    name: "Dumbbell Walking Lunge",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    category: "dumbbell",
    description: "Unilateral lower body movement that also challenges balance and core stability",
    instructions: "Hold dumbbells at sides, step forward into lunge position, push off front foot to bring rear foot forward into next lunge"
  },
  {
    id: "pullup",
    name: "Pull-up",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "shoulders", "forearms"],
    category: "bodyweight",
    description: "Upper body pulling movement using body weight",
    instructions: "Hang from bar with hands wider than shoulder width, pull body up until chin over bar, lower and repeat"
  },
  {
    id: "pushup",
    name: "Push-up",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "shoulders", "abs"],
    category: "bodyweight",
    description: "Upper body pushing movement using body weight",
    instructions: "Start in plank position with hands slightly wider than shoulders, lower body by bending elbows, push back up"
  },
  {
    id: "dips",
    name: "Dips",
    primaryMuscle: "triceps",
    secondaryMuscles: ["chest", "shoulders"],
    category: "bodyweight",
    description: "Bodyweight exercise targeting triceps and lower chest",
    instructions: "Support body on parallel bars with arms extended, lower by bending elbows until shoulders below elbows, push back up"
  },
  {
    id: "leg-press",
    name: "Leg Press",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings"],
    category: "machine",
    description: "Lower body pressing movement on machine",
    instructions: "Sit in machine with feet on platform, lower weight by bending knees toward chest, push platform away until legs extended"
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "forearms"],
    category: "cable",
    description: "Upper body pulling movement targeting lats",
    instructions: "Sit at machine with thighs secured, grip bar wider than shoulder width, pull down to upper chest, control weight back up"
  },
  {
    id: "cable-row",
    name: "Cable Seated Row",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "forearms"],
    category: "cable",
    description: "Seated rowing movement targeting mid-back",
    instructions: "Sit at cable row station with feet on platform, back straight, pull handle to stomach, extend arms and repeat"
  },
  {
    id: "kb-swing",
    name: "Kettlebell Swing",
    primaryMuscle: "glutes",
    secondaryMuscles: ["hamstrings", "back", "shoulders"],
    category: "kettlebell",
    description: "Dynamic hinging movement with kettlebell",
    instructions: "Stand with feet shoulder width apart, hinge at hips and swing kettlebell between legs, thrust hips forward to swing kettlebell to shoulder height"
  },
  {
    id: "kb-goblet-squat",
    name: "Kettlebell Goblet Squat",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "core"],
    category: "kettlebell",
    description: "Squat variation holding kettlebell at chest",
    instructions: "Hold kettlebell close to chest with both hands, feet shoulder width apart, squat down keeping chest up, stand back up"
  },
  {
    id: "treadmill",
    name: "Treadmill Run",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["hamstrings", "glutes", "calves"],
    category: "cardio",
    description: "Cardiovascular exercise on treadmill",
    instructions: "Set desired speed and incline on treadmill, maintain proper running form with slight forward lean"
  },
  {
    id: "cycling",
    name: "Stationary Bike",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["hamstrings", "glutes", "calves"],
    category: "cardio",
    description: "Cardiovascular exercise on stationary bike",
    instructions: "Adjust seat height so knees are slightly bent at bottom of pedal stroke, maintain steady cadence"
  }
];

// Local storage key for custom exercises
const CUSTOM_EXERCISES_KEY = "fitplan-custom-exercises";

// Get all exercises including custom ones
export function getAllExercises(): Exercise[] {
  const customExercises = getCustomExercises();
  return [...exerciseLibrary, ...customExercises];
}

// Get custom exercises from local storage
export function getCustomExercises(): Exercise[] {
  const data = localStorage.getItem(CUSTOM_EXERCISES_KEY);
  return data ? JSON.parse(data) : [];
}

// Add a custom exercise to local storage
export function addCustomExercise(exercise: Exercise): void {
  const customExercises = getCustomExercises();
  customExercises.push(exercise);
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
}

// Search exercises by name
export function searchExercises(query: string): Exercise[] {
  if (!query || query.trim() === '') return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const allExercises = getAllExercises();
  
  return allExercises.filter(exercise => 
    exercise.name.toLowerCase().includes(normalizedQuery)
  ).sort((a, b) => {
    // Sort by whether the name starts with the query first
    const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery);
    const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Then sort alphabetically
    return a.name.localeCompare(b.name);
  }).slice(0, 10); // Limit to 10 results
}
