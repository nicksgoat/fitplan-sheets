import React, { useState } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WorkoutsLibraryTab from '@/components/WorkoutsLibraryTab';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface WorkoutLibrarySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkoutLibrarySidebar = ({ open, onOpenChange }: WorkoutLibrarySidebarProps) => {
  const [activeTab, setActiveTab] = useState('workouts');

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
              <WorkoutsLibraryTab />
            </TabsContent>
            
            <TabsContent value="programs">
              {/* Placeholder for Programs Library Tab */}
              <div className="text-center py-10 text-gray-400">
                Programs library coming soon
              </div>
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
};

export default WorkoutLibrarySidebar;
