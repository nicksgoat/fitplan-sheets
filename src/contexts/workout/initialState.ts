
import { v4 as uuidv4 } from "uuid";
import { WorkoutProgram, WorkoutWeek, Workout } from "@/types/workout";

export const initialProgramState: WorkoutProgram = {
  id: "default-program-id",
  name: "My Workout Program",
  workouts: [],
  weeks: [],
};

export const createSampleProgram = (): WorkoutProgram => {
  const sampleProgram: WorkoutProgram = {
    id: uuidv4(),
    name: "Sample Training Program",
    workouts: [
      {
        id: uuidv4(),
        name: "Upper Body",
        day: 1,
        exercises: [
          {
            id: uuidv4(),
            name: "Bench Press",
            sets: [
              { id: uuidv4(), reps: "10,8,8,6", weight: "135,145,155,165", intensity: "", rest: "90s" }
            ],
            notes: "Focus on chest contraction",
          },
          {
            id: uuidv4(),
            name: "Pull-ups",
            sets: [
              { id: uuidv4(), reps: "8,8,8", weight: "BW", intensity: "", rest: "60s" }
            ],
            notes: "",
          }
        ],
        circuits: [],
      },
      {
        id: uuidv4(),
        name: "Lower Body",
        day: 2,
        exercises: [
          {
            id: uuidv4(),
            name: "Squats",
            sets: [
              { id: uuidv4(), reps: "10,8,6", weight: "185,205,225", intensity: "", rest: "120s" }
            ],
            notes: "",
          },
          {
            id: uuidv4(),
            name: "Romanian Deadlift",
            sets: [
              { id: uuidv4(), reps: "10,10,10", weight: "135,145,155", intensity: "", rest: "90s" }
            ],
            notes: "Keep back straight",
          }
        ],
        circuits: [],
      }
    ],
    weeks: [],
  };
  
  const week: WorkoutWeek = {
    id: uuidv4(),
    name: "Week 1",
    order: 0,
    workouts: [],
  };
  
  for (const workout of sampleProgram.workouts) {
    week.workouts.push(workout.id);
    workout.weekId = week.id;
  }
  
  sampleProgram.weeks.push(week);
  
  return sampleProgram;
};
