
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

interface Program {
  id: string;
  name: string;
  workoutCount: number;
  duration: string;
  category: string;
  difficulty: string;
  createdBy: string;
}

interface ProgramCardProps {
  program: Program;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const [isLiked, setIsLiked] = React.useState(false);
  
  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  
  // Generate a background gradient based on the program category
  const getBgGradient = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength":
        return "bg-gradient-to-br from-indigo-900 to-violet-900";
      case "hypertrophy":
        return "bg-gradient-to-br from-purple-900 to-pink-900";
      case "endurance":
        return "bg-gradient-to-br from-blue-900 to-cyan-900";
      case "power":
        return "bg-gradient-to-br from-emerald-900 to-green-900";
      default:
        return "bg-gradient-to-br from-slate-800 to-slate-900";
    }
  };
  
  return (
    <Card className="overflow-hidden hover:ring-1 hover:ring-purple-500 transition-all cursor-pointer">
      <div className={`h-40 flex items-center justify-center ${getBgGradient(program.category)}`}>
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={toggleLike} 
            className={`p-2 rounded-full ${isLiked ? 'bg-purple-500' : 'bg-gray-800 bg-opacity-60 hover:bg-gray-700'}`}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
          </button>
        </div>
        <span className="text-xl font-bold text-white">{program.name}</span>
      </div>
      
      <CardContent className="p-4">
        <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">PROGRAM</div>
        <h3 className="text-lg font-semibold mb-1">{program.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{program.createdBy}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <div>{program.workoutCount} workouts</div>
          <div>{program.duration}</div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-200">
            {program.category}
          </Badge>
          
          <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-200">
            {program.difficulty}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramCard;
