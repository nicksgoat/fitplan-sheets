
import React from 'react';
import ContentCard from './ContentCard';
import { ItemType } from '@/lib/types';

interface ContentGridProps {
  items: ItemType[];
}

const ContentGrid = ({ items }: ContentGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ContentGrid;
