
import React from 'react';
import { Exercise, Set } from "@/types/workout";
import { formatRestTime } from "@/utils/workoutPreviewUtils";
import { Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface ExerciseSetTableProps {
  exercise: Exercise;
}

const ExerciseSetTable: React.FC<ExerciseSetTableProps> = ({ exercise }) => {
  if (!exercise.sets || exercise.sets.length === 0) return null;
  
  // Get the intensity type from the exercise, which will be used for all sets
  const intensityType = exercise.intensityType || 'rpe';
  
  // Function to get appropriate color based on intensity type
  const getIntensityColor = (type: string) => {
    switch (type) {
      case 'rpe':
        return 'text-amber-400';
      case 'arpe':
        return 'text-orange-400';
      case 'percent':
        return 'text-blue-400';
      case 'absolute':
        return 'text-green-400';
      case 'velocity':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };
  
  // Get the weight type from the exercise
  const weightType = exercise.weightType || 'pounds';
  
  // Function to get appropriate color based on weight type
  const getWeightColor = (type: string) => {
    switch (type) {
      case 'pounds':
        return 'text-blue-400';
      case 'kilos':
        return 'text-green-400';
      case 'distance-m':
      case 'distance-ft':
      case 'distance-yd':
      case 'distance-mi':
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  };
  
  const intensityColor = getIntensityColor(intensityType);
  const weightColor = getWeightColor(weightType);
  
  return (
    <div>
      <div className="overflow-x-auto max-w-full">
        <Table className="border-t border-dark-border text-sm w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-dark-border">
              <TableHead className="h-8 w-10 font-medium text-center text-xs p-1 text-gray-400">Set</TableHead>
              <TableHead className="h-8 w-[25%] font-medium text-center text-xs p-1 text-gray-400">Target</TableHead>
              <TableHead className="h-8 w-[25%] font-medium text-center text-xs p-1 text-gray-400">
                {exercise.sets[0]?.weight ? "Weight" : "—"}
              </TableHead>
              <TableHead className="h-8 w-[25%] font-medium text-center text-xs p-1 text-gray-400">Reps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercise.sets.map((set, idx) => (
              <TableRow key={idx} className="hover:bg-dark-400 border-dark-border">
                <TableCell className="h-8 py-1 px-1 text-center font-medium text-amber-400">{idx + 1}</TableCell>
                <TableCell className={`h-8 py-1 px-1 text-center truncate ${intensityColor}`}>
                  {set.intensity || "—"}
                </TableCell>
                <TableCell className={`h-8 py-1 px-1 text-center truncate ${weightColor}`}>
                  {set.weight ? (
                    Array.isArray(set.weight.split(',')) && set.weight.split(',')[idx]
                      ? set.weight.split(',')[idx].trim()
                      : set.weight
                  ) : "—"}
                </TableCell>
                <TableCell className="h-8 py-1 px-1 text-center truncate text-white">
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
      </div>
      
      {exercise.sets.some(set => set.rest) && (
        <div className="px-3 pb-3 pt-1">
          <div className="text-xs text-gray-400 mt-1">
            <span className="font-medium">Rest times:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
              {exercise.sets.map((set, idx) => (
                set.rest ? (
                  <div key={idx} className="flex items-center gap-1 text-blue-400">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Set {idx + 1}: {formatRestTime(set.rest)}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseSetTable;
