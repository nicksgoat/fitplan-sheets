
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import WorkoutPreviewSettings from "./WorkoutPreviewSettings";

interface WorkoutMobilePreviewProps {
  sessionId: string;
}

const WorkoutMobilePreview: React.FC<WorkoutMobilePreviewProps> = ({ sessionId }) => {
  const { program, activeWeekId } = useWorkout();
  const [activeTab, setActiveTab] = useState("preview");
  const [isExpanded, setIsExpanded] = useState(false);

  // Find the session
  const currentWeek = program.weeks?.find(week => week.id === activeWeekId);
  const session = currentWeek?.sessions.find(s => s.id === sessionId) || 
                  program.sessions.find(s => s.id === sessionId);

  if (!session) return null;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Preview</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6"
          >
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform", 
                isExpanded ? "rotate-90" : ""
              )} 
            />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleTabChange("settings")}
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {activeTab === "preview" && (
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[600px] overflow-y-auto" : "max-h-[200px] overflow-hidden"
        )}>
          <div className="p-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold">{session.name || `Day ${session.day} Session`}</h4>
                <div className="text-xs text-gray-500">Day {session.day}</div>
              </div>

              {session.exercises && session.exercises.length > 0 ? (
                <div className="space-y-2">
                  {session.exercises.map((exercise, index) => (
                    <motion.div 
                      key={exercise.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "bg-white rounded-md p-3 shadow-sm",
                        exercise.isCircuit && "border-l-4 border-primary/50",
                        exercise.isInCircuit && "bg-secondary/10"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "text-sm font-medium",
                          exercise.isCircuit && "text-primary",
                          exercise.name === "Finisher" && "text-orange-600",
                          exercise.name === "Cool down" && "text-blue-600"
                        )}>
                          {exercise.name}
                        </span>
                        {exercise.isCircuit && (
                          <span className="text-xs text-muted-foreground">
                            {exercise.isCircuit ? "3 rounds" : ""}
                          </span>
                        )}
                      </div>
                      {!exercise.isCircuit && exercise.sets && exercise.sets.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {exercise.sets[0].reps} reps • {exercise.sets[0].weight} lbs • RPE {exercise.sets[0].rpe}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  No exercises in this session
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <WorkoutPreviewSettings 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      )}
    </div>
  );
};

export default WorkoutMobilePreview;
