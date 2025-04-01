
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const WeekTabs: React.FC = () => {
  const { program, activeWeekId, setActiveWeekId, setActiveWorkoutId, addWeek } = useWorkout();
  
  if (!program || !program.weeks) return null;
  
  const handleWeekClick = (weekId: string) => {
    setActiveWeekId(weekId);
    
    // Find the first workout in this week and make it active
    const week = program.weeks.find(w => w.id === weekId);
    if (week && week.workouts && week.workouts.length > 0) {
      setActiveWorkoutId(week.workouts[0]);
    }
  };
  
  const handleAddWeek = () => {
    const newWeekId = addWeek("programId");
    // Ensure newWeekId is a string before using it
    if (typeof newWeekId === 'string') {
      setActiveWeekId(newWeekId);
      
      // Find the newly created week and activate its first workout
      const newWeek = program.weeks.find(w => w.id === newWeekId);
      if (newWeek && newWeek.workouts && newWeek.workouts.length > 0) {
        setActiveWorkoutId(newWeek.workouts[0]);
      }
    }
  };
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex items-center gap-1 border-b border-dark-300 pb-1">
        {program.weeks.map((week) => (
          <button
            key={week.id}
            className={cn(
              "px-4 py-2 rounded-t-lg text-sm font-medium relative",
              "transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5",
              activeWeekId === week.id
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            )}
            onClick={() => handleWeekClick(week.id)}
          >
            <Calendar className="h-4 w-4" />
            {week.name}
            {activeWeekId === week.id && (
              <motion.div
                layoutId="activeWeekTab"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500"
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
          className="px-2 flex items-center gap-1 text-gray-400 hover:text-gray-200 hover:bg-dark-300"
          onClick={handleAddWeek}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Add Week</span>
        </Button>
      </div>
    </div>
  );
};

export default WeekTabs;
