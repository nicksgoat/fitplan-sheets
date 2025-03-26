import React, { useRef } from "react";
import { Trash2, ChevronRight, Plus, Minus, RotateCcw } from "lucide-react";
import { WorkoutSession, Exercise, SetCellType, ExerciseCellType, Set } from "@/types/workout";
import { useWorkout } from "@/contexts/WorkoutContext";
import EditableCell from "./EditableCell";
import EditableSetCell from "./EditableSetCell";
import { useCellNavigation, CellCoordinate } from "@/hooks/useCellNavigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutTableProps {
  session: WorkoutSession;
}

// Define the order of columns for navigation
const exerciseColumnOrder: ExerciseCellType[] = ["name", "notes"];
const setColumnOrder: SetCellType[] = ["reps", "weight", "rpe", "rest"];

const WorkoutTable: React.FC<WorkoutTableProps> = ({ session }) => {
  const { 
    updateExercise, 
    updateSet,
    addExercise, 
    addSet,
    deleteSet,
    deleteExercise 
  } = useWorkout();
  const { focusedCell, focusCell, isCellFocused } = useCellNavigation();
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Organize exercises by grouping circuits
  const organizedExercises = React.useMemo(() => {
    const result: Exercise[] = [];
    const circuitMap = new Map<string, Exercise[]>();
    
    // First pass: identify circuit exercises and group them
    session.exercises.forEach(exercise => {
      if (exercise.isCircuit) {
        // This is a circuit header
        result.push(exercise);
      } else if (exercise.isInCircuit && exercise.circuitId) {
        // This is an exercise inside a circuit
        const exercises = circuitMap.get(exercise.circuitId) || [];
        exercises.push(exercise);
        circuitMap.set(exercise.circuitId, exercises);
      } else if (exercise.isGroup) {
        // This is a group header
        result.push(exercise);
      } else if (!exercise.groupId && !exercise.isInCircuit) {
        // This is a standalone exercise
        result.push(exercise);
      }
    });
    
    // Second pass: insert grouped exercises after their headers
    const finalResult: Exercise[] = [];
    
    for (const exercise of result) {
      finalResult.push(exercise);
      
      if (exercise.isCircuit && exercise.circuitId) {
        // Add all exercises that belong to this circuit
        const circuitExercises = circuitMap.get(exercise.circuitId) || [];
        circuitExercises
          .sort((a, b) => (a.circuitOrder || 0) - (b.circuitOrder || 0))
          .forEach(e => finalResult.push(e));
      } else if (exercise.isGroup) {
        // Add all exercises that belong to this group
        session.exercises
          .filter(e => e.groupId === exercise.id)
          .forEach(e => finalResult.push(e));
      }
    }
    
    return finalResult;
  }, [session.exercises]);
  
  const handleExerciseCellChange = (exerciseId: string, field: keyof Exercise, value: string) => {
    updateExercise(session.id, exerciseId, { [field]: value } as Partial<Exercise>);
  };
  
  const handleSetCellChange = (exerciseId: string, setId: string, field: keyof Set, value: string) => {
    updateSet(session.id, exerciseId, setId, { [field]: value } as Partial<Set>);
  };
  
  const handleCellFocus = (coordinate: CellCoordinate) => {
    focusCell(coordinate);
  };
  
  const handleExerciseCellNavigate = (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => {
    const { rowIndex, columnName, exerciseId } = currentCoord;
    const exercises = session.exercises;
    const currentExerciseIndex = exercises.findIndex(e => e.id === exerciseId);
    const currentColIndex = exerciseColumnOrder.indexOf(columnName as ExerciseCellType);
    
    let newRowIndex = currentExerciseIndex;
    let newColIndex = currentColIndex;
    let targetSetIndex: number | undefined = undefined;
    
    switch (direction) {
      case "up":
        // Move to previous exercise
        if (currentExerciseIndex > 0) {
          newRowIndex = currentExerciseIndex - 1;
        }
        break;
      case "down":
        // If there's a next exercise
        if (currentExerciseIndex < exercises.length - 1) {
          newRowIndex = currentExerciseIndex + 1;
        } else if (columnName === "notes") {
          // If at last exercise and last column, add a new exercise
          addExercise(session.id);
          newRowIndex = currentExerciseIndex + 1;
        } else if (columnName === "name") {
          // If on name, go to the first set
          targetSetIndex = 0;
          newColIndex = 0; // First set column (reps)
        }
        break;
      case "left":
        if (currentColIndex > 0) {
          newColIndex = currentColIndex - 1;
        }
        break;
      case "right":
        if (currentColIndex < exerciseColumnOrder.length - 1) {
          newColIndex = currentColIndex + 1;
        } else if (columnName === "notes") {
          // If at the last column, try to go to the next exercise
          if (currentExerciseIndex < exercises.length - 1) {
            newRowIndex = currentExerciseIndex + 1;
            newColIndex = 0; // First column (name)
          }
        }
        break;
    }
    
    // Get the new exercise ID based on the new row index
    const targetExercise = exercises[newRowIndex];
    const newExerciseId = targetExercise?.id || exerciseId;
    
    // Focus the new cell
    focusCell({
      rowIndex: newRowIndex,
      columnName: targetSetIndex !== undefined ? setColumnOrder[0] : exerciseColumnOrder[newColIndex],
      exerciseId: newExerciseId,
      setIndex: targetSetIndex
    });
  };
  
  const handleSetCellNavigate = (
    direction: "up" | "down" | "left" | "right",
    shiftKey: boolean,
    currentCoord: CellCoordinate
  ) => {
    const { rowIndex, columnName, exerciseId, setIndex } = currentCoord;
    
    if (setIndex === undefined) return;
    
    const exercises = session.exercises;
    const currentExerciseIndex = exercises.findIndex(e => e.id === exerciseId);
    
    if (currentExerciseIndex === -1) return;
    
    const exercise = exercises[currentExerciseIndex];
    const sets = exercise.sets;
    const currentColIndex = setColumnOrder.indexOf(columnName as SetCellType);
    
    let newExerciseIndex = currentExerciseIndex;
    let newSetIndex = setIndex;
    let newColIndex = currentColIndex;
    let targetExerciseColumn: string | undefined = undefined;
    
    switch (direction) {
      case "up":
        if (setIndex > 0) {
          // Move to previous set
          newSetIndex = setIndex - 1;
        } else if (currentExerciseIndex > 0) {
          // Move to previous exercise's last set
          newExerciseIndex = currentExerciseIndex - 1;
          const prevExercise = exercises[newExerciseIndex];
          newSetIndex = prevExercise.sets.length - 1;
        } else {
          // If at the first set of the first exercise, go to the exercise's name
          targetExerciseColumn = "name";
          newSetIndex = undefined;
        }
        break;
      case "down":
        if (setIndex < sets.length - 1) {
          // Move to next set
          newSetIndex = setIndex + 1;
        } else if (currentExerciseIndex < exercises.length - 1) {
          // Move to next exercise's first set
          newExerciseIndex = currentExerciseIndex + 1;
          newSetIndex = 0;
        } else if (currentColIndex === setColumnOrder.length - 1) {
          // If at the last column of the last set of the last exercise, add a new exercise
          addExercise(session.id);
          newExerciseIndex = currentExerciseIndex + 1;
          newSetIndex = 0;
        } else {
          // If at the last set, go to the exercise's notes
          targetExerciseColumn = "notes";
          newSetIndex = undefined;
        }
        break;
      case "left":
        if (currentColIndex > 0) {
          // Move to previous column
          newColIndex = currentColIndex - 1;
        } else if (setIndex > 0) {
          // Move to previous set's last column
          newSetIndex = setIndex - 1;
          newColIndex = setColumnOrder.length - 1;
        } else {
          // If at the first column of the first set, go to the exercise's name
          targetExerciseColumn = "name";
          newSetIndex = undefined;
        }
        break;
      case "right":
        if (currentColIndex < setColumnOrder.length - 1) {
          // Move to next column
          newColIndex = currentColIndex + 1;
        } else if (setIndex < sets.length - 1) {
          // Move to next set's first column
          newSetIndex = setIndex + 1;
          newColIndex = 0;
        } else {
          // If at the last column of the last set, go to the exercise's notes
          targetExerciseColumn = "notes";
          newSetIndex = undefined;
        }
        break;
    }
    
    // Get the target exercise
    const targetExercise = exercises[newExerciseIndex];
    
    // Focus the new cell
    focusCell({
      rowIndex: newExerciseIndex,
      columnName: targetExerciseColumn || setColumnOrder[newColIndex],
      exerciseId: targetExercise.id,
      setIndex: targetExerciseColumn ? undefined : newSetIndex
    });
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="workout-table" ref={tableRef}>
        <thead>
          <tr>
            <th style={{ width: "40px" }}>#</th>
            <th className="exercise-cell">Exercise</th>
            <th className="numeric-cell">Reps</th>
            <th className="numeric-cell">Weight</th>
            <th className="numeric-cell">RPE</th>
            <th className="numeric-cell">Rest</th>
            <th className="note-cell">Notes</th>
            <th style={{ width: "70px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizedExercises.map((exercise, exerciseIndex) => {
            // Calculate if this is a circuit exercise
            const isCircuit = exercise.isCircuit;
            const isInCircuit = exercise.isInCircuit;
            const circuitId = exercise.circuitId;
            
            // Find the circuit if this exercise is in one
            const circuit = circuitId 
              ? (session.circuits || []).find(c => c.id === circuitId) 
              : undefined;
            
            return (
              <React.Fragment key={exercise.id}>
                {/* Main exercise row */}
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: exerciseIndex * 0.03 }}
                  className={cn(
                    "group exercise-row",
                    isCircuit && "bg-primary/5 border-primary/20",
                    isInCircuit && "bg-secondary/30"
                  )}
                >
                  <td className="text-center text-muted-foreground text-sm">
                    {isInCircuit ? (
                      <div className="flex justify-center items-center pl-2">
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    ) : (
                      exerciseIndex + 1
                    )}
                  </td>
                  
                  <td className={cn(isInCircuit && "pl-4")} colSpan={isCircuit ? 5 : undefined}>
                    <div className="flex items-center gap-2">
                      {isCircuit && (
                        <RotateCcw className="h-3.5 w-3.5 text-primary mr-1" />
                      )}
                      <EditableCell
                        value={exercise.name}
                        onChange={(value) => handleExerciseCellChange(exercise.id, "name", value)}
                        placeholder="Exercise name"
                        className={cn(
                          isCircuit && "font-medium text-primary",
                          isInCircuit && circuit?.name === "Superset" && "font-medium text-indigo-600",
                          isInCircuit && circuit?.name.includes("EMOM") && "font-medium text-green-600",
                          isInCircuit && circuit?.name.includes("AMRAP") && "font-medium text-amber-600",
                          isInCircuit && circuit?.name.includes("Tabata") && "font-medium text-rose-600",
                          exercise.name === "Finisher" && "font-medium text-orange-600",
                          exercise.name === "Cool down" && "font-medium text-blue-600"
                        )}
                        coordinate={{ rowIndex: exerciseIndex, columnName: "name", exerciseId: exercise.id }}
                        isFocused={isCellFocused(exerciseIndex, "name", exercise.id)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleExerciseCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "name", 
                            exerciseId: exercise.id 
                          })
                        }
                      />
                      
                      {isCircuit && circuit && (
                        <div className="ml-2 text-xs text-muted-foreground">
                          {circuit.rounds === "AMRAP" 
                            ? "AMRAP" 
                            : circuit.rounds 
                              ? `${circuit.rounds} rounds` 
                              : "3 rounds"}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {!isCircuit && (
                    <>
                      <td className="numeric-cell">
                        {exercise.sets[0]?.reps || ""}
                      </td>
                      <td className="numeric-cell">
                        {exercise.sets[0]?.weight || ""}
                      </td>
                      <td className="numeric-cell">
                        {exercise.sets[0]?.rpe || ""}
                      </td>
                      <td className="numeric-cell">
                        {exercise.sets[0]?.rest || ""}
                      </td>
                      <td className="note-cell">
                        <EditableCell
                          value={exercise.notes}
                          onChange={(value) => handleExerciseCellChange(exercise.id, "notes", value)}
                          placeholder="Add notes..."
                          coordinate={{ rowIndex: exerciseIndex, columnName: "notes", exerciseId: exercise.id }}
                          isFocused={isCellFocused(exerciseIndex, "notes", exercise.id)}
                          onFocus={handleCellFocus}
                          onNavigate={(direction, shiftKey) => 
                            handleExerciseCellNavigate(direction, shiftKey, { 
                              rowIndex: exerciseIndex, 
                              columnName: "notes", 
                              exerciseId: exercise.id 
                            })
                          }
                        />
                      </td>
                    
                      <td>
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-1 rounded-full hover:bg-secondary transition-colors"
                            onClick={() => addSet(session.id, exercise.id)}
                            aria-label="Add set"
                          >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                            onClick={() => deleteExercise(session.id, exercise.id)}
                            aria-label="Delete exercise"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  
                  {isCircuit && (
                    <>
                      <td colSpan={2}>
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                            onClick={() => deleteExercise(session.id, exercise.id)}
                            aria-label="Delete circuit"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
                
                {/* Set rows for regular exercises */}
                {!isCircuit && !isInCircuit && exercise.sets.length > 0 && exercise.sets.map((set, setIndex) => (
                  <motion.tr
                    key={`${exercise.id}-${set.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.05 + setIndex * 0.02 }}
                    className="set-row group"
                  >
                    <td></td>
                    <td className="set-number">Set {setIndex + 1}</td>
                    
                    <td>
                      <EditableSetCell
                        value={set.reps}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "reps", value)}
                        placeholder="10"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "reps", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "reps", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "reps", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td>
                      <EditableSetCell
                        value={set.weight}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "weight", value)}
                        placeholder="lbs"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "weight", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "weight", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "weight", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td>
                      <EditableSetCell
                        value={set.rpe}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rpe", value)}
                        placeholder="%"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "rpe", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "rpe", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "rpe", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td>
                      <EditableSetCell
                        value={set.rest}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rest", value)}
                        placeholder="60s"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "rest", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "rest", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "rest", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td></td>
                    
                    <td>
                      {exercise.sets.length > 1 && (
                        <button
                          className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => deleteSet(session.id, exercise.id, set.id)}
                          aria-label="Delete set"
                        >
                          <Minus className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
                
                {/* Set rows for exercises WITHIN circuits */}
                {isInCircuit && exercise.sets.length > 0 && exercise.sets.map((set, setIndex) => (
                  <motion.tr
                    key={`${exercise.id}-${set.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.05 + setIndex * 0.02 }}
                    className="set-row group bg-secondary/10"
                  >
                    <td></td>
                    <td className="set-number pl-5">Set {setIndex + 1}</td>
                    
                    <td>
                      <EditableSetCell
                        value={set.reps}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "reps", value)}
                        placeholder="10"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "reps", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "reps", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "reps", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td>
                      <EditableSetCell
                        value={set.weight}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "weight", value)}
                        placeholder="lbs"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "weight", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "weight", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "weight", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td>
                      <EditableSetCell
                        value={set.rpe}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rpe", value)}
                        placeholder="%"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "rpe", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "rpe", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "rpe", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td>
                      <EditableSetCell
                        value={set.rest}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rest", value)}
                        placeholder="60s"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "rest", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        isFocused={isCellFocused(exerciseIndex, "rest", exercise.id, setIndex)}
                        onFocus={handleCellFocus}
                        onNavigate={(direction, shiftKey) => 
                          handleSetCellNavigate(direction, shiftKey, { 
                            rowIndex: exerciseIndex, 
                            columnName: "rest", 
                            exerciseId: exercise.id,
                            setIndex: setIndex
                          })
                        }
                      />
                    </td>
                    
                    <td></td>
                    
                    <td>
                      {exercise.sets.length > 1 && (
                        <button
                          className="p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => deleteSet(session.id, exercise.id, set.id)}
                          aria-label="Delete set"
                        >
                          <Minus className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                      {exercise.sets.length === 1 && (
                        <button
                          className="p-1 rounded-full hover:bg-secondary transition-colors"
                          onClick={() => addSet(session.id, exercise.id)}
                          aria-label="Add set"
                        >
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WorkoutTable;
