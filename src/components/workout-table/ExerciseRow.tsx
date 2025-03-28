
import React from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { Exercise, RepType, IntensityType, WeightType } from "@/types/workout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import EditableCell from "../EditableCell";
import { CellCoordinate } from "@/hooks/useCellNavigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import RepTypeSelector from "../RepTypeSelector";
import IntensityTypeSelector from "../IntensityTypeSelector";
import WeightTypeSelector from "../WeightTypeSelector";

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
  handleRepTypeChange: (exerciseId: string, repType: RepType) => void;
  handleIntensityTypeChange: (exerciseId: string, intensityType: IntensityType) => void;
  handleWeightTypeChange: (exerciseId: string, weightType: WeightType) => void;
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
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: exerciseIndex * 0.03 }}
      className="group exercise-row"
    >
      <td className="border border-muted-foreground/20 p-2 text-center text-muted-foreground text-sm">
        {exerciseIndex + 1}
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <div className="flex items-center gap-2">
          <EditableCell
            value={exercise.name}
            onChange={(value) => handleExerciseCellChange(exercise.id, "name", value)}
            placeholder="Exercise name"
            className={cn(
              exercise.name === "Finisher" && "font-medium text-orange-600",
              exercise.name === "Cool down" && "font-medium text-blue-600"
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
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-muted w-full justify-start"
            >
              <RepTypeSelector
                value={repType}
                onChange={(type) => handleRepTypeChange(exercise.id, type)}
                variant="minimal"
              />
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 z-50" align="start" side="bottom">
            <div className="p-0 max-h-[350px] overflow-y-auto">
              <RepTypeSelector
                value={repType}
                onChange={(type) => handleRepTypeChange(exercise.id, type)}
                onClose={() => {}}
              />
            </div>
          </PopoverContent>
        </Popover>
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-muted w-full justify-start"
            >
              <WeightTypeSelector
                value={weightType}
                onChange={(type) => handleWeightTypeChange(exercise.id, type)}
                variant="minimal"
              />
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 z-50" align="start" side="bottom">
            <div className="p-0 max-h-[300px] overflow-y-auto">
              <WeightTypeSelector
                value={weightType}
                onChange={(type) => handleWeightTypeChange(exercise.id, type)}
                onClose={() => {}}
              />
            </div>
          </PopoverContent>
        </Popover>
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-muted w-full justify-start"
            >
              <IntensityTypeSelector
                value={intensityType}
                onChange={(type) => handleIntensityTypeChange(exercise.id, type)}
                variant="minimal"
              />
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 z-50" align="start" side="bottom">
            <div className="p-0 max-h-[300px] overflow-y-auto">
              <IntensityTypeSelector
                value={intensityType}
                onChange={(type) => handleIntensityTypeChange(exercise.id, type)}
                onClose={() => {}}
              />
            </div>
          </PopoverContent>
        </Popover>
      </td>
      
      <td className="border border-muted-foreground/20 p-2"></td>
      
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

export default ExerciseRow;
