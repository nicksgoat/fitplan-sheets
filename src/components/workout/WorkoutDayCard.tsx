
import React from 'react';
import { useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemTypes } from '@/hooks/useWorkoutLibraryIntegration';
import { WorkoutSession } from '@/types/workout';
import WorkoutItem from './WorkoutItem';
import { toast } from 'sonner';
import { useWorkout } from '@/contexts/WorkoutContext';

interface WorkoutDayCardProps {
  date: Date;
  day: string;
  dayNumber: number;
  workouts: WorkoutSession[];
  onAddWorkout: (dayNumber: number) => void;
  onSelectWorkout: (workoutId: string) => void;
  weekId: string;
}

const WorkoutDayCard = ({ 
  date, 
  day, 
  dayNumber, 
  workouts, 
  onAddWorkout, 
  onSelectWorkout, 
  weekId 
}: WorkoutDayCardProps) => {
  const { updateWorkout, loadWorkoutFromLibrary } = useWorkout();
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.WORKOUT, ItemTypes.LIBRARY_WORKOUT],
    drop: (item: { id: string; weekId?: string; sourceDay?: number; fromLibrary?: boolean; workout?: any }) => {
      // Handle different types of drops
      if (item.fromLibrary) {
        // This is a library workout being dropped - load it into the current week at this day
        const newWorkoutId = loadWorkoutFromLibrary(item.workout, weekId, dayNumber);
        console.log(`Added library workout to day ${dayNumber} in week ${weekId}`);
        toast.success(`Added "${item.workout.name}" to day ${dayNumber}`);
        
        return { didDrop: true };
      } else {
        // When a workout is dropped from calendar, update its day number and week
        updateWorkout(item.id, (workout) => {
          // Only update the day if it's different
          if (workout.day !== dayNumber || workout.weekId !== weekId) {
            workout.day = dayNumber;
            workout.weekId = weekId;
            console.log(`Moved workout ${item.id} to day ${dayNumber} in week ${weekId}`);
            toast.success(`Moved workout to day ${dayNumber}`);
          }
        });
        return { didDrop: true };
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [dayNumber, weekId, updateWorkout, loadWorkoutFromLibrary]);

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

export default WorkoutDayCard;
