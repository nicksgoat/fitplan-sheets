
import React from 'react';
import { Exercise, Set } from "@/types/workout";
import { formatRestTime } from "@/utils/workoutPreviewUtils";
import { Clock } from "lucide-react";

interface CircuitExerciseListProps {
  circuitId: string;
  circuitExercises: Exercise[];
}

const CircuitExerciseList: React.FC<CircuitExerciseListProps> = ({ circuitId, circuitExercises }) => {
  if (!circuitExercises || circuitExercises.length === 0) return null;
  
  return (
    <div className="mt-2">
      {circuitExercises.map((circuitExercise) => (
        <div
          key={circuitExercise.id}
          className="pl-3 py-2 border-t border-gray-100"
        >
          <div className="flex items-center mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-2 flex-shrink-0"></div>
            <div className="text-sm font-medium truncate">{circuitExercise.name}</div>
          </div>
          
          {circuitExercise.sets.length > 0 && (
            <div className="ml-4 text-xs text-gray-500">
              {circuitExercise.sets.map((set, setIdx) => (
                <div key={set.id || setIdx} className="mb-1">
                  <span className="font-medium">Set {setIdx + 1}:</span> {set.reps || '-'} reps
                  {set.weight && ` @ ${set.weight}`}
                  {set.rest && (
                    <span className="text-blue-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Rest: {formatRestTime(set.rest)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CircuitExerciseList;
