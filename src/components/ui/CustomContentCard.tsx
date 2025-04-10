
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ItemType } from '@/lib/types';
import LikeButton from './LikeButton';
import { cn } from '@/lib/utils';

interface CustomContentCardProps {
  item: ItemType;
  onClick?: () => void;
  className?: string;
}

const CustomContentCard: React.FC<CustomContentCardProps> = ({
  item,
  onClick,
  className
}) => {
  return (
    <Card 
      className={cn(
        "bg-dark-200 border-dark-300 overflow-hidden relative group cursor-pointer transition-all duration-200 hover:border-fitbloom-purple/50",
        className
      )}
      onClick={onClick}
    >
      <div className="relative pb-[80%] overflow-hidden">
        <img 
          src={item.imageUrl || "https://placehold.co/600x400?text=No+Image"} 
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <LikeButton item={item} />
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{item.title}</h3>
        <p className="text-xs text-gray-400 mt-1">{item.duration || ''}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="flex gap-1">
          {item.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-dark-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-400">{item.difficulty}</span>
      </CardFooter>
    </Card>
  );
};

export default CustomContentCard;
