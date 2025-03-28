
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Exercise } from "@/utils/exerciseLibrary";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import ExerciseDetailDialog from "./ExerciseDetailDialog";

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  
  // Generate a background gradient based on the exercise category
  const getBgGradient = (category: string) => {
    switch (category) {
      case "barbell":
        return "bg-gradient-to-br from-purple-900 to-blue-900";
      case "dumbbell":
        return "bg-gradient-to-br from-blue-900 to-teal-900";
      case "machine":
        return "bg-gradient-to-br from-teal-900 to-green-900";
      case "bodyweight":
        return "bg-gradient-to-br from-orange-900 to-red-900";
      case "kettlebell":
        return "bg-gradient-to-br from-red-900 to-pink-900";
      case "cable":
        return "bg-gradient-to-br from-indigo-900 to-purple-900";
      case "cardio":
        return "bg-gradient-to-br from-green-900 to-yellow-900";
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
        <div className={`h-48 flex items-center justify-center ${getBgGradient(exercise.category)}`}>
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={toggleLike} 
              className={`p-2 rounded-full ${isLiked ? 'bg-purple-500' : 'bg-gray-800 bg-opacity-60 hover:bg-gray-700'}`}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>
          <span className="text-xl font-bold text-white">{exercise.name}</span>
        </div>
        
        <CardContent className="p-4">
          <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">EXERCISE</div>
          <h3 className="text-lg font-semibold mb-1">{exercise.name}</h3>
          <p className="text-sm text-gray-400 mb-4">FitBloom Trainer</p>
          
          <div className="flex flex-wrap gap-2">
            {exercise.primaryMuscle && (
              <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-200">
                {exercise.primaryMuscle.charAt(0).toUpperCase() + exercise.primaryMuscle.slice(1)}
              </Badge>
            )}
            
            {exercise.category && (
              <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-200">
                {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      <ExerciseDetailDialog
        exercise={exercise}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isLiked={isLiked}
        onLikeToggle={() => setIsLiked(!isLiked)}
      />
    </>
  );
};

export default ExerciseCard;
