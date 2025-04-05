
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemType } from '@/lib/types';
import GlowingContentCard from './GlowingContentCard';

interface GlowingContentCarouselProps {
  items: ItemType[];
  className?: string;
  onItemClick?: (item: ItemType) => void;
}

const GlowingContentCarousel = ({ items, className, onItemClick }: GlowingContentCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { current: container } = carouselRef;
      const scrollAmount = direction === 'left' 
        ? container.scrollLeft - container.offsetWidth / 2
        : container.scrollLeft + container.offsetWidth / 2;
        
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`relative group ${className || ''}`}>
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="min-w-[180px] max-w-[180px] sm:min-w-[200px] sm:max-w-[200px] snap-start"
            onClick={() => onItemClick && onItemClick(item)}
          >
            <GlowingContentCard item={item} />
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/30 border-none rounded-full -ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/30 border-none rounded-full -mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default GlowingContentCarousel;
