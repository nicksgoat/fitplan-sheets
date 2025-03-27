
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface WorkoutMobilePreviewProps {
  sessionId: string;
}

const WorkoutMobilePreview: React.FC<WorkoutMobilePreviewProps> = ({ sessionId }) => {
  const { program } = useWorkout();
  const session = program.sessions.find((s) => s.id === sessionId);
  
  if (!session) return null;
  
  // Determine which week this session belongs to
  const weekNumber = session.weekId 
    ? program.weeks.find(w => w.id === session.weekId)?.order || session.day
    : session.day;
  
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
        <h2 className="text-lg font-semibold">Preview</h2>
      </div>
      
      <div className="relative w-full p-4 flex justify-center">
        <div className="w-[300px] h-[620px] border-[10px] border-[#1a1a1a] rounded-[40px] overflow-hidden shadow-xl bg-[#1a1a1a]">
          {/* Notch */}
          <div className="absolute top-[24px] left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-[#1a1a1a] rounded-b-xl z-10"></div>
          
          <div className="w-full h-full bg-white overflow-y-auto p-4">
            <div className="text-xl font-bold mb-1 flex items-center">
              <span className="text-amber-600">Day {weekNumber}</span>
              <span className="mx-1">·</span>
              <span>{session.name}</span>
            </div>
            <div className="text-sm text-gray-500 mb-6">0:00</div>
            
            <div className="text-lg font-semibold mb-3">Exercises</div>
            
            {exercises.map((exercise, index) => (
              <motion.div 
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "mb-4 bg-white rounded-lg overflow-hidden",
                  exercise.isGroup && "bg-gray-50",
                  exercise.isCircuit && "bg-primary/5",
                  !exercise.isGroup && !exercise.isCircuit && "border border-gray-200 shadow-sm"
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
                  
                  {!exercise.isCircuit && !exercise.isGroup && exercise.sets.length > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {exercise.sets.length} sets{exercise.sets[0]?.reps ? `, ${exercise.sets[0].reps} reps` : ''}
                    </div>
                  )}
                  
                  {!exercise.isCircuit && exercise.sets[0]?.rest && (
                    <div className="text-sm text-gray-500 mt-1">
                      {exercise.sets[0].rest}
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
                                {subExercise.sets.length} x {subExercise.sets[0]?.reps || '-'}
                                {subExercise.sets[0]?.weight && ` @ ${subExercise.sets[0]?.weight}`}
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
                                  {set.weight && ` @ ${set.weight}`}
                                  {set.rest && `, rest ${set.rest}`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Render sets as a table for non-circuit, non-group exercises with multiple sets */}
                {(!exercise.isCircuit && !exercise.isGroup && exercise.sets.length > 0) && (
                  <Table className="border-t border-gray-200 text-sm">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 w-14 font-medium text-center text-xs">Set</TableHead>
                        <TableHead className="h-8 w-[25%] font-medium text-center text-xs">Target</TableHead>
                        <TableHead className="h-8 w-[25%] font-medium text-center text-xs">
                          {exercise.sets[0]?.weight ? "Weight" : "—"}
                        </TableHead>
                        <TableHead className="h-8 w-[25%] font-medium text-center text-xs">Reps</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercise.sets.map((set, idx) => (
                        <TableRow key={idx} className="hover:bg-gray-50">
                          <TableCell className="h-8 py-1 px-2 text-center font-medium text-amber-600">{idx + 1}</TableCell>
                          <TableCell className="h-8 py-1 px-2 text-center text-gray-500">
                            {set.intensity || "—"}
                          </TableCell>
                          <TableCell className="h-8 py-1 px-2 text-center text-blue-600">
                            {set.weight ? (
                              Array.isArray(set.weight.split(',')) && set.weight.split(',')[idx]
                                ? set.weight.split(',')[idx].trim()
                                : set.weight
                            ) : "—"}
                          </TableCell>
                          <TableCell className="h-8 py-1 px-2 text-center">
                            {set.reps ? (
                              Array.isArray(set.reps.split(',')) && set.reps.split(',')[idx]
                                ? set.reps.split(',')[idx].trim()
                                : set.reps
                            ) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
