
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryButton from '@/components/ui/CategoryButton';
import ContentCarousel from '@/components/ui/ContentCarousel';
import { useExercisesWithVisuals } from '@/hooks/useExerciseLibrary';
import { Exercise } from '@/types/exercise';
import { ItemType } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/contexts/LibraryContext';

const Explore = () => {
  const allCategories = [
    "Strength", "Cardio", "Flexibility", "HIIT", 
    "Sports", "Rehabilitation", "Mobility", "Functional"
  ];
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Use the same data hook as the Library page
  const { data: exercises, isLoading, error } = useExercisesWithVisuals();
  const { workouts, programs } = useLibrary();
  
  // Transform our data to match the ItemType format
  const [workoutItems, setWorkoutItems] = useState<ItemType[]>([]);
  const [programItems, setProgramItems] = useState<ItemType[]>([]);
  
  useEffect(() => {
    // Transform workout library data to ItemType format
    const workoutItemsList = workouts.map(workout => ({
      id: workout.id,
      title: workout.name,
      type: 'workout' as const,
      creator: 'You',
      imageUrl: 'https://placehold.co/600x400?text=Workout',
      tags: ['Workout', 'Custom'],
      duration: `${workout.exercises.length} exercises`,
      difficulty: 'intermediate' as const,
      isFavorite: false,
      description: `Day ${workout.day} workout with ${workout.exercises.length} exercises`,
      isCustom: true,
      savedAt: workout.savedAt,
      lastModified: workout.lastModified
    }));
    
    setWorkoutItems(workoutItemsList);
    
    // Transform program library data to ItemType format
    const programItemsList = programs.map(program => ({
      id: program.id,
      title: program.name,
      type: 'program' as const,
      creator: 'You',
      imageUrl: 'https://placehold.co/600x400?text=Program',
      tags: ['Program', 'Custom'],
      duration: `${program.weeks?.length || 0} weeks`,
      difficulty: 'intermediate' as const,
      isFavorite: false,
      description: `Program with ${program.weeks?.length || 0} weeks and ${program.workouts?.length || 0} workouts`,
      isCustom: true,
      savedAt: program.savedAt,
      lastModified: program.lastModified
    }));
    
    setProgramItems(programItemsList);
  }, [workouts, programs]);
  
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

  const allItems = [...exerciseItems, ...workoutItems, ...programItems];

  // Filter items based on active category
  const filteredItems = activeCategory 
    ? allItems.filter(item => 
        item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())
      )
    : allItems;

  // Get items for each section based on active category filter
  const getFilteredItems = (items: ItemType[]) => {
    return activeCategory
      ? items.filter(item => 
          item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())
        )
      : items;
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(prev => prev === category ? null : category);
  };

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
          <h2 className="text-lg font-semibold">Your Library</h2>
          <Button
            variant="link"
            className="text-fitbloom-purple hover:underline text-sm"
            onClick={() => navigate('/library')}
          >
            View All
          </Button>
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
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-400">Failed to load exercises.</p>
              </div>
            ) : getFilteredItems(exerciseItems).length > 0 ? (
              <ContentCarousel items={getFilteredItems(exerciseItems)} />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No exercises match your criteria.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="workouts" className="mt-3">
            {workoutItems.length > 0 ? (
              <ContentCarousel items={getFilteredItems(workoutItems)} />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">You haven't created any workouts yet.</p>
                <Button 
                  className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90 text-sm"
                  onClick={() => navigate('/sheets')}
                >
                  Create Workout
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="programs" className="mt-3">
            {programItems.length > 0 ? (
              <ContentCarousel items={getFilteredItems(programItems)} />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">You haven't created any programs yet.</p>
                <Button 
                  className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90 text-sm"
                  onClick={() => navigate('/sheets')}
                >
                  Create Program
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recently Created</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">More</a>
        </div>
        {allItems.length > 0 ? (
          <ContentCarousel 
            items={getFilteredItems(
              [...workoutItems, ...programItems, ...exerciseItems]
                .sort((a, b) => {
                  const dateA = a.lastModified ? new Date(a.lastModified) : new Date(0);
                  const dateB = b.lastModified ? new Date(b.lastModified) : new Date(0);
                  return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 6)
            )} 
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">No items found.</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Trending Exercises</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">More</a>
        </div>
        {exerciseItems.length > 0 ? (
          <ContentCarousel items={getFilteredItems(exerciseItems.slice(0, 6))} />
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">No exercises found.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Explore;
