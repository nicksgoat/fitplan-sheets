
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DetailDrawer from '../details/DetailDrawer';
import { Exercise } from '@/types/exercise';
import { ItemType } from '@/lib/types';

interface ContentCardProps {
  item: Exercise | ItemType;
  className?: string;
}

const ContentCard = ({ item, className }: ContentCardProps) => {
  // Determine if item is Exercise or ItemType
  const isExercise = 'primaryMuscle' in item;
  
  // Map Exercise properties to match ItemType structure for consistency
  const normalizedItem: ItemType = isExercise 
    ? {
        id: item.id,
        title: item.name,
        type: 'exercise',
        creator: item.creator || 'FitBloom',
        imageUrl: item.imageUrl || 'https://placehold.co/600x400?text=No+Image',
        videoUrl: item.videoUrl,
        duration: item.duration || '',
        tags: item.tags || [],
        difficulty: (item.difficulty as any) || 'beginner',
        isFavorite: false,
        description: item.description
      }
    : item as ItemType;
  
  const imageUrl = normalizedItem.imageUrl;
  const videoUrl = normalizedItem.videoUrl;
  const tags = normalizedItem.tags || [];
  const creator = normalizedItem.creator;
  const duration = normalizedItem.duration;
  const title = normalizedItem.title;
  
  // Check if it's a Supabase Storage URL for videos
  const isStorageVideo = videoUrl && videoUrl.includes('storage.googleapis.com') && 
                         videoUrl.includes('exercise-videos');
  
  return (
    <DetailDrawer item={normalizedItem}>
      <Card className={cn("content-card h-full flex flex-col", className)}>
        <div className="relative">
          {videoUrl ? (
            <div className="relative h-[120px] w-full">
              <img 
                src={imageUrl || 'https://placehold.co/600x400?text=Video+Exercise'} 
                alt={title} 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Video className="h-8 w-8 text-white opacity-80" />
              </div>
            </div>
          ) : (
            <img 
              src={imageUrl} 
              alt={title} 
              className="content-card-image h-[120px] w-full object-cover"
            />
          )}
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
        <CardContent className="p-2 flex-grow">
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
          {isStorageVideo && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
              Uploaded
            </Badge>
          )}
        </CardFooter>
      </Card>
    </DetailDrawer>
  );
};

export default ContentCard;
