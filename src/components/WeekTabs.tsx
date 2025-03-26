
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const WeekTabs: React.FC = () => {
  const { program, activeWeekId, setActiveWeekId, setActiveSessionId } = useWorkout();
  
  // If we don't have a weeks structure, don't render anything
  if (!program.weeks || program.weeks.length === 0) {
    return null;
  }
  
  const handleWeekChange = (weekId: string) => {
    setActiveWeekId(weekId);
    
    // Also set the first session of the selected week as active
    const selectedWeek = program.weeks.find(week => week.id === weekId);
    if (selectedWeek && selectedWeek.sessions.length > 0) {
      setActiveSessionId(selectedWeek.sessions[0].id);
    }
  };
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {program.weeks.map((week) => (
          <button
            key={week.id}
            className={cn(
              "px-4 py-2 rounded-t-lg text-sm font-medium relative",
              "transition-colors duration-200 whitespace-nowrap",
              activeWeekId === week.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleWeekChange(week.id)}
          >
            {week.name}
            {activeWeekId === week.id && (
              <motion.div
                layoutId="activeWeekTab"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekTabs;
