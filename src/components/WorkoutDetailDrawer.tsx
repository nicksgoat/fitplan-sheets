
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Heart, Share, Calendar, Play, Plus } from "lucide-react";

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

  // Generate a background gradient based on the workout category
  const getBgGradient = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength":
        return "bg-gradient-to-br from-blue-900 to-purple-900";
      case "hiit":
        return "bg-gradient-to-br from-red-900 to-orange-900";
      case "cardio":
        return "bg-gradient-to-br from-green-900 to-teal-900";
      case "flexibility":
        return "bg-gradient-to-br from-indigo-900 to-blue-900";
      default:
        return "bg-gradient-to-br from-gray-800 to-gray-900";
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className={`h-40 flex items-center justify-center ${getBgGradient(workout.category)}`}>
          <span className="text-2xl font-bold text-white">{workout.name}</span>
        </div>
        
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle className="text-xl">{workout.name}</DrawerTitle>
          <DrawerDescription>
            <div className="flex items-center text-gray-400 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span className="mr-3">{workout.duration}</span>
              <span>{workout.exerciseCount} exercises</span>
            </div>
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="exercises" className="flex-1">Exercises</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="py-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-dark-300">
                  {workout.category}
                </Badge>
                <Badge variant="outline" className="bg-dark-300">
                  {workout.difficulty}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">About this workout</h3>
                <p className="text-gray-400">
                  This {workout.category.toLowerCase()} workout was designed to help you improve your {workout.category.toLowerCase()} 
                  and fitness. It's suitable for {workout.difficulty.toLowerCase()} level athletes and takes approximately {workout.duration} to complete.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Created by</h3>
                <p className="text-gray-400">{workout.createdBy}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="exercises" className="py-4">
              <div className="text-gray-400 py-8 text-center">
                Exercise list will be displayed here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DrawerFooter className="px-6 py-4 flex-row justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onLikeToggle} className={isLiked ? "bg-purple-500 hover:bg-purple-600 text-white" : ""}>
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-white" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </Button>
            
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default WorkoutDetailDrawer;
