
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CollectionType } from '@/lib/types';

interface CollectionCardProps {
  collection: CollectionType;
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  return (
    <Card className="content-card">
      <div className="relative aspect-square overflow-hidden">
        <div className="grid grid-cols-2 h-full">
          {collection.coverImages.slice(0, 4).map((image, i) => (
            <div key={i} className="overflow-hidden">
              <img src={image} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-xl font-bold text-white">{collection.name}</h3>
          <p className="text-sm text-gray-200">{collection.itemCount} items</p>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-fitbloom-text-medium line-clamp-2">{collection.description}</p>
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <p className="text-xs text-fitbloom-text-medium">Updated {collection.lastUpdated}</p>
      </CardFooter>
    </Card>
  );
};

export default CollectionCard;
