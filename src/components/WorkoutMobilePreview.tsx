import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import WorkoutPreviewSettings from "./WorkoutPreviewSettings";

interface WorkoutMobilePreviewProps {
  sessionId: string;
}

const WorkoutMobilePreview: React.FC<WorkoutMobilePreviewProps> = ({ sessionId }) => {
  const { program } = useWorkout();
  const session = program.sessions.find((s) => s.id === sessionId);
  const [activeTab, setActiveTab] = useState("preview");
  
  if (!session) return null;
  
  // Organize exercises for display
  const getOrganizedExercises = () => {
    const result = [];
    const circuitMap = new Map();
    
    // First pass: collect circuits and standalone exercises
    for (const exercise of session.exercises) {
      if (exercise.isCircuit) {
        // This is a circuit header
        result.push(exercise);
      } else if (exercise.isInCircuit && exercise.circuitId) {
        // This is an exercise in a circuit
        if (!circuitMap.has(exercise.circuitId)) {
          circuitMap.set(exercise.circuitId, []);
        }
        circuitMap.get(exercise.circuitId).push(exercise);
      } else if (exercise.isGroup) {
        // This is a group header
        result.push(exercise);
      } else if (!exercise.groupId && !exercise.isInCircuit) {
        // This is a standalone exercise
        result.push(exercise);
      }
    }
    
    // Second pass: insert circuit exercises after their headers
    const finalResult = [];
    
    for (const exercise of result) {
      finalResult.push(exercise);
      
      if (exercise.isCircuit && exercise.circuitId) {
        // Don't display exercises here, they'll be shown in the circuit section
      } else if (exercise.isGroup) {
        // Don't process child exercises here, they're handled separately
      }
    }
    
    return { exercises: finalResult, circuitMap };
  };
  
  const { exercises, circuitMap } = getOrganizedExercises();
  
  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full">
      <div className="bg-[#f8fafc] p-4 border-b border-border">
        <WorkoutPreviewSettings 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
      
      {activeTab === "preview" && (
        <div className="relative w-full p-4 flex justify-center">
          <div className="w-[280px] h-[580px] border-[8px] border-[#1a1a1a] rounded-[40px] overflow-hidden shadow-xl">
            <div className="absolute top-[24px] left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-[#1a1a1a] rounded-b-xl z-10"></div>
            
            <div className="w-full h-full bg-[#f8fafc] overflow-y-auto p-4">
              <div className="text-xl font-bold mb-1">{session.name}</div>
              <div className="text-sm text-gray-500 mb-4">0:00</div>
              
              <div className="text-lg font-semibold mb-3">Exercises</div>
              
              {exercises.map((exercise, index) => (
                <motion.div 
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
                    exercise.isGroup && "bg-gray-50",
                    exercise.isCircuit && "bg-primary/5"
                  )}
                >
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <h3 className={cn(
                        "font-medium",
                        exercise.isGroup && "text-purple-600",
                        exercise.isCircuit && "text-primary",
                        exercise.name === "Superset" && "text-indigo-600",
                        exercise.name.includes("EMOM") && "text-green-600",
                        exercise.name.includes("AMRAP") && "text-amber-600",
                        exercise.name.includes("Tabata") && "text-rose-600",
                        exercise.name === "Finisher" && "text-orange-600",
                        exercise.name === "Cool down" && "text-blue-600"
                      )}>
                        {exercise.name}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {!exercise.isCircuit && exercise.sets.length > 0 && exercise.sets.length !== 1 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {exercise.sets.length} sets
                        {exercise.sets[0]?.reps && `, ${exercise.sets[0].reps} reps`}
                      </div>
                    )}
                    
                    {!exercise.isCircuit && exercise.sets[0]?.rest && program.settings?.showRest !== false && (
                      <div className="text-sm text-gray-500 mt-1">
                        {exercise.sets[0].rest}
                      </div>
                    )}
                    
                    {exercise.notes && program.settings?.showNotes !== false && (
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
                                  {subExercise.sets.length} x {subExercise.sets[0]?.reps || '-'}
                                  {subExercise.sets[0]?.weight && program.settings?.showWeight !== false && 
                                    ` @ ${subExercise.sets[0]?.weight}`}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    
                    {/* Display circuit exercises */}
                    {exercise.isCircuit && exercise.circuitId && (
                      <div className="mt-2">
                        {circuitMap.get(exercise.circuitId)?.map((circuitExercise, idx) => (
                          <div
                            key={circuitExercise.id}
                            className="pl-3 py-2 border-t border-gray-100"
                          >
                            <div className="flex items-center mb-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-2"></div>
                              <div className="text-sm font-medium">{circuitExercise.name}</div>
                            </div>
                            
                            {/* Show sets for circuit exercises */}
                            {circuitExercise.sets.length > 0 && (
                              <div className="ml-4 text-xs text-gray-500">
                                {circuitExercise.sets.map((set, setIdx) => (
                                  <div key={set.id} className="mb-1">
                                    <span className="font-medium">Set {setIdx + 1}:</span> {set.reps || '-'} reps
                                    {set.weight && program.settings?.showWeight !== false && ` @ ${set.weight}`}
                                    {set.rest && program.settings?.showRest !== false && `, rest ${set.rest}`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {(!exercise.isCircuit && !exercise.isGroup && exercise.sets.length > 0 && exercise.sets.length !== 1) && (
                    <div className="grid grid-cols-4 text-sm border-t border-gray-200">
                      <div className="p-2 font-medium text-center border-r border-gray-200">Set</div>
                      {program.settings?.showEffort !== false && (
                        <div className="p-2 font-medium text-center border-r border-gray-200">
                          {program.settings?.effortUnit === "rir" ? "RIR" : "RPE"}
                        </div>
                      )}
                      {program.settings?.showWeight !== false ? (
                        <div className="p-2 font-medium text-center border-r border-gray-200">
                          {exercise.sets[0]?.weight ? `${program.settings?.weightUnit === "kgs" ? "kg" : "lbs"}` : "—"}
                        </div>
                      ) : (
                        <div className="p-2 font-medium text-center border-r border-gray-200">
                          —
                        </div>
                      )}
                      <div className="p-2 font-medium text-center">Reps</div>
                      
                      {Array.from({ length: exercise.sets.length }).map((_, idx) => (
                        <React.Fragment key={idx}>
                          <div className="p-2 text-center border-t border-r border-gray-200">{idx + 1}</div>
                          
                          {program.settings?.showEffort !== false ? (
                            <div className="p-2 text-center border-t border-r border-gray-200">
                              {exercise.sets[idx]?.rpe || "—"}
                            </div>
                          ) : (
                            <div className="p-2 text-center border-t border-r border-gray-200">
                              —
                            </div>
                          )}
                          
                          {program.settings?.showWeight !== false ? (
                            <div className="p-2 text-center border-t border-r border-gray-200">
                              {exercise.sets[idx]?.weight ? (
                                Array.isArray(exercise.sets[idx]?.weight.split(',')) && exercise.sets[idx]?.weight.split(',')[idx]
                                  ? exercise.sets[idx]?.weight.split(',')[idx].trim()
                                  : exercise.sets[idx]?.weight
                              ) : "—"}
                            </div>
                          ) : (
                            <div className="p-2 text-center border-t border-r border-gray-200">
                              —
                            </div>
                          )}
                          
                          <div className="p-2 text-center border-t border-gray-200">
                            {exercise.sets[idx]?.reps ? (
                              Array.isArray(exercise.sets[idx]?.reps.split(',')) && exercise.sets[idx]?.reps.split(',')[idx]
                                ? exercise.sets[idx]?.reps.split(',')[idx].trim()
                                : exercise.sets[idx]?.reps
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
      )}
      
      {activeTab === "settings" && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Settings Content</h2>
          <p>Settings will be displayed here.</p>
        </div>
      )}
      
      {activeTab === "appearance" && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Appearance Content</h2>
          <p>Appearance options will be displayed here.</p>
        </div>
      )}
      
      {activeTab === "guide" && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Guide Content</h2>
          <p>Guide information will be displayed here.</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutMobilePreview;
