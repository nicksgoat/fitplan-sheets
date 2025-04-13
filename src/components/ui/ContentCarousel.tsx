
import React, { useRef, useEffect } from 'react';
import { ItemType } from '@/lib/types';
import PublicProductCard from '@/components/product/PublicProductCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentCarouselProps {
  items: ItemType[];
}

const ContentCarousel = ({ items }: ContentCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const scrollAmount = 300; // Pixels to scroll each time
    
    if (scrollRef.current) {
      const container = scrollRef.current;
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Ensure the scroll functionality is working by focusing on the scrollRef's behavior
  useEffect(() => {
    if (scrollRef.current) {
      // Just to make sure the scroll container is properly initialized
      scrollRef.current.scrollLeft = 0;
    }
  }, [items]);

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-dark-200/90 border-gray-700 hover:bg-gray-700"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Scroll left</span>
      </Button>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div 
          ref={scrollRef} 
          className="flex space-x-4 pb-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-[200px] max-w-[200px] md:min-w-[230px] md:max-w-[230px] flex-shrink-0">
              <PublicProductCard item={item} />
            </div>
          ))}
        </div>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-dark-200/90 border-gray-700 hover:bg-gray-700"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Scroll right</span>
      </Button>
    </div>
  );
};

export default ContentCarousel;
