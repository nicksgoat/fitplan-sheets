import { useState } from "react";
import { WorkoutProgram, Circuit, Exercise } from "@/types/workout";
import { v4 as uuidv4 } from "uuid";

interface UseWorkoutCircuitsProps {
  program: WorkoutProgram;
  setProgram: React.Dispatch<React.SetStateAction<WorkoutProgram>>;
  activeWeekId: string | null;
}

export const useWorkoutCircuits = ({
  program,
  setProgram,
  activeWeekId
}: UseWorkoutCircuitsProps) => {
  // Circuit operations
  const addCircuit = (sessionId: string, name: string) => {
    const circuitId = uuidv4();
    
    // Create a circuit header exercise
    const circuitHeaderExercise: Exercise = {
      id: uuidv4(),
      name: name || "Circuit",
      sets: [],
      notes: "",
      isCircuit: true,
      circuitId
    };
    
    // Create the circuit
    const newCircuit: Circuit = {
      id: circuitId,
      name: name || "Circuit",
      exercises: []
    };
    
    // Check if this session is in the weeks structure
    if (program.weeks && activeWeekId) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          if (week.id === activeWeekId) {
            return {
              ...week,
              sessions: week.sessions.map(session => {
                if (session.id === sessionId) {
                  return {
                    ...session,
                    exercises: [...session.exercises, circuitHeaderExercise],
                    circuits: [...session.circuits, newCircuit]
                  };
                }
                return session;
              })
            };
          }
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
    } else {
      // Fallback to old sessions array
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              exercises: [...session.exercises, circuitHeaderExercise],
              circuits: [...session.circuits, newCircuit]
            };
          }
          return session;
        })
      }));
    }
  };
  
  // Shortcut functions for different circuit types
  const createCircuit = (sessionId: string) => {
    addCircuit(sessionId, "Circuit");
  };
  
  const createSuperset = (sessionId: string) => {
    addCircuit(sessionId, "Superset");
  };
  
  const createEMOM = (sessionId: string) => {
    addCircuit(sessionId, "EMOM");
  };
  
  const createAMRAP = (sessionId: string) => {
    addCircuit(sessionId, "AMRAP");
  };
  
  const createTabata = (sessionId: string) => {
    addCircuit(sessionId, "Tabata");
  };
  
  // Update updateCircuit, deleteCircuit, and addExerciseToCircuit similarly to handle the weeks structure
  const updateCircuit = (sessionId: string, circuitId: string, updates: Partial<Circuit>) => {
    // Check if this session is in the weeks structure
    if (program.weeks && activeWeekId) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          if (week.id === activeWeekId) {
            return {
              ...week,
              sessions: week.sessions.map(session => {
                if (session.id === sessionId) {
                  // Update the circuit
                  const updatedCircuits = session.circuits.map(circuit => 
                    circuit.id === circuitId ? { ...circuit, ...updates } : circuit
                  );
                  
                  // Also update the circuit header exercise if name changed
                  const updatedExercises = session.exercises.map(exercise => {
                    if (exercise.isCircuit && exercise.circuitId === circuitId && updates.name) {
                      return { ...exercise, name: updates.name };
                    }
                    return exercise;
                  });
                  
                  return {
                    ...session,
                    exercises: updatedExercises,
                    circuits: updatedCircuits
                  };
                }
                return session;
              })
            };
          }
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
    } else {
      // Fallback to old sessions array
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions.map(session => {
          if (session.id === sessionId) {
            // Update the circuit
            const updatedCircuits = session.circuits.map(circuit => 
              circuit.id === circuitId ? { ...circuit, ...updates } : circuit
            );
            
            // Also update the circuit header exercise if name changed
            const updatedExercises = session.exercises.map(exercise => {
              if (exercise.isCircuit && exercise.circuitId === circuitId && updates.name) {
                return { ...exercise, name: updates.name };
              }
              return exercise;
            });
            
            return {
              ...session,
              exercises: updatedExercises,
              circuits: updatedCircuits
            };
          }
          return session;
        })
      }));
    }
  };
  
  const deleteCircuit = (sessionId: string, circuitId: string) => {
    // Check if this session is in the weeks structure
    if (program.weeks && activeWeekId) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          if (week.id === activeWeekId) {
            return {
              ...week,
              sessions: week.sessions.map(session => {
                if (session.id === sessionId) {
                  return {
                    ...session,
                    // Remove circuit header and all exercises in the circuit
                    exercises: session.exercises.filter(
                      exercise => !(exercise.isCircuit && exercise.circuitId === circuitId) 
                        && !(exercise.isInCircuit && exercise.circuitId === circuitId)
                    ),
                    // Remove the circuit
                    circuits: session.circuits.filter(circuit => circuit.id !== circuitId)
                  };
                }
                return session;
              })
            };
          }
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
    } else {
      // Fallback to old sessions array
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              // Remove circuit header and all exercises in the circuit
              exercises: session.exercises.filter(
                exercise => !(exercise.isCircuit && exercise.circuitId === circuitId) 
                  && !(exercise.isInCircuit && exercise.circuitId === circuitId)
              ),
              // Remove the circuit
              circuits: session.circuits.filter(circuit => circuit.id !== circuitId)
            };
          }
          return session;
        })
      }));
    }
  };
  
  const addExerciseToCircuit = (sessionId: string, circuitId: string, exercise: Partial<Exercise> = {}) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: exercise.name || "New Exercise",
      sets: exercise.sets || [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
      notes: exercise.notes || "",
      isInCircuit: true,
      circuitId,
      ...exercise
    };
    
    // Check if this session is in the weeks structure
    if (program.weeks && activeWeekId) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          if (week.id === activeWeekId) {
            return {
              ...week,
              sessions: week.sessions.map(session => {
                if (session.id === sessionId) {
                  // Find the circuit to update its exercises array
                  const updatedCircuits = session.circuits.map(circuit => {
                    if (circuit.id === circuitId) {
                      return {
                        ...circuit,
                        exercises: [...circuit.exercises, newExercise.id]
                      };
                    }
                    return circuit;
                  });
                  
                  // Find the circuit header exercise to place the new exercise after it
                  const circuitHeaderIndex = session.exercises.findIndex(
                    e => e.isCircuit && e.circuitId === circuitId
                  );
                  
                  if (circuitHeaderIndex !== -1) {
                    // Find the right position to insert the new exercise (after other circuit exercises)
                    let insertIndex = circuitHeaderIndex + 1;
                    while (
                      insertIndex < session.exercises.length && 
                      session.exercises[insertIndex].isInCircuit && 
                      session.exercises[insertIndex].circuitId === circuitId
                    ) {
                      insertIndex++;
                    }
                    
                    const updatedExercises = [
                      ...session.exercises.slice(0, insertIndex),
                      newExercise,
                      ...session.exercises.slice(insertIndex)
                    ];
                    
                    return {
                      ...session,
                      exercises: updatedExercises,
                      circuits: updatedCircuits
                    };
                  }
                  
                  // Fallback if header not found
                  return {
                    ...session,
                    exercises: [...session.exercises, newExercise],
                    circuits: updatedCircuits
                  };
                }
                return session;
              })
            };
          }
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
    } else {
      // Fallback to old sessions array - keep the original implementation
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions.map(session => {
          if (session.id === sessionId) {
            // Find the circuit to update its exercises array
            const updatedCircuits = session.circuits.map(circuit => {
              if (circuit.id === circuitId) {
                return {
                  ...circuit,
                  exercises: [...circuit.exercises, newExercise.id]
                };
              }
              return circuit;
            });
            
            // Find the circuit header exercise to place the new exercise after it
            const circuitHeaderIndex = session.exercises.findIndex(
              e => e.isCircuit && e.circuitId === circuitId
            );
            
            if (circuitHeaderIndex !== -1) {
              // Find the right position to insert the new exercise (after other circuit exercises)
              let insertIndex = circuitHeaderIndex + 1;
              while (
                insertIndex < session.exercises.length && 
                session.exercises[insertIndex].isInCircuit && 
                session.exercises[insertIndex].circuitId === circuitId
              ) {
                insertIndex++;
              }
              
              const updatedExercises = [
                ...session.exercises.slice(0, insertIndex),
                newExercise,
                ...session.exercises.slice(insertIndex)
              ];
              
              return {
                ...session,
                exercises: updatedExercises,
                circuits: updatedCircuits
              };
            }
            
            // Fallback if header not found
            return {
              ...session,
              exercises: [...session.exercises, newExercise],
              circuits: updatedCircuits
            };
          }
          return session;
        })
      }));
    }
  };

  return {
    addCircuit,
    updateCircuit,
    deleteCircuit,
    addExerciseToCircuit,
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata
  };
};
