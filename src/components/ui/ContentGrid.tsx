
import React from 'react';
import { ItemType } from '@/lib/types';
import GlowingContentCard from './GlowingContentCard';

interface ContentGridProps {
  items: ItemType[];
  className?: string;
  onItemClick?: (item: ItemType) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  className = "", 
  onItemClick 
}) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {items.map((item) => (
        <GlowingContentCard 
          key={item.id} 
          item={item} 
          onClick={onItemClick ? () => onItemClick(item) : undefined}
        />
      ))}
    </div>
  );
};

export default ContentGrid;
