
import React, { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/hooks/useWorkoutLibraryIntegration';
import { WorkoutSession } from '@/types/workout';
import { Trash2 } from 'lucide-react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { buildCreatorProductUrl } from '@/utils/urlUtils';

interface WorkoutItemProps {
  workout: WorkoutSession; 
  onSelect: () => void;
}

const WorkoutItem = ({ workout, onSelect }: WorkoutItemProps) => {
  const { deleteWorkout } = useWorkout();
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);
  
  // Try to get creator username if this is a published workout
  useEffect(() => {
    const getCreatorUsername = async () => {
      if (workout.creatorId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', workout.creatorId)
            .maybeSingle();
            
          if (!error && data?.username) {
            setCreatorUsername(data.username);
          }
        } catch (err) {
          console.error("Error getting creator username:", err);
        }
      }
    };
    
    getCreatorUsername();
  }, [workout.creatorId]);
  
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    if (workout.weekId) {
      deleteWorkout(workout.weekId, workout.id);
      toast.success(`"${workout.name}" has been removed`);
    }
  };

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700 transition-colors ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">{workout.name}</h4>
        <button 
          onClick={handleDelete} 
          className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-gray-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">{workout.exercises.length} exercises</p>
    </div>
  );
};

export default WorkoutItem;
