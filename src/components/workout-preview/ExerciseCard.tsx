
import React from 'react';
import { Exercise } from "@/types/workout";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { getRepRange } from "@/utils/workoutPreviewUtils";
import ExerciseSetTable from "./ExerciseSetTable";
import GroupExerciseList from "./GroupExerciseList";
import CircuitExerciseList from "./CircuitExerciseList";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  allExercises: Exercise[];
  circuitMap: Map<string, Exercise[]>;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  allExercises,
  circuitMap
}) => {
  return (
    <motion.div 
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
          <div>
            <h3 className={cn(
              "font-medium truncate max-w-[200px]",
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
            {!exercise.isCircuit && !exercise.isGroup && (
              <div className="text-sm text-gray-500">
                {getRepRange(exercise)}
              </div>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
        
        {exercise.notes && (
          <div className="text-sm text-gray-600 mt-2 italic line-clamp-2">
            {exercise.notes}
          </div>
        )}
        
        {exercise.isGroup && (
          <GroupExerciseList 
            groupId={exercise.id} 
            exercises={allExercises} 
          />
        )}
        
        {exercise.isCircuit && exercise.circuitId && circuitMap.has(exercise.circuitId) && (
          <CircuitExerciseList 
            circuitId={exercise.circuitId} 
            circuitExercises={circuitMap.get(exercise.circuitId) || []} 
          />
        )}
      </div>
      
      {(!exercise.isCircuit && !exercise.isGroup && exercise.sets.length > 0) && (
        <ExerciseSetTable exercise={exercise} />
      )}
    </motion.div>
  );
};

export default ExerciseCard;
