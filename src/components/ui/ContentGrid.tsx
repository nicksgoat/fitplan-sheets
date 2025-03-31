
import React from 'react';
import ContentCard from './ContentCard';
import { ItemType } from '@/lib/types';
import { Exercise } from '@/types/exercise';
import { Workout } from '@/types/workout';

interface ContentGridProps {
  items?: (ItemType | Exercise | Workout)[];
  className?: string;
  children?: React.ReactNode;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  className,
  children
}) => {
  // If children are provided, render them
  if (children) {
    return (
      <div className={`flex flex-wrap gap-3 md:gap-4 ${className || ''}`}>
        {children}
      </div>
    );
  }
  
  // Otherwise use the default rendering
  return (
    <div className={`flex flex-wrap gap-3 md:gap-4 ${className || ''}`}>
      {items?.map((item) => {
        // Check what type of item this is (Workout, Exercise, or ItemType)
        if ('exercises' in item) {
          // This is a workout
          const workout = item as Workout;
          return (
            <div key={workout.id} className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px]">
              <ContentCard key={workout.id}>
                <div className="p-4">
                  <h3 className="font-medium">{workout.name}</h3>
                  <p className="text-sm text-muted-foreground">{workout.exercises.length} Exercises</p>
                </div>
              </ContentCard>
            </div>
          );
        } else if ('primaryMuscle' in item || 'category' in item) {
          // This is an Exercise
          return (
            <div key={item.id} className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px]">
              <ContentCard item={item as Exercise} />
            </div>
          );
        } else {
          // This is an ItemType
          return (
            <div key={item.id} className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px]">
              <ContentCard item={item as ItemType} />
            </div>
          );
        }
      })}
    </div>
  );
};

export default ContentGrid;
