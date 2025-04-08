
import React from 'react';
import CollectionCard from '@/components/ui/CollectionCard';
import { CollectionType } from '@/lib/types';

interface CollectionsTabProps {
  collections: CollectionType[];
}

const CollectionsTab = ({ collections }: CollectionsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
};

export default CollectionsTab;
