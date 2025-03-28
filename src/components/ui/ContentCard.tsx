
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DetailDrawer from '../details/DetailDrawer';
import { ExerciseWithVisual } from '@/types/exercise';
import { ItemType } from '@/lib/types';

interface ContentCardProps {
  item: ExerciseWithVisual | ItemType;
  className?: string;
}

const ContentCard = ({ item, className }: ContentCardProps) => {
  // Determine if item is ExerciseWithVisual or ItemType
  const isExerciseWithVisual = 'primaryMuscle' in item;
  
  // Map ExerciseWithVisual properties to match ItemType structure for consistency
  const normalizedItem: ItemType = isExerciseWithVisual 
    ? {
        id: item.id,
        title: item.name,
        type: 'exercise',
        creator: item.visual?.creator || 'FitBloom',
        imageUrl: item.visual?.imageUrl || 'https://placehold.co/600x400?text=No+Image',
        duration: item.visual?.duration || '',
        tags: item.visual?.tags || [],
        difficulty: (item.visual?.difficulty as any) || 'beginner',
        isFavorite: false,
        description: item.description
      }
    : item as ItemType;
  
  const imageUrl = normalizedItem.imageUrl;
  const tags = normalizedItem.tags || [];
  const creator = normalizedItem.creator;
  const duration = normalizedItem.duration;
  const title = normalizedItem.title;
  
  return (
    <DetailDrawer item={normalizedItem}>
      <Card className={cn("content-card", className)}>
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={title} 
            className="content-card-image"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1 right-1 rounded-full bg-black/30 hover:bg-black/50 h-7 w-7 p-1"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite toggle logic here
            }}
          >
            <Heart className={cn("h-3 w-3", normalizedItem.isFavorite ? "fill-fitbloom-purple text-fitbloom-purple" : "text-white")} />
          </Button>
        </div>
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-fitbloom-text-medium">{normalizedItem.type}</span>
            {duration && (
              <span className="text-xs text-fitbloom-text-medium">{duration}</span>
            )}
          </div>
          <h3 className="font-semibold mt-1 text-xs sm:text-sm line-clamp-1">{title}</h3>
          <p className="text-xs text-fitbloom-text-medium mt-0.5 line-clamp-1">{creator}</p>
        </CardContent>
        <CardFooter className="pt-0 px-2 pb-2 flex flex-wrap gap-1">
          {tags?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </DetailDrawer>
  );
};

export default ContentCard;
