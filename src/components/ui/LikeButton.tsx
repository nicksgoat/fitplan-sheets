
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { ItemType } from '@/lib/types';
import { useLiked } from '@/contexts/LikedContext';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  item: ItemType;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  item,
  size = 'icon',
  variant = 'ghost',
  className
}) => {
  const { isLiked, toggleLike } = useLiked();
  const liked = isLiked(item.id);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    e.preventDefault(); // Prevent navigation if in a link
    toggleLike(item);
  };

  return (
    <Button
      onClick={handleClick}
      size={size}
      variant={variant}
      className={cn(
        'hover:bg-transparent focus:ring-0',
        className
      )}
      aria-label={liked ? "Remove from liked" : "Add to liked"}
    >
      <Heart 
        className={cn(
          "transition-all duration-300",
          liked ? "fill-fitbloom-purple text-fitbloom-purple" : "text-gray-400"
        )} 
        size={size === 'lg' ? 24 : size === 'sm' ? 16 : 20}
      />
    </Button>
  );
};

export default LikeButton;
