
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "./ui/button";
import UserProfile from "./UserProfile";
import { Download, MoreVertical, Save } from "lucide-react";

const WorkoutHeader: React.FC = () => {
  const { program } = useWorkout();
  
  // Provide defaults if title or description are not available
  const title = program.name || "My Workout Program";
  const description = program.description || "Custom workout program";
  
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="mb-1 text-2xl font-bold md:text-3xl">{title}</h1>
        <p className="text-sm text-gray-400 md:text-base">{description}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden md:flex md:gap-2">
          <Button variant="outline" size="sm" className="border-dark-300 text-gray-300">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="border-dark-300 text-gray-300">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        
        <UserProfile />
      </div>
    </header>
  );
};

export default WorkoutHeader;
