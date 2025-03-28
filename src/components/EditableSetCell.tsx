
import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CellCoordinate } from "@/hooks/useCellNavigation";
import { RepType, IntensityType, WeightType } from "@/types/workout";
import RepInput from "./RepInput";
import IntensityInput from "./IntensityInput";
import WeightInput from "./WeightInput";

interface EditableSetCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  type?: "text" | "number";
  coordinate: CellCoordinate;
  isFocused: boolean;
  onFocus: (coordinate: CellCoordinate) => void;
  onNavigate: (direction: "up" | "down" | "left" | "right", shiftKey: boolean) => void;
  columnName?: string;
  repType?: RepType;
  onRepTypeChange?: (type: RepType) => void;
  intensityType?: IntensityType;
  onIntensityTypeChange?: (type: IntensityType) => void;
  weightType?: WeightType;
  onWeightTypeChange?: (type: WeightType) => void;
  hideRepTypeSelector?: boolean;
  hideIntensityTypeSelector?: boolean;
  hideWeightTypeSelector?: boolean;
  exerciseName?: string;
}

const EditableSetCell: React.FC<EditableSetCellProps> = ({
  value,
  onChange,
  className,
  placeholder = "",
  type = "text",
  coordinate,
  isFocused,
  onFocus,
  onNavigate,
  columnName,
  repType = "fixed",
  onRepTypeChange,
  intensityType = "rpe",
  onIntensityTypeChange,
  weightType = "pounds",
  onWeightTypeChange,
  hideRepTypeSelector = false,
  hideIntensityTypeSelector = false,
  hideWeightTypeSelector = false,
  exerciseName = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isFocused]);
  
  const handleClick = () => {
    onFocus(coordinate);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Navigation with arrow keys
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onNavigate("up", e.shiftKey);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onNavigate("down", e.shiftKey);
    } else if (e.key === "ArrowLeft") {
      // Only navigate left if at the beginning of input
      if (inputRef.current && inputRef.current.selectionStart === 0) {
        e.preventDefault();
        onNavigate("left", e.shiftKey);
      }
    } else if (e.key === "ArrowRight") {
      // Only navigate right if at the end of input
      if (inputRef.current && 
          inputRef.current.selectionStart === inputRef.current.value.length) {
        e.preventDefault();
        onNavigate("right", e.shiftKey);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      onNavigate(e.shiftKey ? "left" : "right", false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onNavigate(e.shiftKey ? "up" : "down", false);
    }
  };
  
  // Special rendering for reps column with RepType support
  if (columnName === "reps") {
    return (
      <div 
        className={cn(
          "editable-cell h-full",
          isFocused && "ring-2 ring-primary ring-offset-1",
          className
        )}
        onClick={handleClick}
      >
        <RepInput
          value={value}
          repType={repType}
          onChange={onChange}
          onRepTypeChange={onRepTypeChange || (() => {})}
          placeholder={placeholder}
          isFocused={isFocused}
          hideSelector={hideRepTypeSelector}
        />
      </div>
    );
  }
  
  // Special rendering for weight column with WeightType support
  if (columnName === "weight") {
    return (
      <div 
        className={cn(
          "editable-cell h-full",
          isFocused && "ring-2 ring-primary ring-offset-1",
          className
        )}
        onClick={handleClick}
      >
        <WeightInput
          value={value}
          weightType={weightType}
          onChange={onChange}
          onWeightTypeChange={onWeightTypeChange || (() => {})}
          placeholder={placeholder}
          isFocused={isFocused}
          hideSelector={hideWeightTypeSelector}
          exerciseName={exerciseName}
        />
      </div>
    );
  }
  
  // Special rendering for intensity column with IntensityType support
  if (columnName === "intensity") {
    return (
      <div 
        className={cn(
          "editable-cell h-full",
          isFocused && "ring-2 ring-primary ring-offset-1",
          className
        )}
        onClick={handleClick}
      >
        <IntensityInput
          value={value}
          intensityType={intensityType}
          onChange={onChange}
          onIntensityTypeChange={onIntensityTypeChange || (() => {})}
          placeholder={placeholder}
          isFocused={isFocused}
          hideSelector={hideIntensityTypeSelector}
        />
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "editable-cell h-full flex items-center",
        isFocused && "ring-2 ring-primary ring-offset-1",
        className
      )}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type={type}
        className="cell-input w-full h-full bg-transparent outline-none px-2 py-1"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};

export default EditableSetCell;
