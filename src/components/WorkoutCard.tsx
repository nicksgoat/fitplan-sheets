
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import WorkoutDetailDrawer from "./WorkoutDetailDrawer";

interface Workout {
  id: string;
  name: string;
  exerciseCount: number;
  duration: string;
  category: string;
  difficulty: string;
  createdBy: string;
}

interface WorkoutCardProps {
  workout: Workout;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  
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
    <>
      <Card 
        className="overflow-hidden hover:ring-1 hover:ring-purple-500 transition-all cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        <div className={`h-40 flex items-center justify-center ${getBgGradient(workout.category)}`}>
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={toggleLike} 
              className={`p-2 rounded-full ${isLiked ? 'bg-purple-500' : 'bg-gray-800 bg-opacity-60 hover:bg-gray-700'}`}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>
          <span className="text-xl font-bold text-white">{workout.name}</span>
        </div>
        
        <CardContent className="p-4">
          <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">WORKOUT</div>
          <h3 className="text-lg font-semibold mb-1">{workout.name}</h3>
          <p className="text-sm text-gray-400 mb-4">{workout.createdBy}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
            <div>{workout.exerciseCount} exercises</div>
            <div>{workout.duration}</div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-200">
              {workout.category}
            </Badge>
            
            <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-200">
              {workout.difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <WorkoutDetailDrawer
        workout={workout}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isLiked={isLiked}
        onLikeToggle={() => setIsLiked(!isLiked)}
      />
    </>
  );
};

export default WorkoutCard;
