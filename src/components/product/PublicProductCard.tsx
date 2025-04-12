
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ItemType } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/workout';

interface PublicProductCardProps {
  item: ItemType;
}

export const PublicProductCard = ({ item }: PublicProductCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the appropriate detail page based on item type
    if (item.type === 'workout') {
      navigate(`/workout/${item.id}`);
    } else if (item.type === 'program') {
      navigate(`/program/${item.id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="relative h-36 overflow-hidden">
        <img 
          src={item.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
          alt={item.title}
          className="w-full h-full object-cover"
        />
        {item.isPurchasable && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-fitbloom-purple text-white">
              {formatCurrency(item.price || 0)}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3 flex-grow">
        <div className="space-y-1">
          <h3 className="font-semibold truncate">{item.title}</h3>
          <p className="text-xs text-muted-foreground">{item.creator}</p>
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 text-xs text-muted-foreground border-t">
        <div className="flex justify-between w-full">
          <span>{item.duration}</span>
          <span className="capitalize">{item.difficulty}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PublicProductCard;
