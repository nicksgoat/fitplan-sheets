
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ContentGrid from '@/components/ui/ContentGrid';
import { mockExercises, mockWorkouts, mockPrograms } from '@/lib/mockData';
import { ItemType } from '@/lib/types';
import MainLayout from '@/components/layout/MainLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const SearchPage = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ItemType[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'exercise' | 'workout' | 'program'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  
  const allItems = [...mockExercises, ...mockWorkouts, ...mockPrograms];

  // Parse search query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    let results = allItems.filter(item => {
      const matchesQuery = 
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.creator.toLowerCase().includes(normalizedQuery) ||
        item.type.toLowerCase().includes(normalizedQuery) ||
        item.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
        (item.description && item.description.toLowerCase().includes(normalizedQuery));
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesDifficulty = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
      
      return matchesQuery && matchesType && matchesDifficulty;
    });

    setSearchResults(results);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for exercises, workouts..."
            className="pl-10 bg-gray-900 border-gray-700 text-white pr-10"
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-1"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Select 
            value={typeFilter} 
            onValueChange={(value: 'all' | 'exercise' | 'workout' | 'program') => {
              setTypeFilter(value);
              performSearch(searchQuery);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="exercise">Exercises</SelectItem>
              <SelectItem value="workout">Workouts</SelectItem>
              <SelectItem value="program">Programs</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={difficultyFilter} 
            onValueChange={(value: 'all' | 'beginner' | 'intermediate' | 'advanced') => {
              setDifficultyFilter(value);
              performSearch(searchQuery);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {searchQuery && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {searchResults.length ? `Results for "${searchQuery}"` : `No results for "${searchQuery}"`}
            </h2>
            {searchResults.length > 0 && <ContentGrid items={searchResults} />}
          </div>
        )}

        {!searchQuery && (
          <div className="flex flex-col items-center justify-center h-60 text-center text-gray-400">
            <SearchIcon className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg">Search for exercises, workouts, and programs</p>
            <p className="text-sm">Try searching for specific activities, muscle groups, or trainers</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchPage;
