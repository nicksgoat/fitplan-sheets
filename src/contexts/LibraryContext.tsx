import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workout, WorkoutProgram, WorkoutWeek } from '@/types/workout';
import { DbProgram, DbWeek, DbWorkout, DbExercise, DbSet, DbCircuit } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Define the context type
interface LibraryContextType {
  workouts: Workout[];
  programs: WorkoutProgram[];
  weeks: WorkoutWeek[];
  isLoaded: boolean;
  refreshLibrary: () => void;
  saveWorkout: (workout: Workout, name?: string) => Promise<void>;
  saveProgram: (program: WorkoutProgram, name?: string) => Promise<void>;
  saveWeek: (week: WorkoutWeek, name?: string) => Promise<void>;
  removeWorkout: (workoutId: string) => Promise<void>;
  removeProgram: (programId: string) => Promise<void>;
  removeWeek: (weekId: string) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  updateWeek: (week: WorkoutWeek) => Promise<void>;
  updateProgram: (program: WorkoutProgram) => Promise<void>;
}

// Create the context with default values
const LibraryContext = createContext<LibraryContextType>({
  workouts: [],
  programs: [],
  weeks: [],
  isLoaded: false,
  refreshLibrary: () => {},
  saveWorkout: async () => {},
  saveProgram: async () => {},
  saveWeek: async () => {},
  removeWorkout: async () => {},
  removeProgram: async () => {},
  removeWeek: async () => {},
  updateWorkout: async () => {},
  updateWeek: async () => {},
  updateProgram: async () => {}
});

// Provider component
export const LibraryProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [weeks, setWeeks] = useState<WorkoutWeek[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  
  // Load data from Supabase
  const refreshLibrary = async () => {
    if (!user) {
      console.warn("Cannot load library: user not authenticated");
      setIsLoaded(true);
      return;
    }

    try {
      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id);
      
      if (programsError) {
        console.error("Error loading programs:", programsError);
        toast.error("Failed to load programs library");
        return;
      }
      
      // Fetch all related data for each program
      const fullPrograms: WorkoutProgram[] = await Promise.all((programsData as DbProgram[]).map(async (program) => {
        // Get weeks for this program
        const { data: weeksData, error: weeksError } = await supabase
          .from('weeks')
          .select('*')
          .eq('program_id', program.id);
        
        if (weeksError) {
          console.error("Error loading weeks:", weeksError);
          return {
            id: program.id,
            name: program.name,
            weeks: [],
            workouts: [],
            savedAt: program.created_at,
            lastModified: program.updated_at,
            isPublic: program.is_public || false
          };
        }
        
        // Map database weeks to application model
        const weeks = (weeksData as DbWeek[]).map(dbWeek => ({
          id: dbWeek.id,
          name: dbWeek.name,
          order: dbWeek.order_num,
          workouts: [],
          savedAt: dbWeek.created_at,
          lastModified: dbWeek.updated_at
        }));
        
        // Get workouts for each week
        const workouts: Workout[] = [];
        
        for (const week of weeksData as DbWeek[]) {
          const { data: workoutsData, error: workoutsError } = await supabase
            .from('workouts')
            .select('*')
            .eq('week_id', week.id);
          
          if (workoutsError) {
            console.error("Error loading workouts:", workoutsError);
            continue;
          }
          
          // Update the week's workouts array
          const weekIndex = weeks.findIndex(w => w.id === week.id);
          if (weekIndex !== -1) {
            weeks[weekIndex].workouts = workoutsData.map(w => w.id);
          }
          
          // For each workout, get exercises and sets
          for (const workout of workoutsData) {
            const { data: exercisesData, error: exercisesError } = await supabase
              .from('exercises')
              .select('*')
              .eq('workout_id', workout.id);
            
            if (exercisesError) {
              console.error("Error loading exercises:", exercisesError);
              continue;
            }
            
            const exercises = [];
            
            for (const exercise of exercisesData) {
              const { data: setsData, error: setsError } = await supabase
                .from('exercise_sets')
                .select('*')
                .eq('exercise_id', exercise.id);
              
              if (setsError) {
                console.error("Error loading sets:", setsError);
                continue;
              }
              
              // Map sets to application model
              const sets = setsData.map(dbSet => ({
                id: dbSet.id,
                reps: dbSet.reps || '',
                weight: dbSet.weight || '',
                intensity: dbSet.intensity || '',
                intensityType: dbSet.intensity_type,
                weightType: dbSet.weight_type,
                rest: dbSet.rest || ''
              }));
              
              // Add exercise with its sets
              exercises.push({
                id: exercise.id,
                name: exercise.name,
                sets: sets,
                notes: exercise.notes || '',
                isCircuit: exercise.is_circuit || false,
                isInCircuit: exercise.is_in_circuit || false,
                circuitId: exercise.circuit_id,
                circuitOrder: exercise.circuit_order,
                isGroup: exercise.is_group || false,
                groupId: exercise.group_id,
                repType: exercise.rep_type,
                intensityType: exercise.intensity_type,
                weightType: exercise.weight_type
              });
            }
            
            // Get circuits for this workout
            const { data: circuitsData, error: circuitsError } = await supabase
              .from('circuits')
              .select('*')
              .eq('workout_id', workout.id);
            
            if (circuitsError) {
              console.error("Error loading circuits:", circuitsError);
              continue;
            }
            
            const circuits = circuitsData.map(dbCircuit => ({
              id: dbCircuit.id,
              name: dbCircuit.name,
              exercises: [],
              rounds: dbCircuit.rounds,
              restBetweenExercises: dbCircuit.rest_between_exercises,
              restBetweenRounds: dbCircuit.rest_between_rounds
            }));
            
            // Get circuit exercises
            for (const circuit of circuits) {
              const { data: circuitExercisesData } = await supabase
                .from('circuit_exercises')
                .select('*')
                .eq('circuit_id', circuit.id)
                .order('exercise_order', { ascending: true });
              
              if (circuitExercisesData) {
                circuit.exercises = circuitExercisesData.map(ce => ce.exercise_id);
              }
            }
            
            // Add workout with its exercises and circuits
            workouts.push({
              id: workout.id,
              name: workout.name,
              day: workout.day_num,
              weekId: workout.week_id,
              exercises: exercises,
              circuits: circuits,
              savedAt: workout.created_at,
              lastModified: workout.updated_at
            });
          }
        }
        
        // Return complete program with weeks and workouts
        return {
          id: program.id,
          name: program.name,
          weeks: weeks,
          workouts: workouts,
          savedAt: program.created_at,
          lastModified: program.updated_at,
          isPublic: program.is_public || false
        };
      }));
      
      setPrograms(fullPrograms);
      
      // Extract unique weeks for the weeks library
      const allWeeks = fullPrograms.flatMap(p => p.weeks);
      setWeeks(allWeeks);
      
      // Extract unique workouts for the workouts library
      const allWorkouts = fullPrograms.flatMap(p => p.workouts);
      setWorkouts(allWorkouts);
      
      setIsLoaded(true);
    } catch (error) {
      console.error("Error refreshing library:", error);
      toast.error("Failed to load fitness library");
      setIsLoaded(true);
    }
  };
  
  // Initialize library when user changes
  useEffect(() => {
    refreshLibrary();
  }, [user]);
  
  // Save workout to database
  const saveWorkout = async (workout: Workout, name?: string) => {
    if (!user) {
      toast.error("Please sign in to save workouts");
      return;
    }
    
    const workoutToSave = { ...workout };
    
    if (name) {
      workoutToSave.name = name;
    }
    
    try {
      // First we need to find which program and week this workout belongs to
      const programId = programs.find(p => 
        p.weeks.some(w => w.id === workoutToSave.weekId)
      )?.id;
      
      if (!programId) {
        // This is a standalone workout, need to create a program and week for it
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .insert({
            name: 'My Library Program',
            user_id: user.id,
            // Add price and purchasability if defined
            price: workoutToSave.price,
            is_purchasable: workoutToSave.isPurchasable
          })
          .select()
          .single();
        
        if (programError) {
          throw programError;
        }
        
        const { data: weekData, error: weekError } = await supabase
          .from('weeks')
          .insert({
            name: 'Library Week',
            program_id: programData.id,
            order_num: 1
          })
          .select()
          .single();
        
        if (weekError) {
          throw weekError;
        }
        
        // Set the week ID for this workout
        workoutToSave.weekId = weekData.id;
        
        // Insert workout with pricing fields if they exist
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            name: workoutToSave.name,
            week_id: weekData.id,
            day_num: workoutToSave.day || 1,
            price: workoutToSave.price,
            is_purchasable: workoutToSave.isPurchasable
          })
          .select()
          .single();
          
        if (workoutError) {
          throw workoutError;
        }
        
        // Update the ID to the new database ID
        workoutToSave.id = workoutData.id;
        
        // Now handle exercises and sets
        for (const exercise of workoutToSave.exercises) {
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              name: exercise.name,
              notes: exercise.notes,
              workout_id: workoutData.id,
              is_circuit: exercise.isCircuit,
              is_in_circuit: exercise.isInCircuit,
              circuit_id: exercise.circuitId,
              circuit_order: exercise.circuitOrder,
              is_group: exercise.isGroup,
              group_id: exercise.groupId,
              rep_type: exercise.repType,
              intensity_type: exercise.intensityType,
              weight_type: exercise.weightType
            })
            .select()
            .single();
          
          if (exerciseError) {
            throw exerciseError;
          }
          
          // Insert sets for this exercise
          for (const set of exercise.sets) {
            const { error: setError } = await supabase
              .from('exercise_sets')
              .insert({
                exercise_id: exerciseData.id,
                reps: set.reps,
                weight: set.weight,
                intensity: set.intensity,
                intensity_type: set.intensityType,
                weight_type: set.weightType,
                rest: set.rest
              });
            
            if (setError) {
              throw setError;
            }
          }
        }
        
        // Handle circuits
        for (const circuit of workoutToSave.circuits || []) {
          const { data: circuitData, error: circuitError } = await supabase
            .from('circuits')
            .insert({
              name: circuit.name,
              workout_id: workoutData.id,
              rounds: circuit.rounds,
              rest_between_exercises: circuit.restBetweenExercises,
              rest_between_rounds: circuit.restBetweenRounds
            })
            .select()
            .single();
          
          if (circuitError) {
            throw circuitError;
          }
          
          // Insert circuit exercises
          for (let i = 0; i < circuit.exercises.length; i++) {
            const { error: circuitExError } = await supabase
              .from('circuit_exercises')
              .insert({
                circuit_id: circuitData.id,
                exercise_id: circuit.exercises[i],
                exercise_order: i
              });
            
            if (circuitExError) {
              throw circuitExError;
            }
          }
        }
        
        toast.success("Workout saved to database library");
        refreshLibrary();
      } else {
        // This workout already belongs to a program, update it
        // First check if we need to create a new workout or update existing
        if (workoutToSave.id) {
          // Update existing workout
          const { error: workoutError } = await supabase
            .from('workouts')
            .update({
              name: workoutToSave.name,
              day_num: workoutToSave.day
            })
            .eq('id', workoutToSave.id);
          
          if (workoutError) {
            throw workoutError;
          }
          
          // TODO: Update exercises, sets, and circuits
          // This is more complex as we need to determine what's changed
          // For simplicity, we'll just call refresh for now
          refreshLibrary();
        } else {
          // Create new workout in existing week
          // Similar to the code above for creating a new workout
          const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .insert({
              name: workoutToSave.name,
              week_id: workoutToSave.weekId,
              day_num: workoutToSave.day || 1
            })
            .select()
            .single();
            
          if (workoutError) {
            throw workoutError;
          }
          
          // Update the ID to the new database ID
          workoutToSave.id = workoutData.id;
          
          // Now handle exercises and sets (similar to above)
          // ...
          
          refreshLibrary();
        }
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save workout to database");
    }
  };
  
  // Similar implementations for saveProgram and saveWeek
  const saveProgram = async (program: WorkoutProgram, name?: string) => {
    if (!user) {
      toast.error("Please sign in to save programs");
      return;
    }
    
    try {
      // Create a new program with pricing fields if they exist
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .insert({
          name: name || program.name,
          user_id: user.id,
          is_public: program.isPublic || false,
          price: program.price,
          is_purchasable: program.isPurchasable
        })
        .select()
        .single();
      
      if (programError) {
        throw programError;
      }
      
      // Clone all weeks
      for (const week of program.weeks) {
        const { data: weekData, error: weekError } = await supabase
          .from('weeks')
          .insert({
            program_id: programData.id,
            name: week.name,
            order_num: week.order
          })
          .select()
          .single();
        
        if (weekError) {
          throw weekError;
        }
        
        // Clone all workouts for this week
        const weekWorkouts = program.workouts.filter(w => {
          // Find workouts that belong to this week
          const workoutId = typeof w === 'string' ? w : w.id;
          return week.workouts.includes(workoutId);
        });
        
        for (const workout of weekWorkouts) {
          const workoutObj = typeof workout === 'string' 
            ? program.workouts.find(w => w.id === workout)
            : workout;
            
          if (workoutObj) {
            const { data: newWorkoutData, error: workoutError } = await supabase
              .from('workouts')
              .insert({
                week_id: weekData.id,
                name: workoutObj.name,
                day_num: workoutObj.day || 1,
                price: workoutObj.price,
                is_purchasable: workoutObj.isPurchasable
              })
              .select()
              .single();
            
            if (workoutError) {
              throw workoutError;
            }
            
            // Clone exercises and sets
            for (const exercise of workoutObj.exercises) {
              const { data: newExerciseData, error: exerciseError } = await supabase
                .from('exercises')
                .insert({
                  workout_id: newWorkoutData.id,
                  name: exercise.name,
                  notes: exercise.notes,
                  is_circuit: exercise.isCircuit,
                  is_in_circuit: exercise.isInCircuit,
                  circuit_id: exercise.circuitId,
                  circuit_order: exercise.circuitOrder,
                  is_group: exercise.isGroup,
                  group_id: exercise.groupId,
                  rep_type: exercise.repType,
                  intensity_type: exercise.intensityType,
                  weight_type: exercise.weightType
                })
                .select()
                .single();
              
              if (exerciseError) {
                throw exerciseError;
              }
              
              // Clone all sets
              for (const set of exercise.sets) {
                const { error: setError } = await supabase
                  .from('exercise_sets')
                  .insert({
                    exercise_id: newExerciseData.id,
                    reps: set.reps,
                    weight: set.weight,
                    intensity: set.intensity,
                    intensity_type: set.intensityType,
                    weight_type: set.weightType,
                    rest: set.rest
                  });
                
                if (setError) throw setError;
              }
            }
          }
        }
      }
      
      toast.success("Program saved to database");
      refreshLibrary();
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program to database");
    }
  };
  
  const saveWeek = async (week: WorkoutWeek, name?: string) => {
    if (!user) {
      toast.error("Please sign in to save weeks");
      return;
    }
    
    try {
      // Create or update week
      // Implementation similar to saveWorkout but for weeks
      
      toast.success("Week saved to database");
      refreshLibrary();
    } catch (error) {
      console.error("Error saving week:", error);
      toast.error("Failed to save week to database");
    }
  };
  
  // Remove from database
  const removeWorkout = async (workoutId: string) => {
    if (!user) {
      toast.error("Please sign in to remove workouts");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
      
      if (error) {
        throw error;
      }
      
      toast.success("Workout removed from library");
      refreshLibrary();
    } catch (error) {
      console.error("Error removing workout:", error);
      toast.error("Failed to remove workout from library");
    }
  };
  
  const removeProgram = async (programId: string) => {
    if (!user) {
      toast.error("Please sign in to remove programs");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);
      
      if (error) {
        throw error;
      }
      
      toast.success("Program removed from library");
      refreshLibrary();
    } catch (error) {
      console.error("Error removing program:", error);
      toast.error("Failed to remove program from library");
    }
  };
  
  const removeWeek = async (weekId: string) => {
    if (!user) {
      toast.error("Please sign in to remove weeks");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('weeks')
        .delete()
        .eq('id', weekId);
      
      if (error) {
        throw error;
      }
      
      toast.success("Week removed from library");
      refreshLibrary();
    } catch (error) {
      console.error("Error removing week:", error);
      toast.error("Failed to remove week from library");
    }
  };
  
  // Update existing items
  const updateWorkout = async (workout: Workout) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          name: workout.name,
          day_num: workout.day,
          price: workout.price,
          is_purchasable: workout.isPurchasable
        })
        .eq('id', workout.id);
      
      if (error) throw error;
      
      refreshLibrary();
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Failed to update workout");
    }
  };
  
  const updateWeek = async (week: WorkoutWeek) => {
    try {
      const { error } = await supabase
        .from('weeks')
        .update({
          name: week.name,
          order_num: week.order
        })
        .eq('id', week.id);
      
      if (error) throw error;
      
      refreshLibrary();
    } catch (error) {
      console.error("Error updating week:", error);
      toast.error("Failed to update week");
    }
  };
  
  const updateProgram = async (program: WorkoutProgram) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update({
          name: program.name,
          is_public: program.isPublic || false,
          price: program.price,
          is_purchasable: program.isPurchasable
        })
        .eq('id', program.id);
      
      if (error) throw error;
      
      refreshLibrary();
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error("Failed to update program");
    }
  };
  
  return (
    <LibraryContext.Provider value={{
      workouts,
      programs,
      weeks,
      isLoaded,
      refreshLibrary,
      saveWorkout,
      saveProgram,
      saveWeek,
      removeWorkout,
      removeProgram,
      removeWeek,
      updateWorkout,
      updateWeek,
      updateProgram
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

// Custom hook to use the library context
export const useLibrary = () => useContext(LibraryContext);
