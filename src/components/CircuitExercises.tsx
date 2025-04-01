
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Exercise } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ExerciseSearch from "@/components/ExerciseSearch";
import WorkoutTable from "@/components/WorkoutTable";

interface CircuitExercisesProps {
  workoutId: string;
  circuitId: string;
  exercises: Exercise[];
}

const CircuitExercises: React.FC<CircuitExercisesProps> = ({
  workoutId,
  circuitId,
  exercises,
}) => {
  const { addExercise, updateExercise } = useWorkout();

  const handleAddExerciseToCircuit = () => {
    // Add a new exercise and associate it with this circuit
    addExercise(workoutId);
    // Note: We need to set circuit properties after the exercise is created
    // This is handled in the WorkoutContext when a new exercise is added
    
    toast.success("Exercise added to circuit");
  };

  const handleNameChange = (exerciseId: string, name: string) => {
    updateExercise(workoutId, exerciseId, { name });
  };

  const handleNotesChange = (exerciseId: string, notes: string) => {
    updateExercise(workoutId, exerciseId, { notes });
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="border border-blue-900/30 rounded bg-blue-950/10 p-3">
          <WorkoutTable
            exercise={exercise}
            workoutId={workoutId}
            onNameChange={(name) => handleNameChange(exercise.id, name)}
            onNotesChange={(notes) => handleNotesChange(exercise.id, notes)}
          />
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddExerciseToCircuit}
        className="w-full border-dashed border-gray-700 text-gray-400 hover:text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Exercise to Circuit
      </Button>
    </div>
  );
};

export default CircuitExercises;
