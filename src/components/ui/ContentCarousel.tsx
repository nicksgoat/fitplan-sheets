
import React, { useRef, useEffect, useState } from 'react';
import { ItemType } from '@/lib/types';
import PublicProductCard from '@/components/product/PublicProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentCarouselProps {
  items: ItemType[];
}

const ContentCarousel = ({ items }: ContentCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    const scrollAmount = 300; // Pixels to scroll each time
    
    if (scrollRef.current) {
      const container = scrollRef.current;
      
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }

      // Check scroll position after a small delay to allow animation to complete
      setTimeout(() => updateScrollButtons(), 100);
    }
  };

  // Update button states based on scroll position
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    
    // Fix: Make sure we properly calculate if we can scroll right
    // We need to account for some small rounding differences by adding a small threshold (5px)
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 5);
  };

  // Update button states when items change or on resize
  useEffect(() => {
    if (scrollRef.current) {
      // Initial check for scroll buttons
      updateScrollButtons();
      
      // Reset scroll position when items change
      scrollRef.current.scrollLeft = 0;
      
      // Add resize listener to update button states
      const handleResize = () => updateScrollButtons();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [items]);

  // Add scroll event listener to update button states during scrolling
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      const handleScroll = () => updateScrollButtons();
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-dark-200/90 border-gray-700 hover:bg-gray-700"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
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
        disabled={!canScrollRight}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Scroll right</span>
      </Button>
    </div>
  );
};

export default ContentCarousel;
