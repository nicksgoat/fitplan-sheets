
import { useState } from "react";
import { WorkoutProgram, Exercise, Set } from "@/types/workout";
import { v4 as uuidv4 } from "uuid";

interface UseWorkoutExercisesProps {
  program: WorkoutProgram;
  setProgram: React.Dispatch<React.SetStateAction<WorkoutProgram>>;
}

export const useWorkoutExercises = ({
  program,
  setProgram
}: UseWorkoutExercisesProps) => {
  // Exercise operations
  const addExercise = (sessionId: string, exercise: Partial<Exercise> = {}) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: exercise.name || "New Exercise",
      sets: exercise.sets || [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
      notes: exercise.notes || "",
      ...exercise
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: [...session.exercises, newExercise]
          };
        }
        return session;
      })
    }));
  };
  
  const updateExercise = (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => 
              exercise.id === exerciseId ? { ...exercise, ...updates } : exercise
            )
          };
        }
        return session;
      })
    }));
  };
  
  const deleteExercise = (sessionId: string, exerciseId: string) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          // Also remove any exercises that are part of a group if this is a group header
          const exerciseToDelete = session.exercises.find(e => e.id === exerciseId);
          
          if (exerciseToDelete?.isCircuit) {
            // If it's a circuit, also remove all exercises in the circuit
            return {
              ...session,
              exercises: session.exercises.filter(e => 
                e.id !== exerciseId && e.circuitId !== exerciseToDelete.circuitId
              ),
              circuits: session.circuits.filter(c => c.id !== exerciseToDelete.circuitId)
            };
          } else if (exerciseToDelete?.isGroup) {
            // If it's a group, also remove all exercises in the group
            return {
              ...session,
              exercises: session.exercises.filter(e => 
                e.id !== exerciseId && e.groupId !== exerciseId
              )
            };
          } else {
            return {
              ...session,
              exercises: session.exercises.filter(e => e.id !== exerciseId)
            };
          }
        }
        return session;
      })
    }));
  };

  // Set operations
  const addSet = (sessionId: string, exerciseId: string, set: Partial<Set> = {}) => {
    const newSet: Set = {
      id: uuidv4(),
      reps: set.reps || "",
      weight: set.weight || "",
      rpe: set.rpe || "",
      rest: set.rest || ""
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: [...exercise.sets, newSet]
                };
              }
              return exercise;
            })
          };
        }
        return session;
      })
    }));
  };
  
  const updateSet = (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.map(set => 
                    set.id === setId ? { ...set, ...updates } : set
                  )
                };
              }
              return exercise;
            })
          };
        }
        return session;
      })
    }));
  };
  
  const deleteSet = (sessionId: string, exerciseId: string, setId: string) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.filter(set => set.id !== setId)
                };
              }
              return exercise;
            })
          };
        }
        return session;
      })
    }));
  };

  return {
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet
  };
};
