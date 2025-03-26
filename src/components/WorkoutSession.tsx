
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import WorkoutSessionHeader from "./WorkoutSessionHeader";
import WorkoutTable from "./WorkoutTable";

interface WorkoutSessionProps {
  sessionId: string;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ sessionId }) => {
  const { program, activeWeekId } = useWorkout();
  
  // Find the session in the active week or fall back to flat sessions array
  let session;
  
  if (activeWeekId && program.weeks) {
    const currentWeek = program.weeks.find(week => week.id === activeWeekId);
    session = currentWeek?.sessions.find(s => s.id === sessionId);
  }
  
  // If not found in the weeks structure, try the flat sessions array
  if (!session) {
    session = program.sessions.find(s => s.id === sessionId);
  }
  
  if (!session) return null;
  
  return (
    <div className="space-y-6">
      <WorkoutSessionHeader session={session} />
      <WorkoutTable session={session} />
    </div>
  );
};

export default WorkoutSession;
