
import React from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { Exercise, IntensityType, WeightType, RepType, Set } from "@/types/workout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import EditableCell from "../EditableCell";
import { CellCoordinate } from "@/hooks/useCellNavigation";
import EditableSetCell from "../EditableSetCell";
import { TableCell } from "../ui/table";

interface CircuitExerciseRowProps {
  exercise: Exercise;
  exerciseIndex: number;
  isCellFocused: (rowIndex: number, columnName: string, exerciseId: string, setIndex?: number) => boolean;
  handleCellFocus: (coordinate: CellCoordinate) => void;
  handleExerciseCellNavigate: (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => void;
  handleExerciseCellChange: (exerciseId: string, field: keyof Exercise, value: string) => void;
  circuit?: {
    name?: string;
  };
  sessionId: string;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  addSet: (sessionId: string, exerciseId: string) => void;
  handleSetCellNavigate: (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => void;
  handleSetCellChange: (exerciseId: string, setId: string, field: keyof Set, value: string) => void;
  handleSetIntensityTypeChange: (exerciseId: string, setId: string, intensityType: IntensityType) => void;
  handleSetWeightTypeChange: (exerciseId: string, setId: string, weightType: WeightType) => void;
  handleRepTypeChange: (exerciseId: string, repType: RepType) => void;
  handleAddExerciseToCircuit: (circuitId: string) => void;
}

const CircuitExerciseRow: React.FC<CircuitExerciseRowProps> = ({
  exercise,
  exerciseIndex,
  isCellFocused,
  handleCellFocus,
  handleExerciseCellNavigate,
  handleExerciseCellChange,
  circuit,
  sessionId,
  deleteExercise,
  addSet,
  handleSetCellNavigate,
  handleSetCellChange,
  handleSetIntensityTypeChange,
  handleSetWeightTypeChange,
  handleRepTypeChange,
  handleAddExerciseToCircuit
}) => {
  const repType = exercise.repType || 'fixed';
  
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: exerciseIndex * 0.03 }}
      className="group exercise-row bg-secondary/30"
    >
      <td className="border border-muted-foreground/20 p-2 text-center text-muted-foreground text-sm">
        <div className="flex justify-center items-center">
          <ChevronRight className="h-3 w-3" />
        </div>
      </td>
      
      <td className="border border-muted-foreground/20 p-2 pl-4">
        <div className="flex items-center gap-2">
          <EditableCell
            value={exercise.name}
            onChange={(value) => handleExerciseCellChange(exercise.id, "name", value)}
            placeholder="Exercise name"
            className={cn(
              circuit?.name === "Superset" && "font-medium text-indigo-600",
              circuit?.name?.includes("EMOM") && "font-medium text-green-600",
              circuit?.name?.includes("AMRAP") && "font-medium text-amber-600",
              circuit?.name?.includes("Tabata") && "font-medium text-rose-600"
            )}
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
        </div>
      </td>
      
      <td className="border border-muted-foreground/20 p-2 text-center">
        {exercise.sets.length}
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        {exercise.sets.length > 0 && exercise.sets.map((set, setIdx) => (
          <div key={set.id} className="mb-1 text-xs">
            <EditableSetCell
              value={set.reps}
              onChange={(value) => handleSetCellChange(exercise.id, set.id, "reps", value)}
              placeholder="Reps"
              coordinate={{ 
                rowIndex: exerciseIndex, 
                columnName: "reps", 
                exerciseId: exercise.id,
                setIndex: setIdx
              }}
              columnName="reps"
              repType={repType}
              onRepTypeChange={(type) => handleRepTypeChange(exercise.id, type)}
              isFocused={isCellFocused(exerciseIndex, "reps", exercise.id, setIdx)}
              onFocus={handleCellFocus}
              onNavigate={(direction, shiftKey) => 
                handleSetCellNavigate(direction, shiftKey, { 
                  rowIndex: exerciseIndex, 
                  columnName: "reps", 
                  exerciseId: exercise.id,
                  setIndex: setIdx
                })
              }
              hideRepTypeSelector={true}
            />
          </div>
        ))}
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        {exercise.sets.length > 0 && exercise.sets.map((set, setIdx) => {
          const setWeightType = set.weightType || exercise.weightType || 'pounds';
          return (
            <div key={set.id} className="mb-1 text-xs">
              <EditableSetCell
                value={set.weight}
                onChange={(value) => handleSetCellChange(exercise.id, set.id, "weight", value)}
                placeholder="Weight"
                coordinate={{ 
                  rowIndex: exerciseIndex, 
                  columnName: "weight", 
                  exerciseId: exercise.id,
                  setIndex: setIdx
                }}
                columnName="weight"
                weightType={setWeightType}
                onWeightTypeChange={(type) => handleSetWeightTypeChange(exercise.id, set.id, type)}
                isFocused={isCellFocused(exerciseIndex, "weight", exercise.id, setIdx)}
                onFocus={handleCellFocus}
                onNavigate={(direction, shiftKey) => 
                  handleSetCellNavigate(direction, shiftKey, { 
                    rowIndex: exerciseIndex, 
                    columnName: "weight", 
                    exerciseId: exercise.id,
                    setIndex: setIdx
                  })
                }
                hideWeightTypeSelector={true}
              />
            </div>
          );
        })}
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        {exercise.sets.length > 0 && exercise.sets.map((set, setIdx) => {
          const setIntensityType = set.intensityType || exercise.intensityType || 'rpe';
          return (
            <div key={set.id} className="mb-1 text-xs">
              <EditableSetCell
                value={set.intensity}
                onChange={(value) => handleSetCellChange(exercise.id, set.id, "intensity", value)}
                placeholder="Intensity"
                coordinate={{ 
                  rowIndex: exerciseIndex, 
                  columnName: "intensity", 
                  exerciseId: exercise.id,
                  setIndex: setIdx
                }}
                columnName="intensity"
                intensityType={setIntensityType}
                onIntensityTypeChange={(type) => handleSetIntensityTypeChange(exercise.id, set.id, type)}
                isFocused={isCellFocused(exerciseIndex, "intensity", exercise.id, setIdx)}
                onFocus={handleCellFocus}
                onNavigate={(direction, shiftKey) => 
                  handleSetCellNavigate(direction, shiftKey, { 
                    rowIndex: exerciseIndex, 
                    columnName: "intensity", 
                    exerciseId: exercise.id,
                    setIndex: setIdx
                  })
                }
                hideIntensityTypeSelector={true}
              />
            </div>
          );
        })}
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        {exercise.sets.length > 0 && exercise.sets.map((set, setIdx) => (
          <div key={set.id} className="mb-1 text-xs">
            <EditableSetCell
              value={set.rest}
              onChange={(value) => handleSetCellChange(exercise.id, set.id, "rest", value)}
              placeholder="Rest"
              coordinate={{ 
                rowIndex: exerciseIndex, 
                columnName: "rest", 
                exerciseId: exercise.id,
                setIndex: setIdx
              }}
              isFocused={isCellFocused(exerciseIndex, "rest", exercise.id, setIdx)}
              onFocus={handleCellFocus}
              onNavigate={(direction, shiftKey) => 
                handleSetCellNavigate(direction, shiftKey, { 
                  rowIndex: exerciseIndex, 
                  columnName: "rest", 
                  exerciseId: exercise.id,
                  setIndex: setIdx
                })
              }
            />
          </div>
        ))}
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <EditableCell
          value={exercise.notes}
          onChange={(value) => handleExerciseCellChange(exercise.id, "notes", value)}
          placeholder="Add notes..."
          coordinate={{ rowIndex: exerciseIndex, columnName: "notes", exerciseId: exercise.id }}
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
      
      <td className="border border-muted-foreground/20 p-2">
        <div className="flex justify-end space-x-2">
          <button
            className="p-1 rounded-full hover:bg-secondary transition-colors"
            onClick={() => addSet(sessionId, exercise.id)}
            aria-label="Add set"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            onClick={() => deleteExercise(sessionId, exercise.id)}
            aria-label="Delete exercise"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default CircuitExerciseRow;
