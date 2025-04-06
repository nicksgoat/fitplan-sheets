
import React from 'react';
import { useParams } from 'react-router-dom';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { LibraryProvider } from '@/contexts/LibraryContext';
import { useLibrary } from '@/contexts/LibraryContext';
import WorkoutDetailContent from '@/components/details/WorkoutDetailContent';
import { Loader2 } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ItemType } from '@/lib/types';

const WorkoutDetailPage = () => {
  const { workoutId } = useParams();
  const { workouts } = useLibrary();

  if (!workoutId) {
    return <div className="p-4">Workout ID not found</div>;
  }

  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-fitbloom-purple" />
          <p className="text-gray-500">Loading workout...</p>
        </div>
      </div>
    );
  }

  // Create an ItemType representation of the workout for the detail component
  const workoutItem: ItemType = {
    id: workout.id,
    title: workout.name,
    type: 'workout',
    creator: 'You',
    imageUrl: 'https://placehold.co/600x400?text=Workout',
    tags: ['Workout', 'Custom'],
    duration: `${workout.exercises.length} exercises`,
    difficulty: 'intermediate',
    isFavorite: false,
    description: `Day ${workout.day} workout with ${workout.exercises.length} exercises`,
    isCustom: true,
    savedAt: workout.savedAt,
    lastModified: workout.lastModified
  };

  return (
    <div className="min-h-screen bg-dark-100">
      <WorkoutDetailContent item={workoutItem} workoutData={workout} />
    </div>
  );
};

// Wrapped component with necessary providers
const WorkoutDetail = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <LibraryProvider>
        <WorkoutProvider>
          <WorkoutDetailPage />
        </WorkoutProvider>
      </LibraryProvider>
    </DndProvider>
  );
};

export default WorkoutDetail;
