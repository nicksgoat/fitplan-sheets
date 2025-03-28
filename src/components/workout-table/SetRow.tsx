
import React from "react";
import { Minus } from "lucide-react";
import { Set, Exercise } from "@/types/workout";
import { motion } from "framer-motion";
import EditableSetCell from "../EditableSetCell";
import { CellCoordinate } from "@/hooks/useCellNavigation";
import { IntensityType, WeightType, RepType } from "@/types/workout";

interface SetRowProps {
  exercise: Exercise;
  set: Set;
  setIndex: number;
  exerciseIndex: number;
  exerciseName: string;
  handleSetCellChange: (exerciseId: string, setId: string, field: keyof Set, value: string) => void;
  isCellFocused: (rowIndex: number, columnName: string, exerciseId: string, setIndex?: number) => boolean;
  handleCellFocus: (coordinate: CellCoordinate) => void;
  handleSetCellNavigate: (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => void;
  handleSetIntensityTypeChange: (exerciseId: string, setId: string, intensityType: IntensityType) => void;
  handleSetWeightTypeChange: (exerciseId: string, setId: string, weightType: WeightType) => void;
  handleRepTypeChange: (exerciseId: string, repType: RepType) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  sessionId: string;
}

const SetRow: React.FC<SetRowProps> = ({
  exercise,
  set,
  setIndex,
  exerciseIndex,
  exerciseName,
  handleSetCellChange,
  isCellFocused,
  handleCellFocus,
  handleSetCellNavigate,
  handleSetIntensityTypeChange,
  handleSetWeightTypeChange,
  handleRepTypeChange,
  deleteSet,
  sessionId,
}) => {
  const repType = exercise.repType || 'fixed';
  const setIntensityType = set.intensityType || exercise.intensityType || 'rpe';
  const setWeightType = set.weightType || exercise.weightType || 'pounds';
  
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, delay: 0.05 + setIndex * 0.02 }}
      className="set-row group"
    >
      <td className="border border-muted-foreground/20 p-2"></td>
      <td className="border border-muted-foreground/20 p-2 set-number">Set {setIndex + 1}</td>
      <td className="border border-muted-foreground/20 p-2"></td>
      
      <td className="border border-muted-foreground/20 p-2">
        <EditableSetCell
          value={set.reps}
          onChange={(value) => handleSetCellChange(exercise.id, set.id, "reps", value)}
          placeholder="Reps"
          coordinate={{ 
            rowIndex: exerciseIndex, 
            columnName: "reps", 
            exerciseId: exercise.id,
            setIndex: setIndex
          }}
          columnName="reps"
          repType={repType}
          onRepTypeChange={(type) => handleRepTypeChange(exercise.id, type)}
          isFocused={isCellFocused(exerciseIndex, "reps", exercise.id, setIndex)}
          onFocus={handleCellFocus}
          onNavigate={(direction, shiftKey) => 
            handleSetCellNavigate(direction, shiftKey, { 
              rowIndex: exerciseIndex, 
              columnName: "reps", 
              exerciseId: exercise.id,
              setIndex: setIndex
            })
          }
          hideRepTypeSelector={true}
        />
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <EditableSetCell
          value={set.weight}
          onChange={(value) => handleSetCellChange(exercise.id, set.id, "weight", value)}
          placeholder="Weight"
          coordinate={{ 
            rowIndex: exerciseIndex, 
            columnName: "weight", 
            exerciseId: exercise.id,
            setIndex: setIndex
          }}
          columnName="weight"
          weightType={setWeightType}
          onWeightTypeChange={(type) => handleSetWeightTypeChange(exercise.id, set.id, type)}
          isFocused={isCellFocused(exerciseIndex, "weight", exercise.id, setIndex)}
          onFocus={handleCellFocus}
          onNavigate={(direction, shiftKey) => 
            handleSetCellNavigate(direction, shiftKey, { 
              rowIndex: exerciseIndex, 
              columnName: "weight", 
              exerciseId: exercise.id,
              setIndex: setIndex
            })
          }
          hideWeightTypeSelector={true}
          exerciseName={exerciseName}
        />
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <EditableSetCell
          value={set.intensity}
          onChange={(value) => handleSetCellChange(exercise.id, set.id, "intensity", value)}
          placeholder="Intensity"
          coordinate={{ 
            rowIndex: exerciseIndex, 
            columnName: "intensity", 
            exerciseId: exercise.id,
            setIndex: setIndex
          }}
          columnName="intensity"
          intensityType={setIntensityType}
          onIntensityTypeChange={(type) => handleSetIntensityTypeChange(exercise.id, set.id, type)}
          isFocused={isCellFocused(exerciseIndex, "intensity", exercise.id, setIndex)}
          onFocus={handleCellFocus}
          onNavigate={(direction, shiftKey) => 
            handleSetCellNavigate(direction, shiftKey, { 
              rowIndex: exerciseIndex, 
              columnName: "intensity", 
              exerciseId: exercise.id,
              setIndex: setIndex
            })
          }
          hideIntensityTypeSelector={true}
        />
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <EditableSetCell
          value={set.rest}
          onChange={(value) => handleSetCellChange(exercise.id, set.id, "rest", value)}
          placeholder="Rest"
          coordinate={{ 
            rowIndex: exerciseIndex, 
            columnName: "rest", 
            exerciseId: exercise.id,
            setIndex: setIndex
          }}
          isFocused={isCellFocused(exerciseIndex, "rest", exercise.id, setIndex)}
          onFocus={handleCellFocus}
          onNavigate={(direction, shiftKey) => 
            handleSetCellNavigate(direction, shiftKey, { 
              rowIndex: exerciseIndex, 
              columnName: "rest", 
              exerciseId: exercise.id,
              setIndex: setIndex
            })
          }
        />
      </td>
      
      <td className="border border-muted-foreground/20 p-2"></td>
      
      <td className="border border-muted-foreground/20 p-2">
        {exercise.sets.length > 1 && (
          <button
            className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
            onClick={() => deleteSet(sessionId, exercise.id, set.id)}
            aria-label="Delete set"
          >
            <Minus className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </td>
    </motion.tr>
  );
};

export default SetRow;
