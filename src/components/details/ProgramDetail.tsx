
import React, { useState } from 'react';
import { ItemType } from '@/lib/types';
import { WorkoutProgram, Workout } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import LeaderboardTab from './LeaderboardTab';
import WorkoutDetail from './WorkoutDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLibrary } from '@/contexts/LibraryContext';

interface ProgramDetailProps {
  item: ItemType;
  programData?: WorkoutProgram;
  onClose: () => void;
}

const ProgramDetail: React.FC<ProgramDetailProps> = ({ item, programData, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [selectedWorkout, setSelectedWorkout] = useState<{ itemType: ItemType, workoutData?: Workout } | null>(null);
  const { workouts } = useLibrary();
  
  // Get total weeks
  const totalWeeks = programData?.weeks?.length || 0;

  // Handle the embla carousel API
  const handleCarouselApiChange = (api: any) => {
    if (!api) return;
    
    // When the carousel selects a slide, update the active week
    api.on('select', () => {
      const selectedIndex = api.selectedScrollSnap();
      setActiveWeek(selectedIndex + 1);
    });
  };
  
  // Find workout by ID
  const getWorkoutById = (id: string): Workout | undefined => {
    if (programData?.workouts) {
      return programData.workouts.find(w => w.id === id);
    }
    return workouts.find(w => w.id === id);
  };
  
  // Handle workout click to show detail
  const handleWorkoutClick = (workoutId: string) => {
    const workout = getWorkoutById(workoutId);
    if (workout) {
      // Create an ItemType from the workout for display
      const workoutItem: ItemType = {
        id: workout.id,
        title: workout.name,
        type: 'workout',
        creator: 'You',
        imageUrl: 'https://placehold.co/600x400?text=Workout',
        tags: ['Workout', 'Custom'],
        duration: `${workout.exercises.length} exercises`,
        difficulty: 'intermediate',
        isFavorite: false,
        description: `Day ${workout.day} workout with ${workout.exercises.length} exercises`,
        isCustom: true,
        savedAt: workout.savedAt,
        lastModified: workout.lastModified
      };
      
      setSelectedWorkout({ 
        itemType: workoutItem,
        workoutData: workout
      });
    }
  };

  return (
    <>
      <div className="flex flex-col h-[80vh] overflow-y-auto pb-safe">
        {/* Header Image */}
        <div className="relative w-full h-48 md:h-64">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 h-10 w-10"
            onClick={() => {}}
          >
            <Heart className={item.isFavorite ? "h-5 w-5 fill-fitbloom-purple text-fitbloom-purple" : "h-5 w-5 text-white"} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-14 p-0 w-full flex justify-start">
              <TabsTrigger 
                value="details"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-fitbloom-purple rounded-none h-full"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-fitbloom-purple rounded-none h-full"
              >
                Leaderboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1">
          {activeTab === "details" ? (
            <>
              {!programData && (
                <Alert variant="destructive" className="bg-amber-900/20 border-amber-800 mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Program data not found</AlertTitle>
                  <AlertDescription>
                    This program may have been deleted or is not available in your library.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium uppercase text-fitbloom-text-medium">{item.type}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-fitbloom-text-medium" />
                    <span className="text-xs text-fitbloom-text-medium">{item.duration}</span>
                  </div>
                </div>
                <h1 className="text-xl font-bold mb-1">{item.title}</h1>
                <p className="text-sm text-fitbloom-text-medium">{item.creator}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {item.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                    {tag}
                  </Badge>
                ))}
                <Badge variant={item.difficulty === 'beginner' ? 'secondary' : item.difficulty === 'intermediate' ? 'default' : 'destructive'} 
                      className="text-xs px-2 py-0.5">
                  {item.difficulty}
                </Badge>
              </div>

              <div className="mt-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-sm text-gray-300">
                  {item.description || "This comprehensive program is designed to help you achieve your fitness goals over the course of several weeks. Follow the structured workouts for the best results."}
                </p>
              </div>

              {/* Program Duration */}
              <div className="mt-6">
                <h2 className="font-semibold mb-2">Duration</h2>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-fitbloom-purple" />
                  <span className="text-sm">{totalWeeks} weeks program</span>
                </div>
              </div>

              {/* Program Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">Progress</h2>
                  <span className="text-sm text-fitbloom-purple">0%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-fitbloom-purple h-2 rounded-full w-0"></div>
                </div>
              </div>

              {/* Workouts in this program by week - with swipeable carousel */}
              {programData && totalWeeks > 0 ? (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">Weekly Workouts</h2>
                    <span className="text-sm text-fitbloom-purple">Week {activeWeek} of {totalWeeks}</span>
                  </div>
                  
                  <div className="relative">
                    <Carousel 
                      opts={{
                        align: 'start',
                        loop: false,
                      }}
                      setApi={handleCarouselApiChange}
                      className="w-full"
                    >
                      <CarouselContent>
                        {programData.weeks.map((week, weekIndex) => (
                          <CarouselItem key={week.id} className="basis-full">
                            <div className="space-y-3">
                              <div className="bg-gray-900 rounded-lg px-4 py-3 mb-4">
                                <h3 className="text-sm font-bold text-center">{week.name}</h3>
                              </div>
                              
                              {week.workouts.length > 0 ? (
                                week.workouts.map((workoutId, workoutIndex) => {
                                  const workout = getWorkoutById(workoutId);
                                  return workout ? (
                                    <div 
                                      key={workoutId} 
                                      className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                                      onClick={() => handleWorkoutClick(workoutId)}
                                    >
                                      <div className="h-10 w-10 rounded-md bg-gray-800 flex items-center justify-center font-medium">
                                        D{workout.day}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-sm font-medium">{workout.name}</h3>
                                        <p className="text-xs text-fitbloom-text-medium mt-1">
                                          {workout.exercises.length} exercises
                                        </p>
                                      </div>
                                    </div>
                                  ) : null;
                                })
                              ) : (
                                <p className="text-sm text-center text-gray-400 py-4">No workouts in this week</p>
                              )}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-800/90 border-gray-700" />
                      <CarouselNext className="right-0 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-800/90 border-gray-700" />
                    </Carousel>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-sm text-gray-400 text-center py-4">No weeks found in this program</p>
                </div>
              )}
            </>
          ) : (
            <LeaderboardTab itemTitle={item.title} itemType={item.type} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 w-full bg-black bg-opacity-80 backdrop-blur-sm p-4 border-t border-gray-800 flex gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90">
            Start Program
          </Button>
        </div>
      </div>

      {/* Workout Detail Dialog */}
      {selectedWorkout && (
        <Dialog open={!!selectedWorkout} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedWorkout(null);
          }
        }}>
          <DialogContent className="p-0 border-0 max-w-4xl bg-transparent shadow-none">
            <WorkoutDetail 
              item={selectedWorkout.itemType} 
              workoutData={selectedWorkout.workoutData}
              onClose={() => setSelectedWorkout(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProgramDetail;
