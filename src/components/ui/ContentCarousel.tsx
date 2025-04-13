
import React from 'react';
import { ItemType } from '@/lib/types';
import PublicProductCard from '@/components/product/PublicProductCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentCarouselProps {
  items: ItemType[];
}

const ContentCarousel = ({ items }: ContentCarouselProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const scrollAmount = 300;
    if (scrollRef.current) {
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

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
      
      <ScrollArea className="w-full">
        <div className="flex space-x-4 pb-4 overflow-x-auto" ref={scrollRef}>
          {items.map((item) => (
            <div key={item.id} className="min-w-[200px] max-w-[200px] md:min-w-[230px] md:max-w-[230px]">
              <PublicProductCard item={item} />
            </div>
          ))}
        </div>
      </ScrollArea>
      
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
