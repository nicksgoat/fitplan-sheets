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
      {items?.map((item) => (
        <div key={item.id} className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px]">
          <ContentCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default ContentGrid;
