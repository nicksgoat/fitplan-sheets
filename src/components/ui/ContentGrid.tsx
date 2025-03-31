
import React from 'react';
import ContentCard from './ContentCard';
import { ItemType } from '@/lib/types';
import { Exercise } from '@/types/exercise';

interface ContentGridProps {
  items: (ItemType | Exercise)[];
  className?: string;
}

const ContentGrid = ({ 
  items, 
  className
}: ContentGridProps) => {
  return (
    <div className={`flex flex-wrap gap-3 md:gap-4 ${className || ''}`}>
      {items.map((item) => (
        <div key={item.id} className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px]">
          <ContentCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default ContentGrid;
