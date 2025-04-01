
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryButton from '@/components/ui/CategoryButton';
import ContentCarousel from '@/components/ui/ContentCarousel';
import { useExercisesWithVisuals } from '@/hooks/useExerciseLibrary';
import { usePublicWorkoutLibrary } from '@/hooks/useWorkoutLibraryIntegration';
import { Exercise } from '@/types/exercise';
import { ItemType } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { mockPrograms } from '@/lib/mockData';

const Explore = () => {
  const allCategories = [
    "Strength", "Cardio", "Flexibility", "HIIT", 
    "Sports", "Rehabilitation", "Mobility", "Functional"
  ];
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Use the same data hook as the Library page
  const { data: exercises, isLoading: exercisesLoading, error: exercisesError } = useExercisesWithVisuals();
  
  // Load workouts from library
  const { workoutItems, isLoading: workoutsLoading } = usePublicWorkoutLibrary();
  
  // Transform our exercise data to match the ItemType format
  const exerciseItems: ItemType[] = exercises?.map((exercise: Exercise) => ({
    id: exercise.id,
    title: exercise.name,
    type: 'exercise',
    creator: exercise.creator || 'FitBloom',
    imageUrl: exercise.imageUrl || 'https://placehold.co/600x400?text=No+Image',
    videoUrl: exercise.videoUrl,
    tags: exercise.tags || [],
    duration: exercise.duration || '',
    difficulty: exercise.difficulty || 'beginner',
    isFavorite: false,
    description: exercise.description,
    isCustom: false
  })) || [];

  // Combine library workouts with exercises and mock programs
  const allItems = [...exerciseItems, ...workoutItems, ...mockPrograms];

  // Filter items based on active category
  const filteredItems = activeCategory 
    ? allItems.filter(item => 
        item.tags?.some(tag => tag.toLowerCase().includes(activeCategory.toLowerCase()))
      )
    : allItems;

  // Get items for each section based on active category filter
  const getFilteredItems = (items: ItemType[]) => {
    return activeCategory
      ? items.filter(item => 
          item.tags?.some(tag => tag.toLowerCase().includes(activeCategory.toLowerCase()))
        )
      : items;
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(prev => prev === category ? null : category);
  };

  const isLoading = exercisesLoading || workoutsLoading;

  return (
    <div className="space-y-6 animate-fade-in p-4">
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Browse Categories</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">See All</a>
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <CategoryButton 
              key={category} 
              name={category} 
              active={activeCategory === category}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
        {activeCategory && (
          <div className="inline-flex items-center">
            <p className="text-sm text-muted-foreground">
              Showing results for category: <span className="font-medium text-primary">{activeCategory}</span>
            </p>
            <button 
              className="ml-2 text-xs text-fitbloom-purple hover:underline"
              onClick={() => setActiveCategory(null)}
            >
              Clear filter
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recommended For You</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">More</a>
        </div>
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>
          <TabsContent value="exercises" className="mt-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
              </div>
            ) : exercisesError ? (
              <div className="text-center py-6">
                <p className="text-red-400">Failed to load exercises.</p>
              </div>
            ) : (
              <ContentCarousel items={getFilteredItems(exerciseItems)} />
            )}
          </TabsContent>
          <TabsContent value="workouts" className="mt-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
              </div>
            ) : (
              <ContentCarousel items={getFilteredItems(workoutItems)} />
            )}
          </TabsContent>
          <TabsContent value="programs" className="mt-3">
            <ContentCarousel items={getFilteredItems(mockPrograms)} />
          </TabsContent>
        </Tabs>
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Saved Workouts</h2>
          <a href="/library" className="text-fitbloom-purple hover:underline text-sm">View All</a>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
          </div>
        ) : (
          <ContentCarousel items={workoutItems.slice(0, 6)} />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">New Releases</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">More</a>
        </div>
        <ContentCarousel items={getFilteredItems([...exerciseItems, ...workoutItems, ...mockPrograms].slice(0, 6))} />
      </section>
    </div>
  );
};

export default Explore;
