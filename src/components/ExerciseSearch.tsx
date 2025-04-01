
import React, { useState, useEffect, useRef } from "react";
import { Exercise } from "@/types/exercise";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useSearchExercises } from "@/hooks/useExerciseLibrary";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Loader2, Video } from "lucide-react";
import { toast } from "sonner";

interface ExerciseSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (exercise: Exercise) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  showMetadata?: boolean;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  value,
  onChange,
  onSelect,
  onBlur,
  autoFocus = false,
  placeholder = "Search exercises...",
  className,
  showMetadata = true
}) => {
  const { searchResults, loading, setQuery } = useSearchExercises();
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value, setQuery]);
  
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
    if (newValue.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    onChange(exercise.name);
    setShowResults(false);
    if (onSelect) {
      onSelect(exercise);
    }
  };
  
  const handleInputFocus = () => {
    if (value && value.trim().length > 0) {
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
      
      {showResults && (
        <div 
          ref={resultsRef}
          className="fixed z-[100] w-[320px] max-h-[300px] overflow-y-auto bg-popover border rounded-md shadow-md"
          style={{ 
            left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
            top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 5 : 0
          }}
        >
          <Command className="rounded-lg border shadow-md">
            <div className="p-0 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-center flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  No exercises found
                </div>
              ) : (
                searchResults.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center"
                    onClick={() => handleSelectExercise(exercise)}
                  >
                    <div className="flex items-center w-full">
                      {exercise.imageUrl ? (
                        <div className="h-8 w-8 mr-2 rounded bg-cover bg-center" style={{ backgroundImage: `url(${exercise.imageUrl})` }} />
                      ) : (
                        <div className="h-8 w-8 mr-2 rounded bg-gray-700 flex items-center justify-center">
                          <Dumbbell className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="font-medium">{exercise.name}</div>
                        {showMetadata && (
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs px-1 py-0 bg-gray-800 text-gray-300">
                              {exercise.primaryMuscle}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-1 py-0 bg-gray-800 text-gray-300">
                              {exercise.category}
                            </Badge>
                            {exercise.isCustom && (
                              <Badge variant="outline" className="text-xs px-1 py-0 bg-green-800 text-green-300">
                                Custom
                              </Badge>
                            )}
                            {exercise.videoUrl && (
                              <Badge variant="outline" className="text-xs px-1 py-0 bg-blue-800 text-blue-300 flex items-center">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Command>
        </div>
      )}
    </div>
  );
};

export default ExerciseSearch;
