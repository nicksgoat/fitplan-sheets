
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const SessionTabs: React.FC = () => {
  const { program, activeSessionId, setActiveSessionId, activeWeekId, addSession } = useWorkout();
  
  // Get sessions from the active week
  const activeWeek = program.weeks?.find(week => week.id === activeWeekId);
  const sessions = activeWeek?.sessions || [];
  
  if (sessions.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            className={cn(
              "px-4 py-2 rounded-t-lg text-sm font-medium relative",
              "transition-colors duration-200 whitespace-nowrap",
              activeSessionId === session.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveSessionId(session.id)}
          >
            {session.name}
            {activeSessionId === session.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs ml-2"
          onClick={() => addSession()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Session
        </Button>
      </div>
    </div>
  );
};

export default SessionTabs;
