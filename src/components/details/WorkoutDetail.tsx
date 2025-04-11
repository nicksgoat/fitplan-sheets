
import React from 'react';
import { ItemType } from '@/lib/types';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Clock, Tag, DollarSign, X } from 'lucide-react';
import { Workout } from '@/types/workout';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface WorkoutDetailProps {
  item: ItemType;
  workoutData?: Workout;
  onClose: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ item, workoutData, onClose }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

  // Count sets across all exercises
  const totalSets = workoutData?.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0) || 0;

  const hasPrice = workoutData?.isPurchasable && workoutData?.price && workoutData.price > 0;

  return (
    <div className="max-h-[85vh] overflow-y-auto p-4">
      <DrawerHeader className="px-0">
        <div className="flex items-center justify-between">
          <DrawerTitle className="text-2xl font-bold">{item.title}</DrawerTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {hasPrice && (
          <div className="flex items-center mt-2 text-lg font-semibold text-green-500">
            <DollarSign className="h-5 w-5 mr-1" />
            ${Number(workoutData?.price).toFixed(2)}
          </div>
        )}
        <DrawerDescription className="mt-2">
          Day {workoutData?.day} workout with {workoutData?.exercises.length || 0} exercises
        </DrawerDescription>
      </DrawerHeader>

      <div className="my-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>{workoutData?.exercises.length || 0} Exercises</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>Day {workoutData?.day || 1}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>~{totalSets} Sets Total</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>Custom</span>
          </div>
        </div>

        {workoutData?.isPurchasable && (
          <Badge className="bg-green-600 mb-4">Available for purchase</Badge>
        )}

        <div className="my-4">
          <h3 className="text-lg font-medium mb-2">Exercises</h3>
          <div className="space-y-2">
            {workoutData?.exercises.map((exercise, index) => (
              <div key={exercise.id} className="p-3 border border-gray-700 rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium">{index + 1}. {exercise.name}</span>
                  <span className="text-gray-400">{exercise.sets.length} sets</span>
                </div>
                {exercise.notes && (
                  <p className="text-sm text-gray-400 mt-1">{exercise.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-gray-400 text-sm mt-6">
          <p>Created: {formatDate(workoutData?.savedAt)}</p>
          <p>Last modified: {formatDate(workoutData?.lastModified)}</p>
        </div>
      </div>

      <DrawerFooter className="px-0">
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={() => window.location.href = "/sheets"}
          >
            Start Workout
          </Button>
        </div>
      </DrawerFooter>
    </div>
  );
};

export default WorkoutDetail;
