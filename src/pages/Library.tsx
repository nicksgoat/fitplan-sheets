
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import ContentGrid from '@/components/ui/ContentGrid';
import ContentCarousel from '@/components/ui/ContentCarousel';
import CollectionCard from '@/components/ui/CollectionCard';
import { useExercisesWithVisuals } from '@/hooks/useExerciseLibrary';
import { ExerciseWithVisual } from '@/types/exercise';
import { ItemType, CollectionType } from '@/lib/types';
import MainLayout from '@/components/layout/MainLayout';

const Library = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Fetch exercises with visuals from Supabase
  const { data: exercisesWithVisuals, isLoading, error } = useExercisesWithVisuals();
  
  // Transform our exercise data to match the ItemType format
  const exerciseItems: ItemType[] = exercisesWithVisuals?.map((exercise: ExerciseWithVisual) => ({
    id: exercise.id,
    title: exercise.name,
    type: 'exercise',
    creator: exercise.visual?.creator || 'FitBloom',
    imageUrl: exercise.visual?.imageUrl || 'https://placehold.co/600x400?text=No+Image',
    tags: exercise.visual?.tags || [],
    duration: exercise.visual?.duration || '',
    difficulty: exercise.visual?.difficulty || 'beginner',
    isFavorite: false,
    description: exercise.description
  })) || [];
  
  // Filter exercises based on active category
  const filteredExercises = activeCategory 
    ? exerciseItems.filter(item => 
        item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())
      )
    : exerciseItems;
  
  // Mock collections with proper type
  const mockCollections: CollectionType[] = [
    {
      id: '1',
      name: 'My Favorite Exercises',
      description: 'Quick exercises to start the day energized and focused',
      coverImages: ['https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069'],
      itemCount: 12,
      lastUpdated: '2 days ago'
    },
    {
      id: '2',
      name: 'Weekly Routines',
      description: 'Low intensity workouts for active recovery days',
      coverImages: ['https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=2070'],
      itemCount: 5,
      lastUpdated: '1 week ago'
    }
  ];
  
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">My Library</h1>
          <Button className="bg-fitbloom-purple hover:bg-opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>

        <Tabs defaultValue="exercises" className="w-full">
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
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400">Failed to load exercises. Using local data.</p>
                {filteredExercises.length > 0 ? (
                  <div className="mt-4">
                    <ContentGrid items={filteredExercises} />
                  </div>
                ) : (
                  <p className="text-gray-400 mt-2">No exercises available.</p>
                )}
              </div>
            ) : filteredExercises.length > 0 ? (
              <ContentGrid items={filteredExercises} />
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">No exercises found.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="workouts" className="mt-4">
            <div className="text-center py-10">
              <p className="text-gray-400">No workouts saved yet.</p>
              <Button className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm">
                Create Workout
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="programs" className="mt-4">
            <div className="text-center py-10">
              <p className="text-gray-400">No programs saved yet.</p>
              <Button className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm">
                Create Program
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="created" className="mt-4">
            <div className="text-center py-10">
              <p className="text-gray-400">You haven't created any content yet.</p>
              <Button className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm">
                Create Content
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Library;
