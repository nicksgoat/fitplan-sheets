
import React from 'react';
import { ItemType } from '@/lib/types';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import ExerciseDetail from './ExerciseDetail';
import WorkoutDetail from './WorkoutDetail';
import ProgramDetail from './ProgramDetail';
import { useLibrary } from '@/contexts/LibraryContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Play } from 'lucide-react';

interface DetailDrawerProps {
  item: ItemType;
  children: React.ReactNode;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ item, children }) => {
  const [open, setOpen] = React.useState(false);
  const { workouts, programs } = useLibrary();
  const navigate = useNavigate();

  // Find the actual complete workout or program data from the library
  const workoutData = item.type === 'workout' 
    ? workouts.find(workout => workout.id === item.id)
    : undefined;
    
  const programData = item.type === 'program' 
    ? programs.find(program => program.id === item.id)
    : undefined;

  const handleClose = () => {
    setOpen(false);
  };

  // Start logging workout
  const startWorkoutLog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    
    if (item.type === 'workout') {
      navigate(`/workout-logger/${item.id}`);
    } else if (item.type === 'program') {
      navigate(`/workout-logger?programId=${item.id}`);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="cursor-pointer w-full h-full">
          {children}
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-black text-white border-t border-gray-800 max-h-[90vh]">
        {item.type === 'exercise' && (
          <ExerciseDetail item={item} onClose={handleClose} />
        )}
        {item.type === 'workout' && (
          <>
            <WorkoutDetail item={item} workoutData={workoutData} onClose={handleClose} />
            <div className="fixed bottom-8 right-8">
              <Button 
                onClick={startWorkoutLog}
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 rounded-full h-12 w-12 shadow-lg"
                size="icon"
                title="Log this workout"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        {item.type === 'program' && (
          <>
            <ProgramDetail item={item} programData={programData} onClose={handleClose} />
            <div className="fixed bottom-8 right-8">
              <Button 
                onClick={startWorkoutLog}
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 rounded-full h-12 w-12 shadow-lg"
                size="icon"
                title="Start program workout"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        {item.type === 'collection' && (
          // For collections, we'll use the Exercise detail as a fallback
          // Later, you can create a dedicated CollectionDetail component
          <ExerciseDetail item={item} onClose={handleClose} />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DetailDrawer;
