
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  
  const handleIntensityTypeSelect = (value: string) => {
    console.log("Exercise row intensity type changed to:", value);
    handleIntensityTypeChange(exercise.id, value as IntensityType);
  };

  const handleWeightTypeSelect = (value: string) => {
    console.log("Exercise row weight type changed to:", value);
    handleWeightTypeChange(exercise.id, value as WeightType);
  };
  
  const handleRepTypeSelect = (value: string) => {
    console.log("Exercise row rep type changed to:", value);
    handleRepTypeChange(exercise.id, value as RepType);
  };
  
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
        <Select value={repType} onValueChange={handleRepTypeSelect}>
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue>
              <RepTypeSelector
                value={repType}
                onChange={() => {}}
                variant="minimal"
              />
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[350px] z-50 bg-popover">
            <RepTypeSelector
              value={repType}
              onChange={handleRepTypeSelect}
              onClose={() => {}}
            />
          </SelectContent>
        </Select>
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <Select value={weightType} onValueChange={handleWeightTypeSelect}>
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue>
              <WeightTypeSelector
                value={weightType}
                onChange={() => {}}
                variant="minimal"
              />
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] z-50 bg-popover">
            <SelectItem value="pounds">
              <WeightTypeSelector 
                value="pounds" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="kilos">
              <WeightTypeSelector 
                value="kilos" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="distance-m">
              <WeightTypeSelector 
                value="distance-m" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="distance-ft">
              <WeightTypeSelector 
                value="distance-ft" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="distance-yd">
              <WeightTypeSelector 
                value="distance-yd" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="distance-mi">
              <WeightTypeSelector 
                value="distance-mi" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
          </SelectContent>
        </Select>
      </td>
      
      <td className="border border-muted-foreground/20 p-2">
        <Select value={intensityType} onValueChange={handleIntensityTypeSelect}>
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue>
              <IntensityTypeSelector
                value={intensityType}
                onChange={() => {}}
                variant="minimal"
              />
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] z-50 bg-popover">
            <SelectItem value="rpe">
              <IntensityTypeSelector 
                value="rpe" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="arpe">
              <IntensityTypeSelector 
                value="arpe" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="percent">
              <IntensityTypeSelector 
                value="percent" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="absolute">
              <IntensityTypeSelector 
                value="absolute" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
            <SelectItem value="velocity">
              <IntensityTypeSelector 
                value="velocity" 
                onChange={() => {}} 
                variant="minimal" 
              />
            </SelectItem>
          </SelectContent>
        </Select>
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
