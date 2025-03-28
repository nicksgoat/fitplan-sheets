
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentCard from '@/components/ui/ContentCard';
import CategoryButton from '@/components/ui/CategoryButton';
import ContentCarousel from '@/components/ui/ContentCarousel';
import { mockExercises, mockWorkouts, mockPrograms } from '@/lib/mockData';
import { ItemType } from '@/lib/types';

const Explore = () => {
  const allCategories = [
    "Strength", "Cardio", "Flexibility", "HIIT", 
    "Sports", "Rehabilitation", "Mobility", "Functional"
  ];
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const allItems = [...mockExercises, ...mockWorkouts, ...mockPrograms];

  // Filter items based on active category
  const filteredItems = activeCategory 
    ? allItems.filter(item => 
        item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())
      )
    : allItems;

  // Get items for each section based on active category filter
  const getFilteredItems = (items: ItemType[]) => {
    return activeCategory
      ? items.filter(item => 
          item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase())
        )
      : items;
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(prev => prev === category ? null : category);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Browse Categories</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">See All</a>
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <CategoryButton 
              key={category} 
              name={category} 
              active={activeCategory === category}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
        {activeCategory && (
          <div className="inline-flex items-center">
            <p className="text-sm text-muted-foreground">
              Showing results for category: <span className="font-medium text-primary">{activeCategory}</span>
            </p>
            <button 
              className="ml-2 text-xs text-fitbloom-purple hover:underline"
              onClick={() => setActiveCategory(null)}
            >
              Clear filter
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recommended For You</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">More</a>
        </div>
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>
          <TabsContent value="exercises" className="mt-3">
            <ContentCarousel items={getFilteredItems(mockExercises)} />
          </TabsContent>
          <TabsContent value="workouts" className="mt-3">
            <ContentCarousel items={getFilteredItems(mockWorkouts)} />
          </TabsContent>
          <TabsContent value="programs" className="mt-3">
            <ContentCarousel items={getFilteredItems(mockPrograms)} />
          </TabsContent>
        </Tabs>
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Trending Workouts</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">More</a>
        </div>
        <ContentCarousel items={getFilteredItems(mockWorkouts.slice(0, 6))} />
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">New Releases</h2>
          <a href="#" className="text-fitbloom-purple hover:underline text-sm">More</a>
        </div>
        <ContentCarousel items={getFilteredItems([...mockExercises, ...mockWorkouts, ...mockPrograms].slice(0, 6))} />
      </section>
    </div>
  );
};

export default Explore;
