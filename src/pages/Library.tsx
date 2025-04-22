
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercisesWithVisuals, useCustomExercises } from '@/hooks/useExerciseLibrary';
import { Exercise } from '@/types/exercise';
import { ItemType, CollectionType } from '@/lib/types';
import LibraryHeader from '@/components/library/LibraryHeader';
import LibraryTabs from '@/components/library/LibraryTabs';
import MobileAppIntegration from '@/components/MobileAppIntegration';

const Library = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  
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
    } else if (currentTab === 'programs') {
      navigate('/sheets');
    } else {
      navigate('/create-exercise');
    }
  };
  
  const handleTabChange = (tab: string) => {
    // This function can be used to handle tab changes if needed
  };
  
  return (
    <div className="space-y-6 animate-fade-in p-4">
      <LibraryHeader handleCreateButtonClick={handleCreateButtonClick} />
      
      {/* Mobile API Integration */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Mobile App Integration</h2>
        <MobileAppIntegration />
      </div>
      
      <LibraryTabs 
        collections={mockCollections}
        isLoading={isLoading}
        error={error}
        filteredExercises={filteredExercises}
        filteredCustomExercises={filteredCustomExercises}
        isLoadingCustom={isLoadingCustom}
        activeCategory={activeCategory}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Library;
