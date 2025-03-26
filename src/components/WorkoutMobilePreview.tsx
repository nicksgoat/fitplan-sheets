
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutMobilePreviewProps {
  sessionId: string;
}

const WorkoutMobilePreview: React.FC<WorkoutMobilePreviewProps> = ({ sessionId }) => {
  const { program } = useWorkout();
  const session = program.sessions.find((s) => s.id === sessionId);
  
  if (!session) return null;
  
  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full">
      <div className="bg-[#f8fafc] p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Preview</h2>
      </div>
      
      <div className="relative w-full p-4 flex justify-center">
        <div className="w-[280px] h-[580px] border-[8px] border-[#1a1a1a] rounded-[40px] overflow-hidden shadow-xl">
          <div className="absolute top-[24px] left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-[#1a1a1a] rounded-b-xl z-10"></div>
          
          <div className="w-full h-full bg-[#f8fafc] overflow-y-auto p-4">
            <div className="text-xl font-bold mb-1">{session.name}</div>
            <div className="text-sm text-gray-500 mb-4">0:00</div>
            
            <div className="text-lg font-semibold mb-3">Exercises</div>
            
            {session.exercises
              .filter(ex => !ex.groupId)
              .map((exercise, index) => (
                <motion.div 
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
                    exercise.isGroup && "bg-gray-50"
                  )}
                >
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <h3 className={cn(
                        "font-medium",
                        exercise.isGroup && "text-purple-600",
                        exercise.name === "Finisher" && "text-orange-600",
                        exercise.name === "Cool down" && "text-blue-600"
                      )}>
                        {exercise.name}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {exercise.sets > 0 && exercise.sets !== 1 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {exercise.sets} sets
                        {exercise.reps && `, ${exercise.reps} reps`}
                      </div>
                    )}
                    
                    {exercise.rest && (
                      <div className="text-sm text-gray-500 mt-1">
                        {exercise.rest}
                      </div>
                    )}
                    
                    {exercise.notes && (
                      <div className="text-sm text-gray-600 mt-2 italic">
                        {exercise.notes}
                      </div>
                    )}
                    
                    {exercise.isGroup && (
                      <div className="mt-2">
                        {session.exercises
                          .filter(ex => ex.groupId === exercise.id)
                          .map((subExercise, idx) => (
                            <div
                              key={subExercise.id}
                              className="pl-3 py-2 border-t border-gray-100 flex items-center"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-2"></div>
                              <div>
                                <div className="text-sm font-medium">{subExercise.name}</div>
                                <div className="text-xs text-gray-500">
                                  {subExercise.sets} x {subExercise.reps}
                                  {subExercise.weight && ` @ ${subExercise.weight}`}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {(exercise.sets > 0 && exercise.sets !== 1 && !exercise.isGroup) && (
                    <div className="grid grid-cols-4 text-sm border-t border-gray-200">
                      <div className="p-2 font-medium text-center border-r border-gray-200">Set</div>
                      <div className="p-2 font-medium text-center border-r border-gray-200">Target</div>
                      <div className="p-2 font-medium text-center border-r border-gray-200">{exercise.weight ? "Weight" : "—"}</div>
                      <div className="p-2 font-medium text-center">Reps</div>
                      
                      {Array.from({ length: exercise.sets }).map((_, idx) => (
                        <React.Fragment key={idx}>
                          <div className="p-2 text-center border-t border-r border-gray-200">{idx + 1}</div>
                          <div className="p-2 text-center border-t border-r border-gray-200">
                            {exercise.rpe || "—"}
                          </div>
                          <div className="p-2 text-center border-t border-r border-gray-200">
                            {exercise.weight ? (
                              Array.isArray(exercise.weight.split(',')) && exercise.weight.split(',')[idx]
                                ? exercise.weight.split(',')[idx].trim()
                                : exercise.weight
                            ) : "—"}
                          </div>
                          <div className="p-2 text-center border-t border-gray-200">
                            {exercise.reps ? (
                              Array.isArray(exercise.reps.split(',')) && exercise.reps.split(',')[idx]
                                ? exercise.reps.split(',')[idx].trim()
                                : exercise.reps
                            ) : "—"}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutMobilePreview;
