
import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CellCoordinate } from "@/hooks/useCellNavigation";
import ExerciseSearch from "./ExerciseSearch";

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  type?: "text" | "number";
  coordinate: CellCoordinate;
  isFocused: boolean;
  onFocus: (coordinate: CellCoordinate) => void;
  onNavigate: (direction: "up" | "down" | "left" | "right", shiftKey: boolean) => void;
  isExerciseName?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  className,
  placeholder = "",
  type = "text",
  coordinate,
  isFocused,
  onFocus,
  onNavigate,
  isExerciseName = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isFocused && inputRef.current && !isExerciseName) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isFocused, isExerciseName]);
  
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
  
  // Special rendering for exercise name with search functionality
  if (isExerciseName) {
    return (
      <div 
        className={cn(
          "editable-cell h-full",
          isFocused && "ring-2 ring-primary ring-offset-1",
          className
        )}
        onClick={handleClick}
      >
        <ExerciseSearch
          value={value}
          onChange={onChange}
          autoFocus={isFocused}
          placeholder={placeholder}
          className={className}
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

export default EditableCell;
