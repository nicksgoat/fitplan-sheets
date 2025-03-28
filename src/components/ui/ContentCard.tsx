
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ItemType } from '@/lib/types';
import DetailDrawer from '../details/DetailDrawer';

interface ContentCardProps {
  item: ItemType;
  className?: string;
}

const ContentCard = ({ item, className }: ContentCardProps) => {
  return (
    <DetailDrawer item={item}>
      <Card className={cn("content-card", className)}>
        <div className="relative">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
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
            <Heart className={cn("h-3 w-3", item.isFavorite ? "fill-fitbloom-purple text-fitbloom-purple" : "text-white")} />
          </Button>
        </div>
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-fitbloom-text-medium">{item.type}</span>
            {item.type !== 'exercise' && (
              <span className="text-xs text-fitbloom-text-medium">{item.duration}</span>
            )}
          </div>
          <h3 className="font-semibold mt-1 text-xs sm:text-sm line-clamp-1">{item.title}</h3>
          <p className="text-xs text-fitbloom-text-medium mt-0.5 line-clamp-1">{item.creator}</p>
        </CardContent>
        <CardFooter className="pt-0 px-2 pb-2 flex flex-wrap gap-1">
          {item.tags?.slice(0, 2).map((tag, index) => (
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
