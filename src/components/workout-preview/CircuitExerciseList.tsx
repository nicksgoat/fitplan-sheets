
import React from 'react';
import { Exercise, Set } from "@/types/workout";
import { formatRestTime } from "@/utils/workoutPreviewUtils";
import { Clock, Plus } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";

interface CircuitExerciseListProps {
  circuitId: string;
  circuitExercises: Exercise[];
}

const CircuitExerciseList: React.FC<CircuitExerciseListProps> = ({ circuitId, circuitExercises }) => {
  const { addExerciseToCircuit, program } = useWorkout();
  
  if (!circuitExercises || circuitExercises.length === 0) return null;
  
  // Find the session that contains this circuit
  const sessionWithCircuit = program.sessions.find(session => 
    session.circuits.some(circuit => circuit.id === circuitId)
  );
  
  const handleAddExercise = () => {
    if (sessionWithCircuit) {
      // Open a dialog or implement the logic to add an exercise to this circuit
      const dialogButton = document.querySelector('[data-dropdown-toggle="dropdown"]');
      if (dialogButton instanceof HTMLElement) {
        dialogButton.click();
      }
    }
  };
  
  return (
    <div className="mt-2">
      {circuitExercises.map((circuitExercise) => (
        <div
          key={circuitExercise.id}
          className="pl-3 py-2 border-t border-dark-300"
        >
          <div className="flex items-center mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
            <div className="text-sm font-medium truncate text-white">{circuitExercise.name}</div>
          </div>
          
          {circuitExercise.sets.length > 0 && (
            <div className="ml-4 text-xs text-gray-400">
              {circuitExercise.sets.map((set, setIdx) => (
                <div key={set.id || setIdx} className="mb-1">
                  <span className="font-medium">Set {setIdx + 1}:</span> {set.reps || '-'} reps
                  {set.weight && ` @ ${set.weight}`}
                  {set.rest && (
                    <span className="text-blue-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Rest: {formatRestTime(set.rest)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {sessionWithCircuit && (
        <div className="mt-2 pl-3 py-2 border-t border-dark-300">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-400 p-0 h-auto hover:bg-transparent hover:text-blue-300"
            onClick={handleAddExercise}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Exercise
          </Button>
        </div>
      )}
    </div>
  );
};

export default CircuitExerciseList;
