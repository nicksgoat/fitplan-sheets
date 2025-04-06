
import React from 'react';
import { cn } from "@/lib/utils";
import { GlowingEffect } from "./glowing-effect";
import { contentCardStyles } from '@/styles/AssetLibrary';
import { ItemType } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import ContentCard from './ContentCard';
import { Exercise } from '@/types/exercise';

interface GlowingContentCardProps {
  item: ItemType | Exercise;
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
      // Check if it's an Exercise or ItemType
      const isExercise = 'primaryMuscle' in item;
      
      if (isExercise) {
        // It's an Exercise object
        navigate(`/exercise/${item.id}`);
      } else {
        // It's an ItemType
        if (item.type === 'exercise') {
          navigate(`/exercise/${item.id}`);
        } else if (item.type === 'workout') {
          navigate(`/workout/${item.id}`);
        } else if (item.type === 'program') {
          navigate(`/program/${item.id}`);
        }
      }
    }
  };

  return (
    <div 
      className={cn("relative rounded-xl cursor-pointer", className)}
      onClick={handleClick}
    >
      <div className="relative p-1">
        <GlowingEffect 
          spread={30}
          glow={true}
          disabled={false}
          proximity={50}
          inactiveZone={0.01}
          borderWidth={1}
        />
        <ContentCard item={item} />
      </div>
    </div>
  );
};

export default GlowingContentCard;
