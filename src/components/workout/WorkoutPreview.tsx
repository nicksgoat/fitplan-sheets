import React from "react";
import { Workout } from "@/types/workout";
import { cn } from "@/lib/utils";
import WorkoutMobilePreview from "../WorkoutMobilePreview";
import { LockIcon } from "lucide-react";

interface WorkoutPreviewProps {
  workout: Workout;
  blurred?: boolean;
}

const WorkoutPreview = ({ workout, blurred = false }: WorkoutPreviewProps) => {
  
  return (
    <div className={cn("relative", {
      "pointer-events-none": blurred
    })}>
      {blurred && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <span className="text-white text-lg font-medium mb-2">Purchase to access</span>
          <LockIcon className="h-8 w-8 text-white opacity-80" />
        </div>
      )}
      
      <WorkoutMobilePreview 
        sessionId={workout.id} 
        creatorId={workout.creatorId}
      />
    </div>
  );
};

export default WorkoutPreview;
