
import React from 'react';
import ContentCard from './ContentCard';
import { ItemType } from '@/lib/types';
import { Exercise } from '@/types/exercise';

interface ContentGridProps {
  items: (ItemType | Exercise)[];
  className?: string;
  maxItemWidth?: string;
  minItemWidth?: string;
  gap?: string;
}

const ContentGrid = ({ 
  items, 
  className,
  maxItemWidth = "140px",
  minItemWidth = "140px",
  gap = "gap-3 md:gap-4"
}: ContentGridProps) => {
  return (
    <div className={`flex flex-wrap ${gap} ${className || ''}`}>
      {items.map((item) => (
        <div key={item.id} 
          className={`min-w-[${minItemWidth}] max-w-[${maxItemWidth}] sm:min-w-[160px] sm:max-w-[160px]`}
          style={{ 
            minWidth: minItemWidth, 
            maxWidth: maxItemWidth,
            width: '100%'
          }}
        >
          <ContentCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default ContentGrid;
