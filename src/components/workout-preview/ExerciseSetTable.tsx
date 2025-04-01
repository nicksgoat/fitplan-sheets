
import React from 'react';
import { Exercise, Set } from "@/types/workout";
import { formatRestTime } from "@/utils/workoutPreviewUtils";
import { Clock, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";

interface ExerciseSetTableProps {
  exercise: Exercise;
}

const ExerciseSetTable: React.FC<ExerciseSetTableProps> = ({ exercise }) => {
  const { addSet, updateWorkout } = useWorkout();
  
  if (!exercise.sets || exercise.sets.length === 0) return null;

  const handleDuplicateSet = (exerciseId: string, setIndex: number) => {
    if (!exercise.sets) return;
    
    // Find the workout that contains this exercise
    updateWorkout(exercise.id, (draft) => {
      const setToDuplicate = exercise.sets[setIndex];
      const newSet: Set = {
        id: Math.random().toString(36).substring(2, 9), // Simple ID generation
        reps: setToDuplicate.reps || "",
        weight: setToDuplicate.weight || "",
        intensity: setToDuplicate.intensity || "",
        intensityType: setToDuplicate.intensityType,
        weightType: setToDuplicate.weightType,
        repType: setToDuplicate.repType,
        rest: setToDuplicate.rest || "",
      };
      
      // Insert the new set after the current one
      draft.sets.splice(setIndex + 1, 0, newSet);
    });
  };
  
  return (
    <>
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
              <TableHead className="h-8 w-10 font-medium text-center text-xs p-1 text-gray-400"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercise.sets.map((set, idx) => (
              <TableRow key={idx} className="hover:bg-dark-400 border-dark-border">
                <TableCell className="h-8 py-1 px-1 text-center font-medium text-amber-400">{idx + 1}</TableCell>
                <TableCell className="h-8 py-1 px-1 text-center text-gray-400 truncate">
                  {set.intensity || "—"}
                </TableCell>
                <TableCell className="h-8 py-1 px-1 text-center text-blue-400 truncate">
                  {set.weight || "—"}
                </TableCell>
                <TableCell className="h-8 py-1 px-1 text-center truncate text-white">
                  {set.reps || "—"}
                </TableCell>
                <TableCell className="h-8 py-1 px-1 text-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700"
                    onClick={() => handleDuplicateSet(exercise.id, idx)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
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
    </>
  );
};

export default ExerciseSetTable;
