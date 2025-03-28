
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import ExerciseCard from "@/components/ExerciseCard";
import WorkoutCard from "@/components/WorkoutCard";
import CollectionCard from "@/components/CollectionCard";
import ProgramCard from "@/components/ProgramCard";
import { exerciseLibrary } from "@/utils/exerciseLibrary";
import { Tables } from "@/integrations/supabase/types";

interface LikedItem extends Tables.liked_items.Row {}

const Liked: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("exercises");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const { user } = useAuth();
  
  // Sample data (will be replaced with actual data from the database)
  const sampleWorkouts = [
    {
      id: "workout-1",
      name: "Full Body Strength",
      exerciseCount: 8,
      duration: "45 min",
      category: "Strength",
      difficulty: "Intermediate",
      createdBy: "FitBloom Trainer"
    },
    {
      id: "workout-2",
      name: "HIIT Cardio Blast",
      exerciseCount: 6,
      duration: "30 min",
      category: "HIIT",
      difficulty: "Advanced",
      createdBy: "FitBloom Trainer"
    }
  ];

  const sampleCollections = [
    {
      id: "collection-1",
      name: "Beginner Program",
      itemCount: 12,
      type: "exercises" as const,
      createdBy: "FitBloom Trainer"
    },
    {
      id: "collection-2",
      name: "Advanced Workouts",
      itemCount: 8,
      type: "workouts" as const,
      createdBy: "FitBloom Trainer"
    }
  ];

  // Fetch liked items for the current user
  useEffect(() => {
    const fetchLikedItems = async () => {
      if (!user) {
        setLikedItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('liked_items')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching liked items:', error);
          return;
        }

        setLikedItems(data || []);
      } catch (err) {
        console.error('Error in fetching liked items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedItems();
  }, [user]);

  // Filter liked items by type and search query
  const getLikedItemsByType = (type: string) => {
    return likedItems.filter(item => 
      item.item_type === type
    );
  };

  // Filter exercises
  const likedExerciseIds = getLikedItemsByType('exercise').map(item => item.item_id);
  const filteredExercises = exerciseLibrary.filter(exercise => 
    likedExerciseIds.includes(exercise.id) && 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For demo purposes, filter sample workouts and collections
  // In a real app, these would be fetched from the database based on liked IDs
  const likedWorkoutIds = getLikedItemsByType('workout').map(item => item.item_id);
  const filteredWorkouts = sampleWorkouts.filter(workout => 
    likedWorkoutIds.includes(workout.id) || 
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const likedCollectionIds = getLikedItemsByType('collection').map(item => item.item_id);
  const filteredCollections = sampleCollections.filter(collection => 
    likedCollectionIds.includes(collection.id) || 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Empty states for each tab
  const renderEmptyState = (type: string) => (
    <div className="text-gray-400 text-center py-16">
      You haven't liked any {type} yet. Browse the library and click the heart icon to add {type} to your liked collection.
    </div>
  );
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Liked</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-200"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <Button variant="outline" className="w-full md:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-dark-200 p-1">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exercises">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExercises.map(exercise => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          ) : (
            renderEmptyState("exercises")
          )}
        </TabsContent>
        
        <TabsContent value="workouts">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWorkouts.map(workout => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            renderEmptyState("workouts")
          )}
        </TabsContent>
        
        <TabsContent value="collections">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCollections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          ) : (
            renderEmptyState("collections")
          )}
        </TabsContent>
        
        <TabsContent value="programs">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            renderEmptyState("programs")
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Liked;
