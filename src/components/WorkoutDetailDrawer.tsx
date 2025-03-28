
import React from "react";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Clock3, Heart } from "lucide-react";

interface Workout {
  id: string;
  name: string;
  exerciseCount: number;
  duration: string;
  category: string;
  difficulty: string;
  createdBy: string;
}

interface WorkoutDetailDrawerProps {
  workout: Workout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLiked: boolean;
  onLikeToggle: () => void;
}

const WorkoutDetailDrawer: React.FC<WorkoutDetailDrawerProps> = ({
  workout,
  open,
  onOpenChange,
  isLiked,
  onLikeToggle,
}) => {
  if (!workout) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-black p-0">
        {/* Top tabs for switching views */}
        <div className="bg-black w-full">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-transparent">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent">
                Details
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent">
                Leaderboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-0 m-0">
              <div className="p-6">
                <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">
                  WORKOUT
                </div>
                <h1 className="text-2xl font-bold mb-1">{workout.name}</h1>
                <p className="text-gray-400 mb-4">{workout.createdBy}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-black text-white border border-gray-700">{workout.category}</Badge>
                  <Badge className="bg-black text-white border border-gray-700">{workout.difficulty}</Badge>
                  <Badge className="bg-black text-white border border-gray-700">Full Body</Badge>
                  <Badge className="bg-black text-white border border-gray-700">Intense</Badge>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-3">Description</h2>
                  <p className="text-gray-400">
                    A high-intensity interval training workout that targets all major muscle groups.
                  </p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-3">Exercises</h2>
                  <div className="text-gray-400">
                    {workout.exerciseCount} exercises
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="p-6">
              <div className="text-gray-400 py-8 text-center">
                Leaderboard will be displayed here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex px-6 py-4 border-t border-gray-800 justify-between">
          <DrawerClose asChild>
            <Button variant="outline" className="bg-transparent border-gray-700 text-white">
              Close
            </Button>
          </DrawerClose>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            Start Workout
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default WorkoutDetailDrawer;
