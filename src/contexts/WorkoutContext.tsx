import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  WorkoutProgram, 
  WorkoutSession, 
  Exercise,
  Set, 
  Circuit,
  WorkoutSettings,
  WorkoutWeek
} from "@/types/workout"; 
import { createEmptyProgram, sampleProgram } from "@/utils/workout";
import { toast } from "@/components/ui/use-toast";

interface WorkoutContextType {
  program: WorkoutProgram;
  activeSessionId: string | null;
  activeWeekId: string | null;
  setActiveSessionId: (id: string) => void;
  setActiveWeekId: (id: string) => void;
  
  addSession: (name?: string, weekId?: string) => void;
  updateSession: (sessionId: string, updates: Partial<WorkoutSession>) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  
  addWeek: (name?: string) => void;
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  deleteWeek: (weekId: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  
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
  updateSettings: (settings: WorkoutSettings) => void;
  
  resetProgram: () => void;
  loadSampleProgram: () => void;
  
  createCircuit: (sessionId: string) => void;
  createSuperset: (sessionId: string) => void;
  createEMOM: (sessionId: string) => void;
  createAMRAP: (sessionId: string) => void;
  createTabata: (sessionId: string) => void;
  
  workoutLibrary: Array<{
    id: string;
    name: string;
    type: "program" | "session";
    data: WorkoutProgram | WorkoutSession;
  }>;
  saveToLibrary: (type: "program" | "session", id?: string) => void;
  importSession: (session: WorkoutSession) => void;
  importProgram: (program: WorkoutProgram) => void;
}

const WORKOUT_LIBRARY_KEY = "workout_library";

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [program, setProgram] = useState<WorkoutProgram>(createEmptyProgram());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    program.sessions.length > 0 ? program.sessions[0].id : null
  );
  const [activeWeekId, setActiveWeekId] = useState<string | null>(
    program.weeks && program.weeks.length > 0 ? program.weeks[0].id : null
  );
  
  const [workoutLibrary, setWorkoutLibrary] = useState<Array<{
    id: string;
    name: string;
    type: "program" | "session";
    data: WorkoutProgram | WorkoutSession;
  }>>([]);
  
  useEffect(() => {
    const savedLibrary = localStorage.getItem(WORKOUT_LIBRARY_KEY);
    if (savedLibrary) {
      try {
        setWorkoutLibrary(JSON.parse(savedLibrary));
      } catch (error) {
        console.error("Failed to load workout library:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(workoutLibrary));
  }, [workoutLibrary]);

  const resetProgram = () => {
    const newProgram = createEmptyProgram();
    setProgram(newProgram);
    
    if (newProgram.weeks && newProgram.weeks.length > 0) {
      setActiveWeekId(newProgram.weeks[0].id);
      
      if (newProgram.weeks[0].sessions.length > 0) {
        setActiveSessionId(newProgram.weeks[0].sessions[0].id);
      } else {
        setActiveSessionId(null);
      }
    } else if (newProgram.sessions.length > 0) {
      setActiveSessionId(newProgram.sessions[0].id);
    }
  };
  
  const loadSampleProgram = () => {
    setProgram(sampleProgram);
    
    if (sampleProgram.weeks && sampleProgram.weeks.length > 0) {
      setActiveWeekId(sampleProgram.weeks[0].id);
      
      if (sampleProgram.weeks[0].sessions.length > 0) {
        setActiveSessionId(sampleProgram.weeks[0].sessions[0].id);
      } else {
        setActiveSessionId(null);
      }
    } else if (sampleProgram.sessions.length > 0) {
      setActiveSessionId(sampleProgram.sessions[0].id);
    }
  };

  const addWeek = (name?: string) => {
    const newWeek: WorkoutWeek = {
      id: uuidv4(),
      weekNumber: program.weeks?.length + 1 || 1,
      name: name || `Week ${program.weeks?.length + 1 || 1}`,
      sessions: []
    };
    
    const newSession: WorkoutSession = {
      id: uuidv4(),
      name: `Day 1`,
      day: 1,
      exercises: [],
      circuits: [],
      weekId: newWeek.id
    };
    
    newWeek.sessions.push(newSession);
    
    setProgram(prevProgram => ({
      ...prevProgram,
      weeks: [...(prevProgram.weeks || []), newWeek]
    }));
    
    if (!activeWeekId) {
      setActiveWeekId(newWeek.id);
    }
    
    setActiveSessionId(newSession.id);
  };
  
  const updateWeek = (weekId: string, updates: Partial<WorkoutWeek>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      weeks: (prevProgram.weeks || []).map(week => 
        week.id === weekId ? { ...week, ...updates } : week
      )
    }));
  };
  
  const updateWeekName = (weekId: string, name: string) => {
    updateWeek(weekId, { name });
  };
  
  const deleteWeek = (weekId: string) => {
    if (!program.weeks || program.weeks.length <= 1) {
      toast({
        title: "Cannot Delete Week",
        description: "A program must have at least one week.",
        variant: "destructive"
      });
      return;
    }
    
    setProgram(prevProgram => {
      const updatedWeeks = (prevProgram.weeks || [])
        .filter(week => week.id !== weekId)
        .map((week, index) => ({
          ...week,
          weekNumber: index + 1
        }));
      
      return {
        ...prevProgram,
        weeks: updatedWeeks
      };
    });
    
    if (activeWeekId === weekId) {
      const newActiveWeekId = program.weeks.find(week => week.id !== weekId)?.id;
      setActiveWeekId(newActiveWeekId || null);
      
      if (newActiveWeekId) {
        const week = program.weeks.find(week => week.id === newActiveWeekId);
        if (week && week.sessions.length > 0) {
          setActiveSessionId(week.sessions[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
    }
  };

  const addSession = (name?: string, weekId?: string) => {
    const targetWeekId = weekId || activeWeekId;
    
    const newSession: WorkoutSession = {
      id: uuidv4(),
      name: name || `Day ${program.sessions.length + 1}`,
      day: program.sessions.length + 1,
      exercises: [],
      circuits: []
    };
    
    if (targetWeekId && program.weeks) {
      newSession.weekId = targetWeekId;
      
      setProgram(prevProgram => {
        const updatedWeeks = (prevProgram.weeks || []).map(week => {
          if (week.id === targetWeekId) {
            const updatedSessions = [...week.sessions, {
              ...newSession,
              day: week.sessions.length + 1,
              name: name || `Day ${week.sessions.length + 1}`
            }];
            
            return {
              ...week,
              sessions: updatedSessions
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
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: [...prevProgram.sessions, newSession]
      }));
    }
    
    setActiveSessionId(newSession.id);
  };
  
  const updateSession = (sessionId: string, updates: Partial<WorkoutSession>) => {
    if (program.weeks && program.weeks.length > 0) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          const sessionIndex = week.sessions.findIndex(session => session.id === sessionId);
          
          if (sessionIndex >= 0) {
            const updatedSessions = week.sessions.map(session => 
              session.id === sessionId ? { ...session, ...updates } : session
            );
            
            return {
              ...week,
              sessions: updatedSessions
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
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions.map(session => 
          session.id === sessionId ? { ...session, ...updates } : session
        )
      }));
    }
  };
  
  const updateSessionName = (sessionId: string, name: string) => {
    updateSession(sessionId, { name });
  };
  
  const deleteSession = (sessionId: string) => {
    if (program.weeks && program.weeks.length > 0) {
      let weekHasOnlyOneSession = false;
      let weekWithSession: WorkoutWeek | null = null;
      
      program.weeks.forEach(week => {
        if (week.sessions.some(session => session.id === sessionId)) {
          weekWithSession = week;
          weekHasOnlyOneSession = week.sessions.length <= 1;
        }
      });
      
      if (weekHasOnlyOneSession && weekWithSession) {
        toast({
          title: "Cannot Delete Session",
          description: "A week must have at least one session.",
          variant: "destructive"
        });
        return;
      }
      
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          if (week.sessions.some(session => session.id === sessionId)) {
            const updatedSessions = week.sessions
              .filter(session => session.id !== sessionId)
              .map((session, index) => ({
                ...session,
                day: index + 1
              }));
            
            return {
              ...week,
              sessions: updatedSessions
            };
          }
          
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
      
      if (activeSessionId === sessionId && weekWithSession) {
        const newActiveSessionId = weekWithSession.sessions.find(session => session.id !== sessionId)?.id;
        setActiveSessionId(newActiveSessionId || null);
      }
    } else {
      if (program.sessions.length <= 1) {
        toast({
          title: "Cannot Delete Session",
          description: "A program must have at least one session.",
          variant: "destructive"
        });
        return;
      }
      
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions
          .filter(session => session.id !== sessionId)
          .map((session, index) => ({
            ...session,
            day: index + 1
          }))
      }));
      
      if (activeSessionId === sessionId) {
        const newActiveSessionId = program.sessions.find(session => session.id !== sessionId)?.id;
        setActiveSessionId(newActiveSessionId || null);
      }
    }
  };

  const addExercise = (sessionId: string, exercise: Partial<Exercise> = {}) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: exercise.name || "New Exercise",
      sets: exercise.sets || [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
      notes: exercise.notes || "",
      ...exercise
    };
    
    if (program.weeks && program.weeks.length > 0) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          const sessionIndex = week.sessions.findIndex(session => session.id === sessionId);
          
          if (sessionIndex >= 0) {
            const updatedSessions = week.sessions.map(session => {
              if (session.id === sessionId) {
                return {
                  ...session,
                  exercises: [...session.exercises, newExercise]
                };
              }
              return session;
            });
            
            return {
              ...week,
              sessions: updatedSessions
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
    }
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
          const exerciseToDelete = session.exercises.find(e => e.id === exerciseId);
          
          if (exerciseToDelete?.isCircuit) {
            return {
              ...session,
              exercises: session.exercises.filter(e => 
                e.id !== exerciseId && e.circuitId !== exerciseToDelete.circuitId
              ),
              circuits: session.circuits.filter(c => c.id !== exerciseToDelete.circuitId)
            };
          } else if (exerciseToDelete?.isGroup) {
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

  const addSet = (sessionId: string, exerciseId: string, set: Partial<Set> = {}) => {
    const newSet: Set = {
      id: uuidv4(),
      reps: set?.reps || "",
      weight: set?.weight || "",
      rpe: set?.rpe || "",
      rest: set?.rest || ""
    };
    
    if (program.weeks && program.weeks.length > 0) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          const sessionIndex = week.sessions.findIndex(session => session.id === sessionId);
          
          if (sessionIndex >= 0) {
            const updatedSessions = week.sessions.map(session => {
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
            });
            
            return {
              ...week,
              sessions: updatedSessions
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
    }
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
  
  const addCircuit = (sessionId: string, name: string) => {
    const circuitId = uuidv4();
    
    const circuitHeaderExercise: Exercise = {
      id: uuidv4(),
      name: name || "Circuit",
      sets: [],
      notes: "",
      isCircuit: true,
      circuitId
    };
    
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
          const updatedCircuits = session.circuits.map(circuit => 
            circuit.id === circuitId ? { ...circuit, ...updates } : circuit
          );
          
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
            exercises: session.exercises.filter(
              exercise => !(exercise.isCircuit && exercise.circuitId === circuitId) 
                && !(exercise.isInCircuit && exercise.circuitId === circuitId)
            ),
            circuits: session.circuits.filter(circuit => circuit.id !== circuitId)
          };
        }
        return session;
      })
    }));
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
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          const updatedCircuits = session.circuits.map(circuit => {
            if (circuit.id === circuitId) {
              return {
                ...circuit,
                exercises: [...circuit.exercises, newExercise.id]
              };
            }
            return circuit;
          });
          
          const circuitHeaderIndex = session.exercises.findIndex(
            e => e.isCircuit && e.circuitId === circuitId
          );
          
          if (circuitHeaderIndex !== -1) {
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

  const updateProgramDetails = (updates: { name?: string; image?: string }) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      ...updates
    }));
  };

  const updateSettings = (settings: WorkoutSettings) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      settings
    }));
  };

  const saveToLibrary = (type: "program" | "session", id?: string) => {
    if (type === "program") {
      const newLibraryItem = {
        id: uuidv4(),
        name: program.name,
        type: "program" as const,
        data: { ...program }
      };
      
      setWorkoutLibrary(prev => [...prev, newLibraryItem]);
      toast({
        title: "Program Saved",
        description: `"${program.name}" has been added to your library.`
      });
    } else if (type === "session") {
      const sessionId = id || activeSessionId;
      if (!sessionId) return;
      
      const session = program.sessions.find(s => s.id === sessionId);
      if (!session) return;
      
      const newLibraryItem = {
        id: uuidv4(),
        name: session.name,
        type: "session" as const,
        data: { ...session }
      };
      
      setWorkoutLibrary(prev => [...prev, newLibraryItem]);
      toast({
        title: "Session Saved",
        description: `"${session.name}" has been added to your library.`
      });
    }
  };
  
  const importSession = (sessionToImport: WorkoutSession) => {
    const newSession: WorkoutSession = {
      ...sessionToImport,
      id: uuidv4(),
      day: program.sessions.length + 1,
      exercises: sessionToImport.exercises.map(exercise => ({
        ...exercise,
        id: uuidv4(),
        sets: exercise.sets.map(set => ({
          ...set,
          id: uuidv4()
        }))
      })),
      circuits: sessionToImport.circuits.map(circuit => ({
        ...circuit,
        id: uuidv4()
      }))
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: [...prevProgram.sessions, newSession]
    }));
    
    setActiveSessionId(newSession.id);
    
    toast({
      title: "Session Imported",
      description: `"${newSession.name}" has been added to your program."
    });
  };
  
  const importProgram = (programToImport: WorkoutProgram) => {
    const newProgram: WorkoutProgram = {
      ...programToImport,
      id: uuidv4(),
      sessions: programToImport.sessions.map((session, index) => ({
        ...session,
        id: uuidv4(),
        day: index + 1,
        exercises: session.exercises.map(exercise => ({
          ...exercise,
          id: uuidv4(),
          sets: exercise.sets.map(set => ({
            ...set,
            id: uuidv4()
          }))
        })),
        circuits: session.circuits.map(circuit => ({
          ...circuit,
          id: uuidv4()
        }))
      }))
    };
    
    setProgram(newProgram);
    
    if (newProgram.sessions.length > 0) {
      setActiveSessionId(newProgram.sessions[0].id);
    }
    
    toast({
      title: "Program Imported",
      description: `"${newProgram.name}" has been loaded."
    });
  };

  const contextValue: WorkoutContextType = {
    program,
    activeSessionId,
    activeWeekId,
    setActiveSessionId,
    setActiveWeekId,
    
    addSession,
    updateSession,
    deleteSession,
    updateSessionName,
    
    addWeek,
    updateWeek,
    deleteWeek,
    updateWeekName,
    
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
    updateSettings,
    
    resetProgram,
    loadSampleProgram,
    
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata,
    
    workoutLibrary,
    saveToLibrary,
    importSession,
    importProgram
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
