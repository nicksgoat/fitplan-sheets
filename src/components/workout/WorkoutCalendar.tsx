
import React, { useState, useEffect } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { format, addDays, startOfWeek } from 'date-fns';
import { WorkoutSession } from '@/types/workout';
import WorkoutDayCard from './WorkoutDayCard';
import CalendarHeader from './CalendarHeader';

interface WorkoutCalendarProps {
  onSelectWorkout: (workoutId: string) => void;
}

const WorkoutCalendar = ({ onSelectWorkout }: WorkoutCalendarProps) => {
  const { program, activeWeekId, setActiveWeekId, addWeek, addWorkout } = useWorkout();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  if (!program) return null;
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return {
      date,
      day: format(date, 'EEE'),
      dayNumber: i + 1,
    };
  });
  
  // Find active week or use the first week
  const activeWeek = program.weeks.find(w => w.id === activeWeekId) || program.weeks[0];
  
  // Go to previous week - this now means selecting the previous week in the program
  const goToPreviousWeek = () => {
    if (!activeWeek) return;
    
    const currentWeekIndex = program.weeks.findIndex(w => w.id === activeWeek.id);
    if (currentWeekIndex > 0) {
      const prevWeek = program.weeks[currentWeekIndex - 1];
      setActiveWeekId(prevWeek.id);
    }
  };
  
  // Go to next week - this now means selecting the next week in the program
  const goToNextWeek = () => {
    if (!activeWeek) return;
    
    const currentWeekIndex = program.weeks.findIndex(w => w.id === activeWeek.id);
    if (currentWeekIndex < program.weeks.length - 1) {
      const nextWeek = program.weeks[currentWeekIndex + 1];
      setActiveWeekId(nextWeek.id);
    }
  };
  
  // Handle adding a workout to a specific day
  const handleAddWorkout = (dayNumber: number) => {
    if (activeWeek) {
      const newWorkoutId = addWorkout(activeWeek.id);
      
      // Update the workout's day property
      if (typeof newWorkoutId === 'string') {
        // Find the workout we just created
        const workout = program.workouts.find(w => w.id === newWorkoutId);
        if (workout) {
          // Update its day number
          workout.day = dayNumber;
          
          // Select this workout
          onSelectWorkout(newWorkoutId);
        }
      }
    } else {
      // Create a new week first if there's no active week
      const newWeekId = addWeek();
      if (typeof newWeekId === 'string') {
        const newWorkoutId = addWorkout(newWeekId);
        // Update the workout's day property
        if (typeof newWorkoutId === 'string') {
          // Find the workout we just created
          const workout = program.workouts.find(w => w.id === newWorkoutId);
          if (workout) {
            // Update its day number
            workout.day = dayNumber;
            
            // Select this workout
            onSelectWorkout(newWorkoutId);
          }
        }
      }
    }
  };
  
  // Group workouts by day for the active week
  const workoutsByDay: { [key: number]: WorkoutSession[] } = {};
  if (activeWeek) {
    activeWeek.workouts.forEach(workoutId => {
      const workout = program.workouts.find(w => w.id === workoutId);
      if (workout) {
        if (!workoutsByDay[workout.day]) {
          workoutsByDay[workout.day] = [];
        }
        workoutsByDay[workout.day].push(workout);
      }
    });
  }
  
  // Add a new week
  const handleAddWeek = () => {
    const newWeekId = addWeek();
    if (typeof newWeekId === 'string') {
      // Set the active week to the new week
      setActiveWeekId(newWeekId);
    }
  };
  
  // Effect to update UI when activeWeekId changes
  useEffect(() => {
    if (activeWeekId && program) {
      const weekIndex = program.weeks.findIndex(w => w.id === activeWeekId);
      if (weekIndex !== -1) {
        // This is just for visual feedback when switching weeks
        // We're not actually changing the date, just showing which week is active
        setCurrentWeekStart(prevDate => {
          // Only change the date if we're actually switching weeks
          if (activeWeek && activeWeek.id !== activeWeekId) {
            return addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekIndex * 7);
          }
          return prevDate;
        });
      }
    }
  }, [activeWeekId, program, activeWeek]);

  // Get the current week number (1-based index)
  const currentWeek = activeWeek ? program.weeks.findIndex(w => w.id === activeWeek.id) + 1 : 1;
  const totalWeeks = program.weeks.length;

  return (
    <div className="mb-6">
      <CalendarHeader
        currentWeek={currentWeek}
        totalWeeks={totalWeeks}
        onPrevWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onAddWeek={handleAddWeek}
      />
      
      <div className="flex space-x-2 overflow-x-auto pb-4">
        {weekDays.map(({ date, day, dayNumber }) => (
          <WorkoutDayCard
            key={day}
            date={date}
            day={day}
            dayNumber={dayNumber}
            workouts={workoutsByDay[dayNumber] || []}
            onAddWorkout={handleAddWorkout}
            onSelectWorkout={onSelectWorkout}
            weekId={activeWeek?.id || ''}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkoutCalendar;
