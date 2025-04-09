
import React, { createContext, useContext, ReactNode } from 'react';
import { ProgramSchedule, ScheduledWorkout } from '@/types/schedule';
import { WorkoutProgram } from '@/types/workout';
import { useScheduleOperations } from '@/hooks/useScheduleOperations';

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
    programName: '',
    startDate: '', 
    scheduledWorkouts: [], 
    active: false, 
    createdAt: ''
  }),
  completeWorkout: () => {},
  getScheduledWorkoutById: () => undefined,
});

// Provider component
export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const scheduleOperations = useScheduleOperations();

  return (
    <ScheduleContext.Provider value={scheduleOperations}>
      {children}
    </ScheduleContext.Provider>
  );
};

// Hook for using the schedule context
export const useSchedule = () => useContext(ScheduleContext);
