
import React from 'react';
import { ItemType } from '@/lib/types';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Clock, Tag, DollarSign, X } from 'lucide-react';
import { Workout } from '@/types/workout';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/utils/workout';
import WorkoutPreview from '../workout/WorkoutPreview';

interface WorkoutDetailProps {
  item: ItemType;
  workoutData?: Workout;
  onClose: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ item, workoutData, onClose }) => {
  // Calculate total sets
  const totalSets = workoutData?.exercises.reduce((total, exercise) => 
    total + (exercise.sets?.length || 0), 0) || 0;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

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
            {formatCurrency(workoutData?.price || 0)}
          </div>
        )}
        <DrawerDescription className="mt-2">
          Day {workoutData?.day} • {workoutData?.exercises.length || 0} exercises
        </DrawerDescription>
      </DrawerHeader>

      <div className="my-4">
        {workoutData && <WorkoutPreview workout={workoutData} />}

        {workoutData?.isPurchasable && (
          <Badge className="bg-green-600 mt-4 mb-2">Available for purchase</Badge>
        )}

        <div className="text-gray-400 text-xs mt-4">
          <p>Created: {formatDate(workoutData?.savedAt)}</p>
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
