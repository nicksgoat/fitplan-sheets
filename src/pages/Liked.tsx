
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import ContentGrid from '@/components/ui/ContentGrid';
import { mockExercises, mockWorkouts, mockPrograms } from '@/lib/mockData';

const Liked = () => {
  // Filter mock data to only include favorited items
  const likedExercises = mockExercises.filter(item => item.isFavorite);
  const likedWorkouts = mockWorkouts.filter(item => item.isFavorite);
  const likedPrograms = mockPrograms.filter(item => item.isFavorite);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 fill-fitbloom-purple text-fitbloom-purple" />
          Liked Content
        </h1>
      </div>

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exercises" className="mt-4">
          {likedExercises.length > 0 ? (
            <ContentGrid items={likedExercises} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't liked any exercises yet.</p>
              <Button className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm">
                Explore Exercises
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="workouts" className="mt-4">
          {likedWorkouts.length > 0 ? (
            <ContentGrid items={likedWorkouts} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't liked any workouts yet.</p>
              <Button className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm">
                Explore Workouts
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="programs" className="mt-4">
          {likedPrograms.length > 0 ? (
            <ContentGrid items={likedPrograms} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't liked any programs yet.</p>
              <Button className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm">
                Explore Programs
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Liked;
