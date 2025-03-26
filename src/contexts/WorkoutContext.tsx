import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  WorkoutProgram, 
  WorkoutSession, 
  Exercise,
  Set, 
  Circuit
} from "@/types/workout"; 
import { createEmptyProgram, sampleProgram } from "@/utils/workout";

// Define the shape of our context
interface WorkoutContextType {
  program: WorkoutProgram;
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  
  addSession: (name?: string) => void;
  updateSession: (sessionId: string, updates: Partial<WorkoutSession>) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  
  addExercise: (sessionId: string, exercise?: Partial<Exercise>) => void;
  updateExercise: (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  
  addSet: (sessionId: string, exerciseId: string, set?: Partial<Set>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  
  addCircuit: (sessionId: string, name: string) => void;
  updateCircuit: (sessionId: string, circuitId: string, updates: Partial<Circuit>) => void;
  deleteCircuit: (sessionId: string, circuitId: string) => void;
  
  addExerciseToCircuit: (sessionId: string, circuitId: string, exercise?: Partial<Exercise>) => void;
  
  updateProgramDetails: (updates: { name?: string; image?: string }) => void;
  
  resetProgram: () => void;
  loadSampleProgram: () => void;
  
  createCircuit: (sessionId: string) => void;
  createSuperset: (sessionId: string) => void;
  createEMOM: (sessionId: string) => void;
  createAMRAP: (sessionId: string) => void;
  createTabata: (sessionId: string) => void;
}

// Create the context with a default value
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Create a provider component
export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [program, setProgram] = useState<WorkoutProgram>(createEmptyProgram());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    program.sessions.length > 0 ? program.sessions[0].id : null
  );

  // Reset to empty program
  const resetProgram = () => {
    const newProgram = createEmptyProgram();
    setProgram(newProgram);
    setActiveSessionId(newProgram.sessions[0].id);
  };
  
  // Load sample program
  const loadSampleProgram = () => {
    setProgram(sampleProgram);
    setActiveSessionId(sampleProgram.sessions[0].id);
  };

  // Session operations
  const addSession = (name?: string) => {
    const newSession: WorkoutSession = {
      id: uuidv4(),
      name: name || `Day ${program.sessions.length + 1}`,
      day: program.sessions.length + 1,
      exercises: [],
      circuits: []
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: [...prevProgram.sessions, newSession]
    }));
    
    if (!activeSessionId) {
      setActiveSessionId(newSession.id);
    }
  };
  
  const updateSession = (sessionId: string, updates: Partial<WorkoutSession>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => 
        session.id === sessionId ? { ...session, ...updates } : session
      )
    }));
  };
  
  const updateSessionName = (sessionId: string, name: string) => {
    updateSession(sessionId, { name });
  };
  
  const deleteSession = (sessionId: string) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.filter(session => session.id !== sessionId)
    }));
    
    if (activeSessionId === sessionId) {
      setActiveSessionId(program.sessions[0]?.id || null);
    }
  };

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
  const addSet = (sessionId: string, exerciseId: string, set?: Partial<Set>) => {
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
  };
  
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
  
  const updateCircuit = (sessionId: string, circuitId: string, updates: Partial<Circuit>) => {
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
  };
  
  const deleteCircuit = (sessionId: string, circuitId: string) => {
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
  };
  
  const addExerciseToCircuit = (sessionId: string, circuitId: string, exercise?: Partial<Exercise> = {}) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: exercise.name || "New Exercise",
      sets: exercise.sets || [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
      notes: exercise.notes || "",
      isInCircuit: true,
      circuitId,
      ...exercise
    };
    
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
  };
  
  // Update program details
  const updateProgramDetails = (updates: { name?: string; image?: string }) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      ...updates
    }));
  };

  // Provide the context value
  const contextValue: WorkoutContextType = {
    program,
    activeSessionId,
    setActiveSessionId,
    
    addSession,
    updateSession,
    deleteSession,
    updateSessionName,
    
    addExercise,
    updateExercise,
    deleteExercise,
    
    addSet,
    updateSet,
    deleteSet,
    
    addCircuit,
    updateCircuit,
    deleteCircuit,
    
    addExerciseToCircuit,
    
    updateProgramDetails,
    
    resetProgram,
    loadSampleProgram,
    
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
