
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import WorkoutSessionHeader from "./WorkoutSessionHeader";
import WorkoutTable from "./WorkoutTable";

interface WorkoutSessionProps {
  sessionId: string;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ sessionId }) => {
  const { program } = useWorkout();
  const session = program.workouts.find((s) => s.id === sessionId);
  
  if (!session) return null;
  
  return (
    <div className="session-card bg-dark-200 border border-dark-300 rounded-lg overflow-hidden shadow-md">
      <WorkoutSessionHeader sessionId={sessionId} />
      <WorkoutTable session={session} />
    </div>
  );
};

export default WorkoutSession;
