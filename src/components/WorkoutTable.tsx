
import React, { useRef } from "react";
import { Trash2, ChevronRight } from "lucide-react";
import { WorkoutSession, Exercise, CellType } from "@/types/workout";
import { useWorkout } from "@/contexts/WorkoutContext";
import EditableCell from "./EditableCell";
import { useCellNavigation, CellCoordinate } from "@/hooks/useCellNavigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutTableProps {
  session: WorkoutSession;
}

// Define the order of columns for navigation
const columnOrder: CellType[] = ["name", "sets", "reps", "weight", "rpe", "rest", "notes"];

const WorkoutTable: React.FC<WorkoutTableProps> = ({ session }) => {
  const { updateExercise, addExercise, deleteExercise } = useWorkout();
  const { focusedCell, focusCell, blurCell, isCellFocused } = useCellNavigation();
  const tableRef = useRef<HTMLTableElement>(null);
  
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
  
  const handleCellFocus = (coordinate: CellCoordinate) => {
    focusCell(coordinate);
  };
  
  const handleCellNavigate = (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => {
    const { rowIndex, columnName, exerciseId } = currentCoord;
    const currentColIndex = columnOrder.indexOf(columnName as CellType);
    
    let newRowIndex = rowIndex;
    let newColIndex = currentColIndex;
    
    switch (direction) {
      case "up":
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case "down":
        newRowIndex = Math.min(session.exercises.length - 1, rowIndex + 1);
        // If at the last row and last column, add a new exercise
        if (newRowIndex === rowIndex && rowIndex === session.exercises.length - 1 && columnName === "notes") {
          addExercise(session.id, exerciseId);
          newRowIndex = rowIndex + 1;
        }
        break;
      case "left":
        newColIndex = Math.max(0, currentColIndex - 1);
        break;
      case "right":
        newColIndex = Math.min(columnOrder.length - 1, currentColIndex + 1);
        break;
    }
    
    // Get the new exercise ID based on the new row index
    const newExerciseId = session.exercises[newRowIndex]?.id || exerciseId;
    
    // Focus the new cell
    focusCell({
      rowIndex: newRowIndex,
      columnName: columnOrder[newColIndex],
      exerciseId: newExerciseId
    });
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="workout-table" ref={tableRef}>
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
              className={cn(
                "group",
                exercise.groupId ? "bg-secondary/30" : ""
              )}
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
                  coordinate={{ rowIndex: index, columnName: "name", exerciseId: exercise.id }}
                  isFocused={isCellFocused(index, "name", exercise.id)}
                  onFocus={handleCellFocus}
                  onNavigate={(direction, shiftKey) => 
                    handleCellNavigate(direction, shiftKey, { 
                      rowIndex: index, 
                      columnName: "name", 
                      exerciseId: exercise.id 
                    })
                  }
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.sets}
                  onChange={(value) => handleCellChange(exercise.id, "sets", value)}
                  type="number"
                  placeholder="3"
                  coordinate={{ rowIndex: index, columnName: "sets", exerciseId: exercise.id }}
                  isFocused={isCellFocused(index, "sets", exercise.id)}
                  onFocus={handleCellFocus}
                  onNavigate={(direction, shiftKey) => 
                    handleCellNavigate(direction, shiftKey, { 
                      rowIndex: index, 
                      columnName: "sets", 
                      exerciseId: exercise.id 
                    })
                  }
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.reps}
                  onChange={(value) => handleCellChange(exercise.id, "reps", value)}
                  placeholder="10"
                  coordinate={{ rowIndex: index, columnName: "reps", exerciseId: exercise.id }}
                  isFocused={isCellFocused(index, "reps", exercise.id)}
                  onFocus={handleCellFocus}
                  onNavigate={(direction, shiftKey) => 
                    handleCellNavigate(direction, shiftKey, { 
                      rowIndex: index, 
                      columnName: "reps", 
                      exerciseId: exercise.id 
                    })
                  }
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.weight}
                  onChange={(value) => handleCellChange(exercise.id, "weight", value)}
                  placeholder="lbs"
                  coordinate={{ rowIndex: index, columnName: "weight", exerciseId: exercise.id }}
                  isFocused={isCellFocused(index, "weight", exercise.id)}
                  onFocus={handleCellFocus}
                  onNavigate={(direction, shiftKey) => 
                    handleCellNavigate(direction, shiftKey, { 
                      rowIndex: index, 
                      columnName: "weight", 
                      exerciseId: exercise.id 
                    })
                  }
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.rpe}
                  onChange={(value) => handleCellChange(exercise.id, "rpe", value)}
                  placeholder="%"
                  coordinate={{ rowIndex: index, columnName: "rpe", exerciseId: exercise.id }}
                  isFocused={isCellFocused(index, "rpe", exercise.id)}
                  onFocus={handleCellFocus}
                  onNavigate={(direction, shiftKey) => 
                    handleCellNavigate(direction, shiftKey, { 
                      rowIndex: index, 
                      columnName: "rpe", 
                      exerciseId: exercise.id 
                    })
                  }
                />
              </td>
              
              <td>
                <EditableCell
                  value={exercise.rest}
                  onChange={(value) => handleCellChange(exercise.id, "rest", value)}
                  placeholder="60s"
                  coordinate={{ rowIndex: index, columnName: "rest", exerciseId: exercise.id }}
                  isFocused={isCellFocused(index, "rest", exercise.id)}
                  onFocus={handleCellFocus}
                  onNavigate={(direction, shiftKey) => 
                    handleCellNavigate(direction, shiftKey, { 
                      rowIndex: index, 
                      columnName: "rest", 
                      exerciseId: exercise.id 
                    })
                  }
                />
              </td>
              
              <td className="note-cell">
                <EditableCell
                  value={exercise.notes}
                  onChange={(value) => handleCellChange(exercise.id, "notes", value)}
                  placeholder="Add notes..."
                  coordinate={{ rowIndex: index, columnName: "notes", exerciseId: exercise.id }}
                  isFocused={isCellFocused(index, "notes", exercise.id)}
                  onFocus={handleCellFocus}
                  onNavigate={(direction, shiftKey) => 
                    handleCellNavigate(direction, shiftKey, { 
                      rowIndex: index, 
                      columnName: "notes", 
                      exerciseId: exercise.id 
                    })
                  }
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
