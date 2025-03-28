
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { getOrganizedExercises } from "@/utils/workoutPreviewUtils";
import MobileDeviceFrame from "./workout-preview/MobileDeviceFrame";
import ExerciseCard from "./workout-preview/ExerciseCard";

interface WorkoutMobilePreviewProps {
  sessionId: string;
}

const WorkoutMobilePreview: React.FC<WorkoutMobilePreviewProps> = ({
  sessionId
}) => {
  const { program } = useWorkout();
  
  // Make sure program and program.sessions exist before trying to find the session
  if (!program || !program.workouts || program.workouts.length === 0) {
    return null;
  }
  
  // Find the session using sessionId (which is actually the workoutId)
  const session = program.workouts.find(s => s.id === sessionId);
  
  // If session doesn't exist, return null
  if (!session) {
    console.log(`Session with ID ${sessionId} not found`);
    return null;
  }
  
  // Get the week number safely
  let weekNumber = session.day; // Default to session.day
  
  if (session.weekId && program.weeks) {
    const week = program.weeks.find(w => w.id === session.weekId);
    if (week) {
      weekNumber = week.order || session.day;
    }
  }
  
  // Make sure session.exercises exists before trying to organize them
  if (!session.exercises) {
    console.log(`Session with ID ${sessionId} has no exercises`);
    return null;
  }
  
  const { exercises, circuitMap } = getOrganizedExercises(session.exercises);
  
  return (
    <div className={cn("glass-panel rounded-xl overflow-hidden h-full")}>
      <div className="bg-[#f8fafc] p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Preview</h2>
      </div>
      
      <MobileDeviceFrame title={`Day ${weekNumber}`} subtitle={session.name} className="py-[14px] px-[23px]">
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
