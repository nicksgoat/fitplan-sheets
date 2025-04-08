
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import WorkoutsLibraryTab from '@/components/WorkoutsLibraryTab';
import ProgramsLibraryTab from '@/components/ProgramsLibraryTab';
import CollectionsTab from './CollectionsTab';
import ExercisesTab from './ExercisesTab';
import CreatedContentTab from './CreatedContentTab';
import { CollectionType, ItemType } from '@/lib/types';

interface LibraryTabsProps {
  collections: CollectionType[];
  isLoading: boolean;
  error: any;
  filteredExercises: ItemType[];
  filteredCustomExercises: ItemType[];
  isLoadingCustom: boolean;
  activeCategory: string | null;
  onTabChange: (tab: string) => void;
}

const LibraryTabs = ({
  collections,
  isLoading,
  error,
  filteredExercises,
  filteredCustomExercises,
  isLoadingCustom,
  activeCategory,
  onTabChange
}: LibraryTabsProps) => {
  const handleValueChange = (value: string) => {
    onTabChange(value);
  };

  return (
    <Tabs defaultValue="exercises" className="w-full" onValueChange={handleValueChange}>
      <TabsList className="mb-6 w-full overflow-x-auto scrollbar-hide flex">
        <TabsTrigger value="collections">Collections</TabsTrigger>
        <TabsTrigger value="exercises">Exercises</TabsTrigger>
        <TabsTrigger value="workouts">Workouts</TabsTrigger>
        <TabsTrigger value="programs">Programs</TabsTrigger>
        <TabsTrigger value="created">Created by me</TabsTrigger>
      </TabsList>
      
      <TabsContent value="collections" className="mt-4">
        <CollectionsTab collections={collections} />
      </TabsContent>
      
      <TabsContent value="exercises" className="mt-4 overflow-x-auto">
        <ExercisesTab 
          isLoading={isLoading}
          error={error}
          filteredExercises={filteredExercises}
          activeCategory={activeCategory}
        />
      </TabsContent>
      
      <TabsContent value="workouts" className="mt-4">
        <DndProvider backend={HTML5Backend}>
          <WorkoutProvider>
            <WorkoutsLibraryTab />
          </WorkoutProvider>
        </DndProvider>
      </TabsContent>
      
      <TabsContent value="programs" className="mt-4">
        <DndProvider backend={HTML5Backend}>
          <WorkoutProvider>
            <ProgramsLibraryTab />
          </WorkoutProvider>
        </DndProvider>
      </TabsContent>

      <TabsContent value="created" className="mt-4 overflow-x-auto">
        <CreatedContentTab
          isLoadingCustom={isLoadingCustom}
          filteredCustomExercises={filteredCustomExercises}
        />
      </TabsContent>
    </Tabs>
  );
};

export default LibraryTabs;
