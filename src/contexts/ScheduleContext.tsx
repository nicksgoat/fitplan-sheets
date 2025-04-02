
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ProgramSchedule, ScheduledWorkout, Workout, WorkoutProgram } from '@/types/workout';
import { format, addDays, parseISO, isSameDay } from 'date-fns';

// Define the context type
interface ScheduleContextType {
  schedules: ProgramSchedule[];
  activeSchedule: ProgramSchedule | null;
  workoutsForDay: (date: Date) => ScheduledWorkout[];
  startProgram: (program: WorkoutProgram, startDate: Date) => ProgramSchedule;
  completeWorkout: (scheduledWorkoutId: string) => void;
  getScheduledWorkoutById: (id: string) => ScheduledWorkout | undefined;
}

// Create the context with a default value
const ScheduleContext = createContext<ScheduleContextType>({
  schedules: [],
  activeSchedule: null,
  workoutsForDay: () => [],
  startProgram: () => ({ 
    id: '', 
    programId: '', 
    startDate: '', 
    scheduledWorkouts: [], 
    active: false, 
    createdAt: ''
  }),
  completeWorkout: () => {},
  getScheduledWorkoutById: () => undefined,
});

// Local storage key
const SCHEDULES_STORAGE_KEY = 'fitbloom-workout-schedules';

// Provider component
export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<ProgramSchedule[]>([]);
  const [activeSchedule, setActiveSchedule] = useState<ProgramSchedule | null>(null);

  // Load schedules from local storage on mount
  useEffect(() => {
    const savedSchedules = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (savedSchedules) {
      const parsedSchedules: ProgramSchedule[] = JSON.parse(savedSchedules);
      setSchedules(parsedSchedules);
      
      // Find the active schedule
      const active = parsedSchedules.find(schedule => schedule.active);
      if (active) {
        setActiveSchedule(active);
      }
    }
  }, []);

  // Save schedules to local storage when they change
  useEffect(() => {
    if (schedules.length > 0) {
      localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules]);

  // Get workouts scheduled for a specific day
  const workoutsForDay = (date: Date): ScheduledWorkout[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return schedules.flatMap(schedule => 
      schedule.scheduledWorkouts.filter(workout => 
        workout.date.substring(0, 10) === dateStr
      )
    );
  };

  // Schedule a program starting from a specific date
  const startProgram = (program: WorkoutProgram, startDate: Date): ProgramSchedule => {
    // Deactivate any current active schedule
    const updatedSchedules = schedules.map(schedule => ({
      ...schedule,
      active: false
    }));

    // Generate a unique ID for the new schedule
    const scheduleId = uuidv4();
    
    // Map out all workouts from the program based on their day numbers
    const scheduledWorkouts: ScheduledWorkout[] = [];
    
    // Track the maximum number of days to calculate end date
    let maxDays = 0;
    
    // For each week in the program
    program.weeks.forEach((week, weekIndex) => {
      // For each workout in the week
      week.workouts.forEach(workoutId => {
        // Find the workout in the program
        const workout = program.workouts.find(w => w.id === workoutId);
        
        if (workout) {
          // Calculate the day offset based on week order and day number
          // Week 1, Day 1 = Day 0
          // Week 1, Day 2 = Day 1
          // Week 2, Day 1 = Day 7 (assuming 7 days per week)
          const dayOffset = (week.order - 1) * 7 + (workout.day - 1);
          
          // Track max days for end date calculation
          if (dayOffset > maxDays) {
            maxDays = dayOffset;
          }
          
          // Calculate the actual date by adding the offset to the start date
          const workoutDate = addDays(startDate, dayOffset);
          
          // Create a scheduled workout
          scheduledWorkouts.push({
            id: uuidv4(),
            date: workoutDate.toISOString(),
            workoutId: workout.id,
            programId: program.id,
            completed: false
          });
        }
      });
    });
    
    // Calculate end date (start date + max days)
    const endDate = addDays(startDate, maxDays);
    
    // Create the new schedule
    const newSchedule: ProgramSchedule = {
      id: scheduleId,
      programId: program.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      scheduledWorkouts,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    // Update state with the new schedule
    setSchedules([...updatedSchedules, newSchedule]);
    setActiveSchedule(newSchedule);
    
    return newSchedule;
  };

  // Mark a workout as completed
  const completeWorkout = (scheduledWorkoutId: string) => {
    setSchedules(prev => 
      prev.map(schedule => ({
        ...schedule,
        scheduledWorkouts: schedule.scheduledWorkouts.map(workout => 
          workout.id === scheduledWorkoutId 
            ? { ...workout, completed: true } 
            : workout
        )
      }))
    );
  };

  // Get a scheduled workout by ID
  const getScheduledWorkoutById = (id: string): ScheduledWorkout | undefined => {
    for (const schedule of schedules) {
      const workout = schedule.scheduledWorkouts.find(w => w.id === id);
      if (workout) return workout;
    }
    return undefined;
  };

  // Context value
  const value = {
    schedules,
    activeSchedule,
    workoutsForDay,
    startProgram,
    completeWorkout,
    getScheduledWorkoutById
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

// Hook for using the schedule context
export const useSchedule = () => useContext(ScheduleContext);
