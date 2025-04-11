
import React from 'react';
import { ItemType } from '@/lib/types';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, Clock, Tag, DollarSign, X } from 'lucide-react';
import { WorkoutProgram } from '@/types/workout';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ProgramDetailProps {
  item: ItemType;
  programData?: WorkoutProgram;
  onClose: () => void;
}

const ProgramDetail: React.FC<ProgramDetailProps> = ({ item, programData, onClose }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

  const weekCount = programData?.weeks?.length || 0;
  const workoutCount = programData?.workouts?.length || 0;
  const hasPrice = programData?.isPurchasable && programData?.price && programData.price > 0;

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
            ${Number(programData?.price).toFixed(2)}
          </div>
        )}
        <DrawerDescription className="mt-2">
          Training program with {weekCount} {weekCount === 1 ? 'week' : 'weeks'} and {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
        </DrawerDescription>
      </DrawerHeader>

      <div className="my-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>{weekCount} {weekCount === 1 ? 'Week' : 'Weeks'}</span>
          </div>
          <div className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>{workoutCount} {workoutCount === 1 ? 'Workout' : 'Workouts'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>Updated {formatDate(programData?.lastModified)}</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>{programData?.isPublic ? 'Public' : 'Private'}</span>
          </div>
        </div>

        {programData?.isPurchasable && (
          <Badge className="bg-green-600 mb-4">Available for purchase</Badge>
        )}

        <div className="my-4">
          <h3 className="text-lg font-medium mb-2">Program Structure</h3>
          <div className="space-y-4">
            {programData?.weeks?.map((week, weekIndex) => (
              <div key={week.id} className="border border-gray-700 rounded-md overflow-hidden">
                <div className="bg-dark-300 p-2 px-4">
                  <h4 className="font-medium">Week {weekIndex + 1}: {week.name}</h4>
                </div>
                <div className="divide-y divide-gray-700">
                  {week.workouts.map((workoutId) => {
                    const workout = programData.workouts.find(w => w.id === workoutId);
                    return workout ? (
                      <div key={workout.id} className="p-3 px-4">
                        <div className="flex justify-between">
                          <span>{workout.name}</span>
                          <span className="text-gray-400">Day {workout.day}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {workout.exercises.length} exercises
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-gray-400 text-sm mt-6">
          <p>Created: {formatDate(programData?.savedAt)}</p>
          <p>Last modified: {formatDate(programData?.lastModified)}</p>
        </div>
      </div>

      <DrawerFooter className="px-0">
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={() => window.location.href = "/sheets"}
          >
            Start Program
          </Button>
        </div>
      </DrawerFooter>
    </div>
  );
};

export default ProgramDetail;
