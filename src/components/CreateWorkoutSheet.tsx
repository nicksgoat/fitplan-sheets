
import React, { useState, useCallback, useRef } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCellNavigation } from "@/hooks/useCellNavigation";
import { Plus, Trash2 } from "lucide-react";
import { createEmptyExercise, createEmptySet } from "@/utils/workout";
import { Exercise, Set } from "@/types/workout";

interface CreateWorkoutSheetProps {
  weekId?: string;
  onSave?: () => void;
}

const CreateWorkoutSheet: React.FC<CreateWorkoutSheetProps> = ({ weekId, onSave }) => {
  const { addSession } = useWorkout();
  const [sessionName, setSessionName] = useState("New Session");
  const [exercises, setExercises] = useState<Exercise[]>([createEmptyExercise()]);
  const { focusedCell, focusCell, blurCell, isCellFocused } = useCellNavigation();

  const handleAddExercise = () => {
    setExercises(prev => [...prev, createEmptyExercise()]);
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, sets: [...exercise.sets, createEmptySet()] }
        : exercise
    ));
  };

  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, name } : exercise
    ));
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: keyof Set, value: string) => {
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { 
            ...exercise, 
            sets: exercise.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            ) 
          }
        : exercise
    ));
  };

  const handleSaveSession = () => {
    if (sessionName.trim() && exercises.length > 0 && weekId) {
      // Call addSession with weekId as the first parameter
      addSession(weekId);
      
      if (onSave) {
        onSave();
      }
    }
  };

  return (
    <div className="p-6 bg-dark-200">
      <div className="mb-4">
        <Input 
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Session Name"
          className="w-full bg-dark-300 text-white"
        />
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="bg-dark-300 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Input 
                value={exercise.name}
                onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
                placeholder="Exercise Name"
                className="mr-2 bg-dark-400 text-white"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleAddSet(exercise.id)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Set
              </Button>
            </div>

            <table className="w-full">
              <thead>
                <tr>
                  <th>Reps</th>
                  <th>Weight</th>
                  <th>Intensity</th>
                  <th>Rest</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, setIndex) => (
                  <tr key={set.id}>
                    <td>
                      <Input 
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                        placeholder="Reps"
                        className="w-full bg-dark-400 text-white"
                      />
                    </td>
                    <td>
                      <Input 
                        value={set.weight}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                        placeholder="Weight"
                        className="w-full bg-dark-400 text-white"
                      />
                    </td>
                    <td>
                      <Input 
                        value={set.intensity}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'intensity', e.target.value)}
                        placeholder="Intensity"
                        className="w-full bg-dark-400 text-white"
                      />
                    </td>
                    <td>
                      <Input 
                        value={set.rest}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'rest', e.target.value)}
                        placeholder="Rest"
                        className="w-full bg-dark-400 text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="mt-4 flex space-x-2">
        <Button 
          variant="default" 
          onClick={handleAddExercise}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Exercise
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleSaveSession}
        >
          Save Session
        </Button>
      </div>
    </div>
  );
};

export default CreateWorkoutSheet;
