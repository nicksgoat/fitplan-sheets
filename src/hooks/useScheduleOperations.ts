
import { useState, useEffect } from 'react';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { ProgramSchedule, ScheduledWorkout } from '@/types/schedule';
import { WorkoutProgram } from '@/types/workout';

// Local storage key
const SCHEDULES_STORAGE_KEY = 'fitbloom-workout-schedules';

export function useScheduleOperations() {
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
    // Debug log to see what's coming in
    console.log("Starting program:", program);
    console.log("Program weeks:", program.weeks);
    console.log("Program workouts:", program.workouts);
    
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
    
    // Ensure we have valid weeks and workouts in the program
    if (!program.weeks || program.weeks.length === 0) {
      console.warn("Program has no weeks defined");
      return {
        id: scheduleId,
        programId: program.id,
        programName: program.name,
        startDate: startDate.toISOString(),
        endDate: startDate.toISOString(),
        scheduledWorkouts: [],
        active: true,
        createdAt: new Date().toISOString()
      };
    }
    
    // For each week in the program
    program.weeks.forEach((week, weekIndex) => {
      // Ensure the week has valid workouts defined
      if (!week.workouts || week.workouts.length === 0) {
        console.warn(`Week ${week.name} has no workouts defined`);
        return;
      }
      
      // For each workout in the week
      week.workouts.forEach(workoutId => {
        // Find the workout in the program's workouts array
        const workout = program.workouts.find(w => w.id === workoutId);
        
        if (workout) {
          // Calculate the day offset based on week order and day number
          const dayOffset = (week.order - 1) * 7 + (workout.day - 1);
          
          // Track max days for end date calculation
          if (dayOffset > maxDays) {
            maxDays = dayOffset;
          }
          
          // Calculate the actual date by adding the offset to the start date
          const workoutDate = addDays(startDate, dayOffset);
          
          // Create a scheduled workout with the workout name
          const scheduledWorkout: ScheduledWorkout = {
            id: uuidv4(),
            date: workoutDate.toISOString(),
            workoutId: workout.id,
            programId: program.id,
            completed: false,
            name: workout.name
          };
          
          // Debug log each scheduled workout
          console.log(`Scheduling workout "${workout.name}" for ${format(workoutDate, 'yyyy-MM-dd')}`);
          
          scheduledWorkouts.push(scheduledWorkout);
        } else {
          console.warn(`Workout with ID ${workoutId} not found in program`);
        }
      });
    });
    
    // Log the final scheduled workouts for debugging
    console.log("Final scheduled workouts:", scheduledWorkouts);
    
    // Calculate end date (start date + max days)
    const endDate = addDays(startDate, maxDays);
    
    // Create the new schedule
    const newSchedule: ProgramSchedule = {
      id: scheduleId,
      programId: program.id,
      programName: program.name,
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
    
    // Update the active schedule if necessary
    if (activeSchedule) {
      const updatedWorkouts = activeSchedule.scheduledWorkouts.map(workout => 
        workout.id === scheduledWorkoutId 
          ? { ...workout, completed: true } 
          : workout
      );
      
      setActiveSchedule({
        ...activeSchedule,
        scheduledWorkouts: updatedWorkouts
      });
    }
  };

  // Get a scheduled workout by ID
  const getScheduledWorkoutById = (id: string): ScheduledWorkout | undefined => {
    for (const schedule of schedules) {
      const workout = schedule.scheduledWorkouts.find(w => w.id === id);
      if (workout) return workout;
    }
    return undefined;
  };

  return {
    schedules,
    activeSchedule,
    workoutsForDay,
    startProgram,
    completeWorkout,
    getScheduledWorkoutById
  };
}
