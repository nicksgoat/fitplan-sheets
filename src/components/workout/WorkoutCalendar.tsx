
import React, { useState, useEffect } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { format, addDays, startOfWeek } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { WorkoutSession } from '@/types/workout';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Define the draggable item type
const ItemTypes = {
  WORKOUT: 'workout'
};

interface WorkoutDayCardProps {
  date: Date;
  day: string;
  dayNumber: number;
  workouts: WorkoutSession[];
  onAddWorkout: (dayNumber: number) => void;
  onSelectWorkout: (workoutId: string) => void;
  weekId: string;
}

// Component for each workout item that can be dragged
const WorkoutItem = ({ workout, onSelect }: { workout: WorkoutSession; onSelect: () => void }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORKOUT,
    item: { 
      id: workout.id, 
      weekId: workout.weekId, 
      sourceDay: workout.day 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700 transition-colors ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      onClick={onSelect}
    >
      <h4 className="text-sm font-medium">{workout.name}</h4>
      <p className="text-xs text-gray-400 mt-1">{workout.exercises.length} exercises</p>
    </div>
  );
};

// Component for each day in the calendar
const WorkoutDayCard = ({ date, day, dayNumber, workouts, onAddWorkout, onSelectWorkout, weekId }: WorkoutDayCardProps) => {
  const { updateWorkout } = useWorkout();
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORKOUT,
    drop: (item: { id: string; weekId: string; sourceDay: number }) => {
      // When a workout is dropped, update its day number and week
      updateWorkout(item.id, (workout) => {
        // Only update the day if it's different
        if (workout.day !== dayNumber || workout.weekId !== weekId) {
          workout.day = dayNumber;
          workout.weekId = weekId;
          console.log(`Moved workout ${item.id} to day ${dayNumber} in week ${weekId}`);
        }
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [dayNumber, weekId, updateWorkout]);

  return (
    <div 
      ref={drop} 
      className={`flex-1 min-w-[150px] ${isOver ? 'bg-gray-800/50' : ''}`}
    >
      <Card className={`h-full bg-dark-200 border-dark-300 ${isOver ? 'border-fitbloom-purple border-2' : ''}`}>
        <CardHeader className="py-2 px-3 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium">{day}</CardTitle>
              <p className="text-xs text-gray-400">Day {dayNumber}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={() => onAddWorkout(dayNumber)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 space-y-2 overflow-y-auto max-h-[300px]">
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <WorkoutItem 
                key={workout.id} 
                workout={workout}
                onSelect={() => onSelectWorkout(workout.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-16 text-gray-500">
              <p className="text-xs">No workouts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

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
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-fitbloom-purple" />
            <h2 className="text-lg font-semibold">Program Calendar</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={goToPreviousWeek}
                className="text-gray-400 hover:text-white"
                disabled={!activeWeek || program.weeks.findIndex(w => w.id === activeWeek.id) === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <span className="text-sm">
                Week {activeWeek ? program.weeks.findIndex(w => w.id === activeWeek.id) + 1 : 1}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={goToNextWeek}
                className="text-gray-400 hover:text-white"
                disabled={!activeWeek || program.weeks.findIndex(w => w.id === activeWeek.id) === program.weeks.length - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddWeek}
              className="text-xs flex items-center gap-1 border-gray-700 hover:bg-gray-700"
            >
              <Plus className="h-3 w-3" />
              New Week
            </Button>
          </div>
        </div>
        
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
    </DndProvider>
  );
};

export default WorkoutCalendar;
