
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutSession } from "@/types/workout";

const SessionTabs: React.FC = () => {
  const { program, activeSessionId, activeWeekId, setActiveSessionId, addSession } = useWorkout();
  
  if (!activeWeekId) return null;
  
  const currentWeek = program.weeks.find(w => w.id === activeWeekId);
  if (!currentWeek) return null;
  
  const sessionsInWeek = currentWeek.sessions
    .map(sessionId => program.sessions.find(s => s.id === sessionId))
    .filter(session => session !== undefined) as WorkoutSession[];
  
  if (sessionsInWeek.length <= 0) return null;
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {sessionsInWeek.map((session) => (
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
          className="px-2 flex items-center gap-1 text-muted-foreground"
          onClick={() => addSession(activeWeekId)}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Add Session</span>
        </Button>
      </div>
    </div>
  );
};

export default SessionTabs;
