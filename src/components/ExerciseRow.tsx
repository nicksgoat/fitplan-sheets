
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Exercise } from "@/types/workout";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  MoveVertical,
  Rocket,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import WorkoutTable from "@/components/WorkoutTable";
import CircuitExercises from "@/components/CircuitExercises";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWorkoutExerciseLibraryData } from "@/hooks/useWorkoutLibraryIntegration";
import { Badge as BadgeIcon } from "lucide-react";
import ExerciseSearch from "@/components/ExerciseSearch";
import { Exercise as LibraryExercise } from "@/types/exercise";
import { getDefaultExerciseConfig } from "@/utils/exerciseConverters";

interface ExerciseRowProps {
  exercise: Exercise;
  workoutId: string;
  index: number;
  circuitMap: Map<string, Exercise[]>;
}

const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  workoutId,
  index,
  circuitMap,
}) => {
  const { deleteExercise, duplicateExercise, updateExercise } = useWorkout();
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const { libraryExercise } = useWorkoutExerciseLibraryData(exercise.id);

  const handleDeleteExercise = () => {
    deleteExercise(workoutId, exercise.id);
    toast.success("Exercise deleted");
  };

  const handleDuplicateExercise = () => {
    duplicateExercise(workoutId, exercise.id);
    toast.success("Exercise duplicated");
  };

  const handleNameChange = (name: string) => {
    updateExercise(workoutId, exercise.id, { name });
  };

  const handleNotesChange = (notes: string) => {
    updateExercise(workoutId, exercise.id, { notes });
  };

  // Stop propagation for editable name field to prevent collapsing
  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  // Handle selection of an exercise from the library
  const handleExerciseSelect = (libraryExercise: LibraryExercise) => {
    // Get default configuration based on exercise type
    const defaultConfig = getDefaultExerciseConfig(libraryExercise.category);
    
    // Update the exercise with data from the library
    updateExercise(workoutId, exercise.id, {
      name: libraryExercise.name,
      notes: libraryExercise.instructions || '',
      libraryExerciseId: libraryExercise.id,
      // Apply any default configurations if available
      repType: defaultConfig?.repType || exercise.repType,
      weightType: defaultConfig?.weightType || exercise.weightType,
      intensityType: defaultConfig?.intensityType || exercise.intensityType
    });
    
    setIsEditingName(false);
    toast.success(`Loaded "${libraryExercise.name}" from library`);
  };

  return (
    <div className={cn(
      "border border-gray-800 rounded-lg overflow-hidden bg-dark-200",
      exercise.isCircuit && "border-blue-800 bg-blue-950/20",
      exercise.isGroup && "border-purple-800 bg-purple-950/20"
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between w-full p-3 hover:bg-gray-800/30">
          <div className="flex items-center flex-grow" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
            )}
            <div className="flex flex-col flex-grow" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="min-w-[200px]" onClick={(e) => e.stopPropagation()}>
                    <ExerciseSearch
                      value={exercise.name || ""}
                      onChange={handleNameChange}
                      onSelect={handleExerciseSelect}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus={true}
                      placeholder="Search exercises..."
                      className={cn(
                        "font-medium text-white",
                        exercise.isCircuit && "text-blue-300", 
                        exercise.isGroup && "text-purple-300"
                      )}
                    />
                  </div>
                ) : (
                  <span 
                    className={cn(
                      "font-medium text-white cursor-pointer",
                      exercise.isCircuit && "text-blue-300", 
                      exercise.isGroup && "text-purple-300"
                    )}
                    onClick={handleNameClick}
                  >
                    {exercise.name || "Unnamed Exercise"}
                  </span>
                )}
                
                {libraryExercise && (
                  <Badge variant="outline" className="ml-1 text-xs px-1 py-0 flex items-center gap-1">
                    <BadgeIcon className="h-3 w-3" />
                    <span className="text-xs">Library</span>
                  </Badge>
                )}
                
                {exercise.isCircuit && (
                  <Badge variant="outline" className="bg-blue-950 text-blue-300 border-blue-800">
                    Circuit
                  </Badge>
                )}
                
                {exercise.isGroup && (
                  <Badge variant="outline" className="bg-purple-950 text-purple-300 border-purple-800">
                    Group
                  </Badge>
                )}
              </div>
              {exercise.notes && (
                <span className="text-xs text-gray-400 mt-1 italic line-clamp-1">
                  {exercise.notes}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center flex-shrink-0">
            {exercise.isCircuit && (
              <Badge variant="outline" className="mr-2">
                <Timer className="h-3 w-3 mr-1" />
                <span className="text-xs">
                  {circuitMap.get(exercise.id)?.length || 0} exercises
                </span>
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicateExercise}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteExercise}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-3 pt-0">
            {exercise.isCircuit && exercise.id && circuitMap.has(exercise.id) ? (
              <CircuitExercises 
                workoutId={workoutId} 
                circuitId={exercise.id} 
                exercises={circuitMap.get(exercise.id) || []} 
              />
            ) : (
              <WorkoutTable
                exercise={exercise}
                workoutId={workoutId}
                onNameChange={handleNameChange}
                onNotesChange={handleNotesChange}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ExerciseRow;
