
import React, { useMemo } from 'react';
import { format, isSameDay, startOfWeek, addDays, isToday, isPast } from 'date-fns';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useLibrary } from '@/contexts/LibraryContext';
import { Workout } from '@/types/workout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WorkoutDetail from '@/components/details/WorkoutDetail';
import { ItemType } from '@/lib/types';

const WeekAtGlance = () => {
  const { workoutsForDay, activeSchedule, completeWorkout } = useSchedule();
  const { workouts: libraryWorkouts } = useLibrary();
  const [currentWeekStart, setCurrentWeekStart] = React.useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedWorkout, setSelectedWorkout] = React.useState<{ itemType: ItemType, workoutData?: Workout } | null>(null);
  
  // Generate current week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);
  
  // Go to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };
  
  // Go to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };
  
  // Find workout data by ID
  const getWorkoutById = (workoutId: string): Workout | undefined => {
    return libraryWorkouts.find(w => w.id === workoutId);
  };
  
  // Handle workout click to show details
  const handleWorkoutClick = (scheduledWorkoutId: string, workoutId: string) => {
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
        description: `Workout with ${workout.exercises.length} exercises`,
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
  
  // Handle marking a workout as complete
  const handleMarkComplete = (scheduledWorkoutId: string) => {
    completeWorkout(scheduledWorkoutId);
  };
  
  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between bg-black p-2 rounded-lg">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToPreviousWeek}
          className="text-fitbloom-text-medium hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-fitbloom-purple" />
          <h2 className="text-sm font-medium">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </h2>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextWeek}
          className="text-fitbloom-text-medium hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {weekDays.map((day) => {
          const dayWorkouts = workoutsForDay(day);
          const formattedDay = format(day, 'EEEE, MMM d');
          const isCurrentDay = isToday(day);
          
          return (
            <Card 
              key={formattedDay} 
              className={`border-gray-800 ${isCurrentDay ? 'bg-gray-900/50 border-fitbloom-purple' : 'bg-gray-900/30'}`}
            >
              <CardHeader className="py-2 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {isCurrentDay && <Badge className="bg-fitbloom-purple text-[10px]">Today</Badge>}
                    {formattedDay}
                  </CardTitle>
                  <span className="text-xs text-gray-400">
                    {dayWorkouts.length > 0 
                      ? `${dayWorkouts.length} workout${dayWorkouts.length > 1 ? 's' : ''}` 
                      : 'Rest day'}
                  </span>
                </div>
              </CardHeader>
              
              {dayWorkouts.length > 0 && (
                <CardContent className="px-4 py-2">
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-2">
                      {dayWorkouts.map((scheduledWorkout) => {
                        const workout = getWorkoutById(scheduledWorkout.workoutId);
                        const isPastWorkout = isPast(new Date(scheduledWorkout.date)) && !isToday(new Date(scheduledWorkout.date));
                        
                        if (!workout) return null;
                        
                        return (
                          <div 
                            key={scheduledWorkout.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer 
                              ${scheduledWorkout.completed 
                                ? 'bg-green-900/20 border border-green-800' 
                                : isPastWorkout 
                                  ? 'bg-amber-900/20 border border-amber-800'
                                  : 'bg-gray-800 hover:bg-gray-700'
                              } transition-colors`}
                          >
                            <div 
                              className="flex-1"
                              onClick={() => handleWorkoutClick(scheduledWorkout.id, scheduledWorkout.workoutId)}
                            >
                              <h3 className="text-sm font-medium">
                                {workout.name}
                                {scheduledWorkout.completed && (
                                  <span className="ml-2 text-green-400 text-xs">(Completed)</span>
                                )}
                              </h3>
                              <p className="text-xs text-fitbloom-text-medium mt-1">
                                {workout.exercises.length} exercises
                              </p>
                            </div>
                            
                            {!scheduledWorkout.completed && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gray-700"
                                onClick={() => handleMarkComplete(scheduledWorkout.id)}
                              >
                                <CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-400" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          );
        })}
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
    </div>
  );
};

export default WeekAtGlance;
