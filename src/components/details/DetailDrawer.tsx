
import React from 'react';
import { ItemType } from '@/lib/types';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import ExerciseDetail from './ExerciseDetail';
import WorkoutDetail from './WorkoutDetail';
import ProgramDetail from './ProgramDetail';
import { useLibrary } from '@/contexts/LibraryContext';

interface DetailDrawerProps {
  item: ItemType;
  children: React.ReactNode;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ item, children }) => {
  const [open, setOpen] = React.useState(false);
  const { workouts, programs } = useLibrary();

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
          <WorkoutDetail item={item} workoutData={workoutData} onClose={handleClose} />
        )}
        {item.type === 'program' && (
          <ProgramDetail item={item} programData={programData} onClose={handleClose} />
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
