
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import ContentGrid from '@/components/ui/ContentGrid';
import CollectionCard from '@/components/ui/CollectionCard';
import { useExercisesWithVisuals, useCustomExercises } from '@/hooks/useExerciseLibrary';
import { Exercise } from '@/types/exercise';
import { ItemType, CollectionType } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import WorkoutsLibraryTab from '@/components/WorkoutsLibraryTab';
import { WorkoutProvider } from '@/contexts/WorkoutContext';

const Library = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: exercises, isLoading, error } = useExercisesWithVisuals();
  const { data: customExercises, isLoading: isLoadingCustom } = useCustomExercises();
  
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
  
  const customExerciseItems: ItemType[] = customExercises?.map((exercise: Exercise) => ({
    id: exercise.id,
    title: exercise.name,
    type: 'exercise',
    creator: exercise.creator || 'You',
    imageUrl: exercise.imageUrl || 'https://placehold.co/600x400?text=No+Image',
    videoUrl: exercise.videoUrl,
    tags: exercise.tags || [],
    duration: exercise.duration || '',
    difficulty: exercise.difficulty || 'beginner',
    isFavorite: false,
    description: exercise.description,
    isCustom: true
  })) || [];
  
  const filteredExercises = activeCategory 
    ? exerciseItems.filter(item => 
        item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())
      )
    : exerciseItems;
    
  const filteredCustomExercises = activeCategory 
    ? customExerciseItems.filter(item => 
        item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())
      )
    : customExerciseItems;
  
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
  
  const handleCreateButtonClick = () => {
    const currentTab = document.querySelector('[data-state="active"][role="tab"]')?.textContent?.toLowerCase();
    
    if (currentTab === 'exercises') {
      navigate('/create-exercise');
    } else if (currentTab === 'workouts') {
      navigate('/sheets');
    } else {
      navigate('/create-exercise');
    }
  };
  
  return (
    <WorkoutProvider>
      <div className="space-y-6 animate-fade-in p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">My Library</h1>
          <Button 
            className="bg-fitbloom-purple hover:bg-opacity-90" 
            onClick={handleCreateButtonClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>

        {!user && (
          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-md mb-4">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              You are not logged in. Items you create will be stored locally. 
              <Button 
                variant="link" 
                className="text-amber-800 dark:text-amber-200 underline p-0 h-auto font-semibold"
                onClick={() => navigate('/auth')}
              >
                Log in
              </Button> to save them to your account.
            </p>
          </div>
        )}

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
          
          <TabsContent value="exercises" className="mt-4 overflow-x-auto">
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
                <Button 
                  className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
                  onClick={() => navigate('/create-exercise')}
                >
                  Create Exercise
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="workouts" className="mt-4">
            <WorkoutsLibraryTab />
          </TabsContent>
          
          <TabsContent value="programs" className="mt-4">
            <div className="text-center py-10">
              <p className="text-gray-400">No programs saved yet.</p>
              <Button 
                className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
                onClick={() => navigate('/sheets')}
              >
                Create Program
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="created" className="mt-4 overflow-x-auto">
            {isLoadingCustom ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
              </div>
            ) : filteredCustomExercises && filteredCustomExercises.length > 0 ? (
              <ContentGrid items={filteredCustomExercises} />
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">You haven't created any content yet.</p>
                <Button 
                  className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
                  onClick={() => navigate('/create-exercise')}
                >
                  Create Content
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WorkoutProvider>
  );
};

export default Library;
