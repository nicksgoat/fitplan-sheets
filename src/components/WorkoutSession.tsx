
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import WorkoutSessionHeader from "./WorkoutSessionHeader";
import WorkoutTable from "./WorkoutTable";
import CircuitControls from "./CircuitControls";

interface WorkoutSessionProps {
  sessionId: string;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ sessionId }) => {
  const { program } = useWorkout();
  const session = program.sessions.find((s) => s.id === sessionId);
  
  if (!session) return null;
  
  return (
    <div className="session-card bg-dark-200 border border-dark-300 rounded-lg overflow-hidden shadow-md">
      <WorkoutSessionHeader sessionId={sessionId} />
      <div className="px-4 py-2 border-b border-dark-300 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-gray-300">Exercises</h3>
        </div>
        <CircuitControls sessionId={sessionId} />
      </div>
      <WorkoutTable session={session} />
    </div>
  );
};

export default WorkoutSession;
