
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { getOrganizedExercises } from "@/utils/workoutPreviewUtils";
import MobileDeviceFrame from "./workout-preview/MobileDeviceFrame";
import ExerciseCard from "./workout-preview/ExerciseCard";
import { useExercise } from "@/hooks/useExerciseLibrary";
import { toast } from "sonner";

interface WorkoutMobilePreviewProps {
  sessionId: string;
}

const WorkoutMobilePreview: React.FC<WorkoutMobilePreviewProps> = ({
  sessionId
}) => {
  const {
    program
  } = useWorkout();

  // Guard clauses to prevent accessing properties of undefined objects
  if (!program) return null;
  if (!program.workouts) return null;
  
  const session = program.workouts.find(s => s.id === sessionId);
  if (!session) return null;
  
  const weekNumber = session.weekId ? program.weeks?.find(w => w.id === session.weekId)?.order || session.day : session.day;
  const {
    exercises,
    circuitMap
  } = getOrganizedExercises(session.exercises);
  
  return (
    <div className={cn("glass-panel rounded-xl overflow-hidden h-full")}>
      <div className="p-4 border-b border-border bg-zinc-950">
        <h2 className="text-lg font-semibold">Preview</h2>
      </div>
      
      <MobileDeviceFrame title={`${weekNumber}`} subtitle={session.name} className="py-[14px] px-[23px]">
        <div className="p-4">
          <div className="text-lg font-semibold mb-3">Exercises</div>
          
          {exercises.map((exercise, index) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              index={index} 
              allExercises={session.exercises} 
              circuitMap={circuitMap} 
            />
          ))}
        </div>
      </MobileDeviceFrame>
    </div>
  );
};

export default WorkoutMobilePreview;
