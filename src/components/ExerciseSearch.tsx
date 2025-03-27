
import React, { useState, useEffect, useRef } from "react";
import { Exercise, searchExercises } from "@/utils/exerciseLibrary";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface ExerciseSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (exercise: Exercise) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  value,
  onChange,
  onSelect,
  onBlur,
  autoFocus = false,
  placeholder = "Search exercises...",
  className
}) => {
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = searchExercises(value);
    setSearchResults(results);
  }, [value]);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  useEffect(() => {
    // Close results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowResults(true);
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    onChange(exercise.name);
    setShowResults(false);
    if (onSelect) {
      onSelect(exercise);
    }
  };
  
  const handleInputFocus = () => {
    if (value && searchResults.length > 0) {
      setShowResults(true);
    }
  };
  
  const handleInputBlur = () => {
    // Delayed to allow click on result
    setTimeout(() => {
      if (onBlur) {
        onBlur();
      }
    }, 200);
  };
  
  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        className={cn(
          "w-full px-2 py-1 bg-transparent outline-none",
          className
        )}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
      />
      
      {showResults && searchResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="fixed z-[100] w-[240px] max-h-[300px] overflow-y-auto bg-popover border rounded-md shadow-md"
          style={{ 
            left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
            top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 5 : 0
          }}
        >
          <Command className="rounded-lg border shadow-md">
            <div className="p-0 overflow-y-auto">
              {searchResults.map((exercise) => (
                <div
                  key={exercise.id}
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center"
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.primaryMuscle} • {exercise.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Command>
        </div>
      )}
    </div>
  );
};

export default ExerciseSearch;
