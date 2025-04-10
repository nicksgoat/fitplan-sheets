
import { v4 as uuidv4 } from "uuid";
import { Workout, WorkoutWeek, WorkoutProgram } from "@/types/workout";

export const saveWorkoutToLibrary = (
  workout: Workout | undefined,
  name: string,
  workoutLibrary: Workout[],
  setWorkoutLibrary: (workouts: Workout[]) => void
) => {
  if (!workout) return;
  
  const savedWorkout = {
    ...workout,
    id: uuidv4(),
    name: name
  };
  
  setWorkoutLibrary([...workoutLibrary, savedWorkout]);
};

export const saveWeekToLibrary = (
  program: WorkoutProgram | null,
  weekId: string,
  name: string,
  weekLibrary: WorkoutWeek[],
  setWeekLibrary: (weeks: WorkoutWeek[]) => void
) => {
  if (!program) return;
  
  const weekToSave = program.weeks.find(w => w.id === weekId);
  if (!weekToSave) return;
  
  const weekWorkouts = weekToSave.workouts.map(
    wId => program.workouts.find(w => w.id === wId)
  ).filter(Boolean) as Workout[];
  
  const newWorkouts = weekWorkouts.map(workout => ({
    ...workout,
    id: uuidv4()
  }));
  
  const savedWeek = {
    ...weekToSave,
    id: uuidv4(),
    name: name,
    workouts: newWorkouts.map(w => w.id)
  };
  
  setWeekLibrary([...weekLibrary, savedWeek]);
};

export const saveProgramToLibrary = (
  program: WorkoutProgram | null,
  name: string,
  programLibrary: WorkoutProgram[],
  setProgramLibrary: (programs: WorkoutProgram[]) => void
) => {
  if (!program) return;
  
  const savedProgram = {
    ...program,
    id: uuidv4(),
    name: name
  };
  
  setProgramLibrary([...programLibrary, savedProgram]);
};

export const loadWorkoutToProgram = (
  workoutIdOrObj: string | Workout,
  weekId: string,
  dayNumber: number | undefined,
  workoutLibrary: Workout[],
  updateProgram: Function
) => {
  let libraryWorkout: Workout | undefined;
  
  if (typeof workoutIdOrObj === 'string') {
    libraryWorkout = workoutLibrary.find(w => w.id === workoutIdOrObj);
  } else {
    libraryWorkout = workoutIdOrObj;
  }
  
  if (!libraryWorkout) {
    console.error("Workout not found in library:", workoutIdOrObj);
    return;
  }
  
  const newWorkout = {
    ...libraryWorkout,
    id: uuidv4(),
    weekId: weekId,
    day: dayNumber || libraryWorkout.day,
    exercises: libraryWorkout.exercises.map(ex => ({
      ...ex,
      id: uuidv4(),
      sets: ex.sets.map(set => ({
        ...set,
        id: uuidv4()
      }))
    }))
  };
  
  updateProgram(draft => {
    draft.workouts.push(newWorkout);
    
    const week = draft.weeks.find(w => w.id === weekId);
    if (week) {
      week.workouts.push(newWorkout.id);
    }
  });
  
  return newWorkout.id;
};

export const loadWeekToProgram = (
  week: WorkoutWeek,
  workoutLibrary: Workout[],
  programWeeksLength: number,
  updateProgram: Function
) => {
  const newWeekId = uuidv4();
  const newWeek = {
    ...week,
    id: newWeekId,
    order: programWeeksLength,
    workouts: []
  };
  
  const weekWorkouts = week.workouts.map(wId => {
    const foundWorkout = workoutLibrary.find(w => w.id === wId);
    if (foundWorkout) {
      return {
        ...foundWorkout,
        id: uuidv4(),
        weekId: newWeekId,
        exercises: foundWorkout.exercises.map(ex => ({
          ...ex,
          id: uuidv4(),
          sets: ex.sets.map(set => ({
            ...set,
            id: uuidv4()
          }))
        }))
      };
    }
    return null;
  }).filter(Boolean) as Workout[];
  
  newWeek.workouts = weekWorkouts.map(w => w.id);
  
  updateProgram(draft => {
    draft.weeks.push(newWeek);
    draft.workouts.push(...weekWorkouts);
  });
};
