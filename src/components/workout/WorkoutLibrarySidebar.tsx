
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WorkoutsLibraryTab from '@/components/WorkoutsLibraryTab';
import ProgramsLibraryTab from '@/components/ProgramsLibraryTab';
import WeeksLibraryTab from '@/components/WeeksLibraryTab';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { useSearchParams } from 'react-router-dom';

interface WorkoutLibrarySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface WorkoutLibrarySidebarRef {
  close: () => void;
}

const WorkoutLibrarySidebar = forwardRef<WorkoutLibrarySidebarRef, WorkoutLibrarySidebarProps>(
  ({ open, onOpenChange }, ref) => {
    const [searchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'workouts';
    const [activeTab, setActiveTab] = useState(defaultTab);
    
    // Update active tab based on URL parameter
    useEffect(() => {
      if (searchParams.get('tab')) {
        setActiveTab(searchParams.get('tab') || 'workouts');
      }
    }, [searchParams]);
    
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
              
              <WorkoutProvider>
                <TabsContent value="workouts">
                  <WorkoutsLibraryTab onDragStart={() => onOpenChange(false)} />
                </TabsContent>
                
                <TabsContent value="programs">
                  <ProgramsLibraryTab />
                </TabsContent>
                
                <TabsContent value="weeks">
                  <WeeksLibraryTab />
                </TabsContent>
              </WorkoutProvider>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

WorkoutLibrarySidebar.displayName = 'WorkoutLibrarySidebar';

export default WorkoutLibrarySidebar;
