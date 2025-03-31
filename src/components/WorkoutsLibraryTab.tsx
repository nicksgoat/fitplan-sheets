
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Plus, PlayCircle, BookmarkIcon, Clock, FolderPlus } from "lucide-react";
import ContentCard from "@/components/ui/ContentCard";
import ContentGrid from "@/components/ui/ContentGrid";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Workout } from "@/types/workout";

interface WorkoutsLibraryTabProps {
  onClose?: () => void;
}

export default function WorkoutsLibraryTab({ onClose }: WorkoutsLibraryTabProps) {
  const { 
    getWorkoutLibrary, 
    loadWorkoutFromLibrary,
    activeWeekId
  } = useWorkout();
  
  const workouts = getWorkoutLibrary();
  
  const handleAddWorkout = (workout: Workout) => {
    if (activeWeekId) {
      loadWorkoutFromLibrary(workout);
      if (onClose) onClose();
    }
  };
  
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Workout Library</h2>
        <p className="text-sm text-gray-500">Browse and add workouts to your training plan.</p>
      </div>
      
      {workouts.length > 0 ? (
        <ContentGrid>
          {workouts.map((workout) => (
            <ContentCard key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>
                  {workout.exercises.length} Exercises
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="text-sm text-muted-foreground">
                  {workout.name}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button variant="link" size="sm">
                  View Workout <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="sm" onClick={() => handleAddWorkout(workout)}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </CardFooter>
            </ContentCard>
          ))}
        </ContentGrid>
      ) : (
        <div className="text-center py-6">
          <h3 className="text-md font-medium">No Workouts in Library</h3>
          <p className="text-sm text-gray-500">Save workouts to the library to access them here.</p>
        </div>
      )}
    </div>
  );
}
