
import React from "react";
import { ChevronRight, Plus, Trash2, RotateCcw } from "lucide-react";
import { Circuit, Exercise } from "@/types/workout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import EditableCell from "../EditableCell";
import { CellCoordinate } from "@/hooks/useCellNavigation";
import { Button } from "@/components/ui/button";

interface CircuitRowProps {
  exercise: Exercise;
  exerciseIndex: number;
  circuit?: Circuit;
  handleExerciseCellChange: (exerciseId: string, field: keyof Exercise, value: string) => void;
  isCellFocused: (rowIndex: number, columnName: string, exerciseId: string, setIndex?: number) => boolean;
  handleCellFocus: (coordinate: CellCoordinate) => void;
  handleExerciseCellNavigate: (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => void;
  handleAddExerciseToCircuit: (circuitId: string) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  sessionId: string;
}

const CircuitRow: React.FC<CircuitRowProps> = ({
  exercise,
  exerciseIndex,
  circuit,
  handleExerciseCellChange,
  isCellFocused,
  handleCellFocus,
  handleExerciseCellNavigate,
  handleAddExerciseToCircuit,
  deleteExercise,
  sessionId,
}) => {
  const isCircuit = exercise.isCircuit;
  
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: exerciseIndex * 0.03 }}
      className={cn(
        "group exercise-row",
        isCircuit && "bg-primary/5"
      )}
    >
      <td className="border border-muted-foreground/20 p-2 text-center text-muted-foreground text-sm">
        {exerciseIndex + 1}
      </td>
      
      <td className="border border-muted-foreground/20 p-2" colSpan={5}>
        <div className="flex items-center gap-2">
          {isCircuit && (
            <RotateCcw className="h-3.5 w-3.5 text-primary mr-1" />
          )}
          <EditableCell
            value={exercise.name}
            onChange={(value) => handleExerciseCellChange(exercise.id, "name", value)}
            placeholder="Exercise name"
            className={isCircuit && "font-medium text-primary"}
            coordinate={{ rowIndex: exerciseIndex, columnName: "name", exerciseId: exercise.id }}
            isFocused={isCellFocused(exerciseIndex, "name", exercise.id)}
            onFocus={handleCellFocus}
            onNavigate={(direction, shiftKey) => 
              handleExerciseCellNavigate(direction, shiftKey, { 
                rowIndex: exerciseIndex, 
                columnName: "name", 
                exerciseId: exercise.id 
              })
            }
            isExerciseName={true}
          />
          
          {isCircuit && circuit && (
            <div className="ml-2 text-xs text-muted-foreground">
              {circuit.rounds === "AMRAP" 
                ? "AMRAP" 
                : `${circuit.rounds} rounds`}
            </div>
          )}
        </div>
      </td>
      
      <td colSpan={4} className="border border-muted-foreground/20 p-2">
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-400 p-0 h-auto hover:bg-transparent hover:text-blue-300"
            onClick={() => {
              if (exercise.id) {
                handleAddExerciseToCircuit(exercise.id);
              }
            }}
            aria-label="Add exercise to circuit"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Exercise
          </Button>
          <button
            className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            onClick={() => {
              if (exercise.id) {
                handleAddExerciseToCircuit(exercise.id);
              }
            }}
            aria-label="Add exercise to circuit"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            onClick={() => deleteExercise(sessionId, exercise.id)}
            aria-label="Delete circuit"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default CircuitRow;
