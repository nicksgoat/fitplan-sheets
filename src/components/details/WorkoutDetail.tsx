
import React from 'react';
import { ItemType } from '@/lib/types';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Clock, Tag, DollarSign, X, Share2 } from 'lucide-react';
import { Workout } from '@/types/workout';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/utils/workout';
import WorkoutPreview from '../workout/WorkoutPreview';
import { ClubShareDialog } from '@/components/club/ClubShareDialog';
import { useAuth } from '@/hooks/useAuth';

interface WorkoutDetailProps {
  item: ItemType;
  workoutData?: Workout;
  onClose: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ item, workoutData, onClose }) => {
  const { user } = useAuth();
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  
  // Calculate workout stats
  const totalExercises = workoutData?.exercises.length || 0;
  const totalSets = workoutData?.exercises.reduce((total, exercise) => 
    total + (exercise.sets?.length || 0), 0) || 0;
  
  // Count special exercise types
  const circuitCount = workoutData?.exercises.filter(ex => ex.isCircuit).length || 0;
  const supersetCount = workoutData?.exercises.filter(ex => ex.isCircuit && ex.name === "Superset").length || 0;
  
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
          Day {workoutData?.day || '-'} • {totalExercises} exercises • {totalSets} sets
        </DrawerDescription>
      </DrawerHeader>

      <div className="my-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {circuitCount > 0 && (
            <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
              {circuitCount} Circuit{circuitCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {supersetCount > 0 && (
            <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-800">
              {supersetCount} Superset{supersetCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {workoutData?.isPurchasable && (
            <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
              For Sale
            </Badge>
          )}
        </div>
        
        {workoutData && <WorkoutPreview workout={workoutData} />}

        <div className="text-gray-400 text-xs mt-4">
          <p>Created: {formatDate(workoutData?.savedAt)}</p>
          {workoutData?.lastModified && workoutData.lastModified !== workoutData.savedAt && (
            <p>Last modified: {formatDate(workoutData.lastModified)}</p>
          )}
        </div>
      </div>

      <DrawerFooter className="px-0 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={() => window.location.href = "/sheets"}
          >
            Start Workout
          </Button>
          {user && (
            <Button 
              variant="outline" 
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </DrawerFooter>
      
      {showShareDialog && (
        <ClubShareDialog 
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          contentId={item.id}
          contentType="workout"
        />
      )}
    </div>
  );
};

export default WorkoutDetail;
