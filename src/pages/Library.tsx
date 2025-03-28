
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockExercises, mockWorkouts, mockPrograms, mockCollections } from '@/lib/mockData';
import ContentGrid from '@/components/ui/ContentGrid';
import CollectionCard from '@/components/ui/CollectionCard';
import { useIsMobile } from '@/hooks/use-mobile';

const Library = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">My Library</h1>
        <Button className="bg-fitbloom-purple hover:bg-opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="mb-6 w-full overflow-x-auto scrollbar-hide flex">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="created">Created by me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="collections" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mockCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="exercises" className="mt-4">
          <ContentGrid items={mockExercises.slice(0, 8)} />
        </TabsContent>
        
        <TabsContent value="workouts" className="mt-4">
          <ContentGrid items={mockWorkouts.slice(0, 8)} />
        </TabsContent>
        
        <TabsContent value="programs" className="mt-4">
          <ContentGrid items={mockPrograms.slice(0, 8)} />
        </TabsContent>

        <TabsContent value="created" className="mt-4">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Workouts</h2>
              {mockWorkouts.slice(0, 4).map(workout => (
                <div key={workout.id} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={workout.imageUrl} alt={workout.title} className="h-12 w-12 object-cover rounded" />
                    <div>
                      <h3 className="font-medium">{workout.title}</h3>
                      <p className="text-sm text-gray-400">Created on May 12, 2023</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Programs</h2>
              {mockPrograms.slice(0, 2).map(program => (
                <div key={program.id} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={program.imageUrl} alt={program.title} className="h-12 w-12 object-cover rounded" />
                    <div>
                      <h3 className="font-medium">{program.title}</h3>
                      <p className="text-sm text-gray-400">Created on June 3, 2023</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;
