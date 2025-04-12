
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Video, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DetailDrawer from '../details/DetailDrawer';
import { Exercise } from '@/types/exercise';
import { ItemType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { buildProductUrl } from '@/utils/urlUtils';
import { formatCurrency } from '@/utils/workout';

interface ContentCardProps {
  item: Exercise | ItemType;
  className?: string;
  onClick?: () => void;
}

const ContentCard = ({ item, className, onClick }: ContentCardProps) => {
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
        description: item.description,
        isCustom: item.isCustom || false
      }
    : item as ItemType;
  
  const imageUrl = normalizedItem.imageUrl;
  const videoUrl = normalizedItem.videoUrl;
  const tags = normalizedItem.tags || [];
  const creator = normalizedItem.creator;
  const duration = normalizedItem.duration;
  const title = normalizedItem.title;
  const price = normalizedItem.price;
  const isPurchasable = normalizedItem.isPurchasable;
  const lastModified = normalizedItem.lastModified;
  
  // Check if it's a Supabase Storage URL for videos
  const isStorageVideo = videoUrl && videoUrl.includes('storage.googleapis.com') && 
                         videoUrl.includes('exercise-videos');

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  // Use different element based on if the item is purchasable
  const cardContent = (
    <div className="relative">
      {videoUrl ? (
        <div className="relative h-[120px] w-full">
          <img 
            src={imageUrl || 'https://placehold.co/600x400?text=Video+Exercise'} 
            alt={title} 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
      ) : (
        <img 
          src={imageUrl} 
          alt={title} 
          className="content-card-image h-[120px] w-full object-cover"
        />
      )}

      {isPurchasable && price && price > 0 && (
        <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
          <DollarSign className="h-3 w-3 mr-0.5" />
          {formatCurrency(price)}
        </div>
      )}
    </div>
  );
  
  const cardBody = (
    <>
      <CardContent className="py-2 flex-1">
        <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
          {duration}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 pb-2 justify-between items-center">
        <div className="text-xs text-gray-500">
          {lastModified && formatDate(lastModified)}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );
  
  // For purchasable items, use Link to go to detail page
  if ((normalizedItem.type === 'workout' || normalizedItem.type === 'program') && 
      normalizedItem.isPurchasable) {
    const productUrl = buildProductUrl(normalizedItem.type, normalizedItem.id, normalizedItem.title);
    
    return (
      <Card className={cn("content-card h-full flex flex-col", className)}>
        <Link to={productUrl} className="flex flex-col h-full">
          {cardContent}
          {cardBody}
        </Link>
      </Card>
    );
  }
  
  // For other items, use the drawer
  return (
    <DetailDrawer item={normalizedItem}>
      <Card 
        className={cn("content-card h-full flex flex-col", className)}
        onClick={handleCardClick}
      >
        {cardContent}
        {cardBody}
      </Card>
    </DetailDrawer>
  );
};

export default ContentCard;
