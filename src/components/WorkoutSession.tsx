
import React, { useState, useRef } from "react";
import { Workout, Exercise } from "@/types/workout";
import { useWorkout } from "@/contexts/WorkoutContext";
import ExerciseRow from "@/components/ExerciseRow";
import WorkoutSessionHeader from "@/components/WorkoutSessionHeader";
import CircuitControls from "@/components/CircuitControls";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "@/components/EmptyState";

interface WorkoutSessionProps {
  sessionId: string;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ sessionId }) => {
  const { program, addExercise } = useWorkout();
  const [addingExercise, setAddingExercise] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  if (!program) {
    return <EmptyState />;
  }

  const workout = program.workouts.find((workout) => workout.id === sessionId);

  if (!workout) {
    return <EmptyState title="Workout not found" description="The selected workout could not be found." />;
  }

  // Create a map of circuit IDs to their exercises
  const circuitMap = new Map<string, Exercise[]>();
  workout.exercises.forEach(exercise => {
    if (exercise.isInCircuit && exercise.circuitId) {
      if (!circuitMap.has(exercise.circuitId)) {
        circuitMap.set(exercise.circuitId, []);
      }
      circuitMap.get(exercise.circuitId)?.push(exercise);
    }
  });

  // Get all exercises that aren't in circuits
  const nonCircuitExercises = workout.exercises.filter(
    exercise => !exercise.isInCircuit || !exercise.circuitId
  );

  const handleAddExercise = () => {
    setAddingExercise(true);
    addExercise(sessionId);
    
    // Scroll to bottom after adding
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setAddingExercise(false);
    }, 100);
    
    toast.success("Exercise added");
  };

  return (
    <div className="mb-16">
      <WorkoutSessionHeader sessionId={sessionId} />
      
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddExercise}
            className="flex items-center gap-1"
            disabled={addingExercise}
          >
            <Plus className="h-4 w-4" />
            <span>Add Exercise</span>
          </Button>
        </div>
        
        <CircuitControls sessionId={sessionId} />
      </div>
      
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {nonCircuitExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.2 }}
            >
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                workoutId={sessionId}
                index={index}
                circuitMap={circuitMap}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div ref={bottomRef} />
    </div>
  );
};

export default WorkoutSession;
