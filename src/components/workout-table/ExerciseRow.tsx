
import React from "react";
import { Plus, Trash, Dumbbell } from "lucide-react";
import { Exercise } from "@/types/workout";
import EditableCell from "@/components/EditableCell";
import { CellCoordinate } from "@/hooks/useCellNavigation";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditableSetCell from "../EditableSetCell";

interface ExerciseRowProps {
  exercise: Exercise;
  exerciseIndex: number;
  handleExerciseCellChange: (exerciseId: string, field: keyof Exercise, value: string) => void;
  isCellFocused: (rowIndex: number, columnName: string, exerciseId: string, setIndex?: number) => boolean;
  handleCellFocus: (coordinate: CellCoordinate) => void;
  handleExerciseCellNavigate: (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => void;
  handleRepTypeChange: (exerciseId: string, repType: Exercise['repType']) => void;
  handleIntensityTypeChange: (exerciseId: string, intensityType: Exercise['intensityType']) => void;
  handleWeightTypeChange: (exerciseId: string, weightType: Exercise['weightType']) => void;
  addSet: (sessionId: string, exerciseId: string) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  sessionId: string;
}

const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  exerciseIndex,
  handleExerciseCellChange,
  isCellFocused,
  handleCellFocus,
  handleExerciseCellNavigate,
  handleRepTypeChange,
  handleIntensityTypeChange,
  handleWeightTypeChange,
  addSet,
  deleteExercise,
  sessionId,
}) => {
  const repType = exercise.repType || 'fixed';
  const intensityType = exercise.intensityType || 'rpe';
  const weightType = exercise.weightType || 'pounds';
  
  return (
    <tr className="exercise-row">
      <td className="border border-muted-foreground/20 p-2 text-center">
        <div className="flex items-center justify-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                  onClick={() => addSet(sessionId, exercise.id)}
                  aria-label="Add set"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add set</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
                  onClick={() => deleteExercise(sessionId, exercise.id)}
                  aria-label="Delete exercise"
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete exercise</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
      
      <td className="border border-muted-foreground/20 p-0" colSpan={2}>
        <EditableCell
          value={exercise.name}
          onChange={(value) => handleExerciseCellChange(exercise.id, "name", value)}
          placeholder="Exercise name"
          className="font-medium"
          coordinate={{ 
            rowIndex: exerciseIndex, 
            columnName: "name", 
            exerciseId: exercise.id 
          }}
          isFocused={isCellFocused(exerciseIndex, "name", exercise.id)}
          onFocus={handleCellFocus}
          onNavigate={(direction, shiftKey) => 
            handleExerciseCellNavigate(direction, shiftKey, { 
              rowIndex: exerciseIndex, 
              columnName: "name", 
              exerciseId: exercise.id 
            })
          }
        />
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Reps</span>
          
          <select
            value={repType}
            onChange={(e) => handleRepTypeChange(exercise.id, e.target.value as Exercise['repType'])}
            className="text-xs bg-transparent border p-0.5 rounded"
          >
            <option value="fixed">Fixed</option>
            <option value="range">Range</option>
            <option value="descending">Desc.</option>
            <option value="time">Time</option>
            <option value="each-side">E/Side</option>
            <option value="amrap">AMRAP</option>
          </select>
        </div>
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Weight</span>
          
          <div className="flex items-center">
            <EditableSetCell
              value={exercise.maxWeight || ""}
              onChange={(value) => handleExerciseCellChange(exercise.id, "maxWeight", value)}
              placeholder="Max"
              coordinate={{ 
                rowIndex: exerciseIndex, 
                columnName: "max", 
                exerciseId: exercise.id 
              }}
              columnName="max"
              weightType={weightType}
              onWeightTypeChange={(type) => handleWeightTypeChange(exercise.id, type)}
              isFocused={isCellFocused(exerciseIndex, "max", exercise.id)}
              onFocus={handleCellFocus}
              onNavigate={(direction, shiftKey) => 
                handleExerciseCellNavigate(direction, shiftKey, { 
                  rowIndex: exerciseIndex, 
                  columnName: "max", 
                  exerciseId: exercise.id 
                })
              }
              hideWeightTypeSelector={true}
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1 ml-1 rounded-full hover:bg-primary/20 transition-colors text-primary"
                    aria-label="Set max weight"
                  >
                    <Dumbbell className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Max weight ({weightType})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <select
              value={weightType}
              onChange={(e) => handleWeightTypeChange(exercise.id, e.target.value as Exercise['weightType'])}
              className="text-xs bg-transparent border p-0.5 rounded ml-1"
            >
              <option value="pounds">lbs</option>
              <option value="kilos">kg</option>
              <option value="distance-m">m</option>
              <option value="distance-ft">ft</option>
              <option value="distance-yd">yd</option>
              <option value="distance-mi">mi</option>
            </select>
          </div>
        </div>
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Intensity</span>
          
          <select
            value={intensityType}
            onChange={(e) => handleIntensityTypeChange(exercise.id, e.target.value as Exercise['intensityType'])}
            className="text-xs bg-transparent border p-0.5 rounded"
          >
            <option value="rpe">RPE</option>
            <option value="arpe">ARPE</option>
            <option value="percent">%</option>
            <option value="absolute">Abs.</option>
            <option value="velocity">m/s</option>
          </select>
        </div>
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <span className="text-sm font-medium">Rest</span>
      </td>
      
      <td className="border border-muted-foreground/20 p-0" colSpan={2}>
        <EditableCell
          value={exercise.notes}
          onChange={(value) => handleExerciseCellChange(exercise.id, "notes", value)}
          placeholder="Notes"
          className="text-sm"
          coordinate={{ 
            rowIndex: exerciseIndex, 
            columnName: "notes", 
            exerciseId: exercise.id 
          }}
          isFocused={isCellFocused(exerciseIndex, "notes", exercise.id)}
          onFocus={handleCellFocus}
          onNavigate={(direction, shiftKey) => 
            handleExerciseCellNavigate(direction, shiftKey, { 
              rowIndex: exerciseIndex, 
              columnName: "notes", 
              exerciseId: exercise.id 
            })
          }
        />
      </td>
    </tr>
  );
};

export default ExerciseRow;
