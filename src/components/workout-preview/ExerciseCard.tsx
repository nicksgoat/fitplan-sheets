
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
  // Get the intensity type from the exercise
  const intensityType = exercise.intensityType || 'rpe';
  
  // Get the appropriate intensity label
  const getIntensityLabel = (type: string) => {
    switch (type) {
      case 'rpe':
        return 'RPE';
      case 'arpe':
        return 'aRPE';
      case 'percent':
        return '% of Max';
      case 'absolute':
        return 'Abs.';
      case 'velocity':
        return 'Vel.';
      default:
        return 'Int.';
    }
  };
  
  // Get the intensity badge color
  const getIntensityBadgeColor = (type: string) => {
    switch (type) {
      case 'rpe':
        return 'bg-amber-950/50 text-amber-400';
      case 'arpe':
        return 'bg-orange-950/50 text-orange-400';
      case 'percent':
        return 'bg-blue-950/50 text-blue-400';
      case 'absolute':
        return 'bg-green-950/50 text-green-400';
      case 'velocity':
        return 'bg-purple-950/50 text-purple-400';
      default:
        return 'bg-gray-950/50 text-gray-400';
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        "mb-4 rounded-lg overflow-hidden",
        exercise.isGroup && "bg-dark-200",
        exercise.isCircuit && "bg-dark-200",
        !exercise.isGroup && !exercise.isCircuit && "bg-dark-300 border border-dark-border"
      )}
    >
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-medium truncate max-w-[200px] text-white",
                exercise.isGroup && "text-purple-400",
                exercise.isCircuit && "text-blue-400",
                exercise.name === "Superset" && "text-indigo-400",
                exercise.name.includes("EMOM") && "text-green-400",
                exercise.name.includes("AMRAP") && "text-amber-400",
                exercise.name.includes("Tabata") && "text-rose-400",
                exercise.name === "Finisher" && "text-orange-400",
                exercise.name === "Cool down" && "text-blue-400"
              )}>
                {exercise.name}
              </h3>
              
              {!exercise.isCircuit && !exercise.isGroup && (
                <div className={`text-xs px-2 py-0.5 rounded-full ${getIntensityBadgeColor(intensityType)}`}>
                  {getIntensityLabel(intensityType)}
                </div>
              )}
            </div>
            {!exercise.isCircuit && !exercise.isGroup && (
              <div className="text-sm text-gray-400">
                {getRepRange(exercise)}
              </div>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
        </div>
        
        {exercise.notes && (
          <div className="text-sm text-gray-400 mt-2 italic line-clamp-2">
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
