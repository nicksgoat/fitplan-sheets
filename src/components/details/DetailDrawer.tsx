
import React from 'react';
import { ItemType } from '@/lib/types';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import ExerciseDetail from './ExerciseDetail';
import WorkoutDetail from './WorkoutDetail';
import ProgramDetail from './ProgramDetail';

interface DetailDrawerProps {
  item: ItemType;
  children: React.ReactNode;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ item, children }) => {
  const [open, setOpen] = React.useState(false);

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
          <WorkoutDetail item={item} onClose={handleClose} />
        )}
        {item.type === 'program' && (
          <ProgramDetail item={item} onClose={handleClose} />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DetailDrawer;
