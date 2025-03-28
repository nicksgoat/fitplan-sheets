
import React, { useState, useCallback, useRef } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCellNavigation } from "@/hooks/useCellNavigation";
import { Plus, Trash2 } from "lucide-react";
import { createEmptyExercise, createEmptySet } from "@/utils/workout";
import { Exercise, Set, WorkoutSession } from "@/types/workout";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
  };

  const handleSaveSession = () => {
    if (sessionName.trim() && exercises.length > 0 && weekId) {
      const newSession: WorkoutSession = {
        id: Date.now().toString(),
        name: sessionName,
        day: 1,
        exercises: exercises,
        circuits: [],
        weekId: weekId
      };
      
      // Looking at WorkoutContext, we need to check the function signature
      // It appears addSession can accept (weekId, newSession) or just weekId
      addSession(weekId, newSession);
      
      if (onSave) {
        onSave();
      }
    }
  };

  return (
    <div className="p-6 bg-dark-200 text-white">
      <h2 className="text-xl font-bold mb-4">Create Workout Session</h2>
      
      <div className="mb-4">
        <label htmlFor="session-name" className="block text-sm font-medium mb-1">
          Session Name
        </label>
        <Input 
          id="session-name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Session Name"
          className="w-full bg-dark-300 text-white"
        />
      </div>

      <div className="space-y-6">
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="bg-dark-300 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Input 
                value={exercise.name}
                onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
                placeholder="Exercise Name"
                className="mr-2 bg-dark-400 text-white"
              />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddSet(exercise.id)}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Set
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRemoveExercise(exercise.id)}
                  className="flex items-center text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            </div>

            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="border-b border-dark-400">
                  <TableHead className="text-left text-gray-400 font-medium">Set</TableHead>
                  <TableHead className="text-left text-gray-400 font-medium">Reps</TableHead>
                  <TableHead className="text-left text-gray-400 font-medium">Weight</TableHead>
                  <TableHead className="text-left text-gray-400 font-medium">Intensity</TableHead>
                  <TableHead className="text-left text-gray-400 font-medium">Rest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercise.sets.map((set, setIndex) => (
                  <TableRow key={set.id} className="border-b border-dark-400">
                    <TableCell className="py-2 text-gray-300">{setIndex + 1}</TableCell>
                    <TableCell>
                      <Input 
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                        placeholder="Reps"
                        className="w-full bg-dark-400 text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={set.weight}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                        placeholder="Weight"
                        className="w-full bg-dark-400 text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={set.intensity}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'intensity', e.target.value)}
                        placeholder="Intensity"
                        className="w-full bg-dark-400 text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={set.rest}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'rest', e.target.value)}
                        placeholder="Rest"
                        className="w-full bg-dark-400 text-white"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          No exercises added yet. Click "Add Exercise" to get started.
        </div>
      )}

      <div className="mt-6 flex space-x-2">
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
          disabled={!sessionName.trim() || exercises.length === 0}
        >
          Save Session
        </Button>
      </div>
    </div>
  );
};

export default CreateWorkoutSheet;
