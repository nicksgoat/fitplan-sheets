
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicWorkoutsLibrary from './PublicWorkoutsLibrary';

const WorkoutsLibraryTab = () => {
  return (
    <Tabs defaultValue="public" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="public">Public Library</TabsTrigger>
        <TabsTrigger value="my">My Workouts</TabsTrigger>
        <TabsTrigger value="saved">Saved Templates</TabsTrigger>
      </TabsList>
      
      <TabsContent value="public" className="mt-4">
        <PublicWorkoutsLibrary />
      </TabsContent>
      
      <TabsContent value="my" className="mt-4">
        <div className="text-center py-10">
          <p className="text-gray-400">
            This will show workouts you've created. This feature is coming soon.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="saved" className="mt-4">
        <div className="text-center py-10">
          <p className="text-gray-400">
            This will show workout templates that you've saved. This feature is coming soon.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default WorkoutsLibraryTab;
