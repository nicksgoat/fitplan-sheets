
import React, { useState } from 'react';
import { ItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import LeaderboardTab from './LeaderboardTab';
import WorkoutDetail from './WorkoutDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProgramDetailProps {
  item: ItemType;
  onClose: () => void;
}

const PROGRAM_WEEKS = {
  'p1': 4, // 30-Day Strength Challenge
  'p2': 8, // Couch to 5K
  'p3': 3, // Mobility Mastery
  'p4': 12, // Athlete Performance
  'p5': 8, // Body Transformation
  'p6': 6, // Yoga Journey
  // Default value
  'default': 4
};

const ProgramDetail: React.FC<ProgramDetailProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [selectedWorkout, setSelectedWorkout] = useState<ItemType | null>(null);
  
  const totalWeeks = PROGRAM_WEEKS[item.id as keyof typeof PROGRAM_WEEKS] || PROGRAM_WEEKS.default;

  // Sample workout data that would come from your backend in a real app
  const getWorkoutForWeek = (weekIndex: number, workoutNum: number): ItemType => {
    // Generate a basic workout object based on the week and workout number
    const workoutTitles = [
      ["Upper Body Focus", "Lower Body Power", "Core & Cardio"],
      ["Full Body HIIT", "Recovery & Mobility", "Strength Challenge"],
      ["Strength Circuit", "Conditioning", "Active Recovery"]
    ];
    
    const title = workoutTitles[weekIndex % 3][workoutNum - 1];
    const duration = ["45 min", "50 min", "30 min", "40 min", "35 min", "45 min"][((weekIndex * 3) + workoutNum - 1) % 6];
    
    return {
      id: `w${weekIndex}${workoutNum}`,
      title: title,
      type: 'workout',
      creator: item.creator,
      imageUrl: item.imageUrl, // Use the same image as the program or replace with workout specific image
      duration: duration,
      tags: item.tags,
      difficulty: item.difficulty,
      isFavorite: false,
      description: `This is a ${title} workout from ${item.title}. Follow along with the guided exercises for a complete session.`
    };
  };

  const handleWorkoutClick = (weekIndex: number, workoutNum: number) => {
    const workout = getWorkoutForWeek(weekIndex, workoutNum);
    setSelectedWorkout(workout);
  };

  // Handle the embla carousel API
  const handleCarouselApiChange = (api: any) => {
    if (!api) return;
    
    // When the carousel selects a slide, update the active week
    api.on('select', () => {
      const selectedIndex = api.selectedScrollSnap();
      setActiveWeek(selectedIndex + 1);
    });
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
                      {Array.from({ length: totalWeeks }).map((_, weekIndex) => (
                        <CarouselItem key={weekIndex} className="basis-full">
                          <div className="space-y-3">
                            <div className="bg-gray-900 rounded-lg px-4 py-3 mb-4">
                              <h3 className="text-sm font-bold text-center">Week {weekIndex + 1}</h3>
                            </div>
                            {[1, 2, 3].map((workoutNum) => (
                              <div 
                                key={`${weekIndex+1}-${workoutNum}`} 
                                className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                                onClick={() => handleWorkoutClick(weekIndex, workoutNum)}
                              >
                                <div className="h-10 w-10 rounded-md bg-gray-800 flex items-center justify-center font-medium">
                                  W{workoutNum}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-sm font-medium">
                                    {weekIndex === 0 
                                      ? ["Upper Body Focus", "Lower Body Power", "Core & Cardio"][workoutNum-1] 
                                      : weekIndex === 1 
                                        ? ["Full Body HIIT", "Recovery & Mobility", "Strength Challenge"][workoutNum-1]
                                        : ["Strength Circuit", "Conditioning", "Active Recovery"][workoutNum-1]}
                                  </h3>
                                  <p className="text-xs text-fitbloom-text-medium mt-1">
                                    {["7 exercises • 45 min", "6 exercises • 50 min", "8 exercises • 30 min", 
                                      "5 exercises • 40 min", "6 exercises • 35 min", "7 exercises • 45 min"][((weekIndex*3)+workoutNum-1) % 6]}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-800/90 border-gray-700" />
                    <CarouselNext className="right-0 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-800/90 border-gray-700" />
                  </Carousel>
                </div>
              </div>
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
              item={selectedWorkout} 
              onClose={() => setSelectedWorkout(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProgramDetail;
