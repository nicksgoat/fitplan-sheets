
import React from 'react';
import { cn } from "@/lib/utils";
import { GlowingEffect } from "./glowing-effect";
import { contentCardStyles } from '@/styles/AssetLibrary';
import { ItemType } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import ContentCard from './ContentCard';

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
        <ContentCard item={item} />
      </div>
    </div>
  );
};

export default GlowingContentCard;
