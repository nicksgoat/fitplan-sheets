
import { useState, useEffect } from "react";
import { WorkoutProgram, WorkoutSession } from "@/types/workout";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

// Local storage key for workout library
const WORKOUT_LIBRARY_KEY = "workout_library";

interface UseWorkoutLibraryProps {
  program: WorkoutProgram;
  setProgram: React.Dispatch<React.SetStateAction<WorkoutProgram>>;
  setActiveSessionId: (id: string | null) => void;
}

type LibraryItem = {
  id: string;
  name: string;
  type: "program" | "session";
  data: WorkoutProgram | WorkoutSession;
};

export const useWorkoutLibrary = ({
  program,
  setProgram,
  setActiveSessionId
}: UseWorkoutLibraryProps) => {
  // Workout library state
  const [workoutLibrary, setWorkoutLibrary] = useState<LibraryItem[]>([]);
  
  // Load workout library from local storage
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
  
  // Save workout library to local storage when it changes
  useEffect(() => {
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(workoutLibrary));
  }, [workoutLibrary]);

  // Library operations
  const saveToLibrary = (type: "program" | "session", id?: string) => {
    if (type === "program") {
      // Save current program to library
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
      // Save specific session to library
      const sessionId = id || program.sessions[0]?.id;
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
    // Create a copy of the session with new IDs to avoid conflicts
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
      description: `"${newSession.name}" has been added to your program.`
    });
  };
  
  const importProgram = (programToImport: WorkoutProgram) => {
    // Create a copy of the program with new IDs to avoid conflicts
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
      description: `"${newProgram.name}" has been loaded.`
    });
  };

  return {
    workoutLibrary,
    saveToLibrary,
    importSession,
    importProgram
  };
};
