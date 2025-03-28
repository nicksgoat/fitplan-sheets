
import React from 'react';
import ContentCard from './ContentCard';
import { ItemType } from '@/lib/types';
import { ExerciseWithVisual } from '@/types/exercise';

interface ContentGridProps {
  items: (ItemType | ExerciseWithVisual)[];
  className?: string;
  columns?: number;
}

const ContentGrid = ({ 
  items, 
  className,
  columns = 6 
}: ContentGridProps) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${columns} gap-3 md:gap-4 ${className || ''}`}>
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ContentGrid;
