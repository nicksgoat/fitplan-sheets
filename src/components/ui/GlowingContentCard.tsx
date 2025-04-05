
import React from 'react';
import { cn } from "@/lib/utils";
import { GlowingEffect } from "./glowing-effect";
import { contentCardStyles } from '@/styles/AssetLibrary';
import { ItemType } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

interface GlowingContentCardProps {
  item: ItemType;
  className?: string;
  onClick?: () => void;
}

const GlowingContentCard = ({ 
  item, 
  className,
  onClick 
}: GlowingContentCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Use the existing navigation logic based on item type
      if (item.type === 'exercise') {
        navigate(`/exercise/${item.id}`);
      } else if (item.type === 'workout') {
        navigate(`/workout/${item.id}`);
      } else if (item.type === 'program') {
        navigate(`/program/${item.id}`);
      }
    }
  };

  return (
    <div 
      className={cn("relative rounded-xl cursor-pointer", className)}
      onClick={handleClick}
    >
      <div className="relative p-1.5">
        <GlowingEffect 
          spread={30}
          glow={true}
          disabled={false}
          proximity={50}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className={cn(
          contentCardStyles({ variant: item.isFavorite ? 'featured' : 'default' }),
          "overflow-hidden h-full"
        )}>
          {item.imageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
          )}
          
          <div className="p-3">
            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground truncate">{item.creator}</p>
              {item.difficulty && (
                <span className="text-xs bg-muted py-0.5 px-2 rounded-full">
                  {item.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlowingContentCard;
