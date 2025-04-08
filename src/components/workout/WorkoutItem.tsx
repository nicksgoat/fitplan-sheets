
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/hooks/useWorkoutLibraryIntegration';
import { WorkoutSession } from '@/types/workout';

interface WorkoutItemProps {
  workout: WorkoutSession; 
  onSelect: () => void;
}

const WorkoutItem = ({ workout, onSelect }: WorkoutItemProps) => {
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

export default WorkoutItem;
