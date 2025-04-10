
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';
import ContentGrid from '@/components/ui/ContentGrid';
import { useLiked } from '@/contexts/LikedContext';
import { useNavigate } from 'react-router-dom';

const Liked = () => {
  const { getLikedItemsByType } = useLiked();
  const navigate = useNavigate();
  
  // Get the liked items by type
  const likedExercises = getLikedItemsByType('exercise');
  const likedWorkouts = getLikedItemsByType('workout');
  const likedPrograms = getLikedItemsByType('program');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 fill-fitbloom-purple text-fitbloom-purple" />
          Liked Content
        </h1>
      </div>

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="mb-4 w-full grid grid-cols-3">
          <TabsTrigger value="exercises" className="text-sm">Exercises</TabsTrigger>
          <TabsTrigger value="workouts" className="text-sm">Workouts</TabsTrigger>
          <TabsTrigger value="programs" className="text-sm">Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exercises" className="mt-4">
          {likedExercises.length > 0 ? (
            <ContentGrid items={likedExercises} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't liked any exercises yet.</p>
              <Button 
                className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
                onClick={() => navigate('/search')}
              >
                Find Exercises
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="workouts" className="mt-4">
          {likedWorkouts.length > 0 ? (
            <ContentGrid items={likedWorkouts} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't liked any workouts yet.</p>
              <Button 
                className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
                onClick={() => navigate('/library')}
              >
                Browse Workouts
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="programs" className="mt-4">
          {likedPrograms.length > 0 ? (
            <ContentGrid items={likedPrograms} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't liked any programs yet.</p>
              <Button 
                className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
                onClick={() => navigate('/library')}
              >
                Discover Programs
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Liked;
