
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import WorkoutSessionHeader from "./WorkoutSessionHeader";
import WorkoutTable from "./WorkoutTable";

interface WorkoutSessionProps {
  sessionId: string;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ sessionId }) => {
  const { program, activeWeekId } = useWorkout();
  
  // Find the session in the active week
  const currentWeek = program.weeks?.find(week => week.id === activeWeekId);
  const session = currentWeek?.sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  return (
    <div className="space-y-6">
      <WorkoutSessionHeader sessionId={sessionId} />
      <WorkoutTable session={session} />
    </div>
  );
};

export default WorkoutSession;
