
import React from "react";
import { Trash2, ChevronRight } from "lucide-react";
import { WorkoutSession, Exercise } from "@/types/workout";
import { useWorkout } from "@/contexts/WorkoutContext";
import EditableCell from "./EditableCell";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutTableProps {
  session: WorkoutSession;
}

const WorkoutTable: React.FC<WorkoutTableProps> = ({ session }) => {
  const { updateExercise, addExercise, deleteExercise } = useWorkout();
  
  const handleCellChange = (exerciseId: string, field: keyof Exercise, value: string) => {
    const updates: Partial<Exercise> = { [field]: value };
    
    // Handle special logic for sets field
    if (field === "sets") {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        updates.sets = numericValue;
      } else {
        updates.sets = 0;
      }
    }
    
    updateExercise(session.id, exerciseId, updates);
  };
  
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    exerciseId: string,
    index: number
  ) => {
    // Add a new row on Tab key press on the last row and last column
    if (
      e.key === "Tab" && 
      !e.shiftKey && 
      index === session.exercises.length - 1 && 
      (e.target as HTMLElement).closest("td")?.classList.contains("note-cell")
    ) {
      e.preventDefault();
      addExercise(session.id, exerciseId);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="workout-table">
        <thead>
          <tr>
            <th style={{ width: "40px" }}>#</th>
            <th className="exercise-cell">Exercise</th>
            <th className="numeric-cell">Sets</th>
            <th className="numeric-cell">Reps</th>
            <th className="numeric-cell">Weight</th>
            <th className="numeric-cell">RPE</th>
            <th className="numeric-cell">Rest</th>
            <th className="note-cell">Notes</th>
            <th style={{ width: "40px" }}></th>
          </tr>
        </thead>
        <tbody>
          {session.exercises.map((exercise, index) => (
            <motion.tr
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={exercise.groupId ? "bg-secondary/30" : ""}
            >
              <td className="text-center text-muted-foreground text-sm">
                {exercise.groupId ? (
                  <div className="flex justify-center items-center pl-2">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                ) : (
                  index + 1
                )}
              </td>
              
              <td className={cn(exercise.groupId && "pl-4")}>
                <EditableCell
                  value={exercise.name}
                  onChange={(value) => handleCellChange(exercise.id, "name", value)}
                  placeholder="Exercise name"
                  className={cn(
                    exercise.isGroup && "font-medium",
                    exercise.name === "Finisher" && "font-medium text-orange-600",
                    exercise.name === "Cool down" && "font-medium text-blue-600",
                    exercise.name?.includes("Circuit") && "font-medium text-purple-600"
                  )}
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.sets}
                  onChange={(value) => handleCellChange(exercise.id, "sets", value)}
                  type="number"
                  placeholder="3"
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.reps}
                  onChange={(value) => handleCellChange(exercise.id, "reps", value)}
                  placeholder="10"
                  onKeyDown={(e) => handleKeyDown(e, exercise.id, index)}
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.weight}
                  onChange={(value) => handleCellChange(exercise.id, "weight", value)}
                  placeholder="lbs"
                  onKeyDown={(e) => handleKeyDown(e, exercise.id, index)}
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.rpe}
                  onChange={(value) => handleCellChange(exercise.id, "rpe", value)}
                  placeholder="%"
                  onKeyDown={(e) => handleKeyDown(e, exercise.id, index)}
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.rest}
                  onChange={(value) => handleCellChange(exercise.id, "rest", value)}
                  placeholder="60s"
                  onKeyDown={(e) => handleKeyDown(e, exercise.id, index)}
                />
              </td>
              
              <td className="note-cell">
                <EditableCell
                  value={exercise.notes}
                  onChange={(value) => handleCellChange(exercise.id, "notes", value)}
                  placeholder="Add notes..."
                  onKeyDown={(e) => handleKeyDown(e, exercise.id, index)}
                />
              </td>
              
              <td>
                <button
                  className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                  onClick={() => deleteExercise(session.id, exercise.id)}
                  aria-label="Delete exercise"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkoutTable;
