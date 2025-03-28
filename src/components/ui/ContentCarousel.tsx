
import React, { useRef } from 'react';
import ContentCard from './ContentCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemType } from '@/lib/types';

interface ContentCarouselProps {
  items: ItemType[];
}

const ContentCarousel = ({ items }: ContentCarouselProps) => {
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
    <div className="relative group">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div key={item.id} className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] snap-start">
            <ContentCard item={item} />
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

export default ContentCarousel;
