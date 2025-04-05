
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WorkoutsLibraryTab from '@/components/WorkoutsLibraryTab';
import ProgramsLibraryTab from '@/components/ProgramsLibraryTab';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface WorkoutLibrarySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface WorkoutLibrarySidebarRef {
  close: () => void;
}

const WorkoutLibrarySidebar = forwardRef<WorkoutLibrarySidebarRef, WorkoutLibrarySidebarProps>(
  ({ open, onOpenChange }, ref) => {
    const [activeTab, setActiveTab] = useState('workouts');
    
    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      close: () => onOpenChange(false)
    }));

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[500px] sm:w-[540px] bg-dark-100 text-white border-l border-dark-300 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white">Your Fitness Library</SheetTitle>
          </SheetHeader>
          
          <div className="mt-4">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full mb-4 bg-dark-200">
                <TabsTrigger value="workouts" className="data-[state=active]:bg-fitbloom-purple">
                  Workouts
                </TabsTrigger>
                <TabsTrigger value="programs" className="data-[state=active]:bg-fitbloom-purple">
                  Programs
                </TabsTrigger>
                <TabsTrigger value="weeks" className="data-[state=active]:bg-fitbloom-purple">
                  Weeks
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="workouts">
                <WorkoutsLibraryTab onDragStart={() => onOpenChange(false)} />
              </TabsContent>
              
              <TabsContent value="programs">
                <ProgramsLibraryTab />
              </TabsContent>
              
              <TabsContent value="weeks">
                {/* Placeholder for Weeks Library Tab */}
                <div className="text-center py-10 text-gray-400">
                  Weeks library coming soon
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

WorkoutLibrarySidebar.displayName = 'WorkoutLibrarySidebar';

export default WorkoutLibrarySidebar;
