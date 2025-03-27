import React, { useRef } from "react";
import { Trash2, ChevronRight, Plus, Minus, RotateCcw } from "lucide-react";
import { WorkoutSession, Exercise, SetCellType, ExerciseCellType, Set, RepType } from "@/types/workout";
import { useWorkout } from "@/contexts/WorkoutContext";
import EditableCell from "./EditableCell";
import EditableSetCell from "./EditableSetCell";
import RepTypeSelector from "./RepTypeSelector";
import { useCellNavigation, CellCoordinate } from "@/hooks/useCellNavigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkoutTableProps {
  session: WorkoutSession;
}

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
  
  const organizedExercises = React.useMemo(() => {
    const result: Exercise[] = [];
    const circuitMap = new Map<string, Exercise[]>();
    
    session.exercises.forEach(exercise => {
      if (exercise.isCircuit) {
        result.push(exercise);
      } else if (exercise.isInCircuit && exercise.circuitId) {
        const exercises = circuitMap.get(exercise.circuitId) || [];
        exercises.push(exercise);
        circuitMap.set(exercise.circuitId, exercises);
      } else if (exercise.isGroup) {
        result.push(exercise);
      } else if (!exercise.groupId && !exercise.isInCircuit) {
        result.push(exercise);
      }
    });
    
    const finalResult: Exercise[] = [];
    
    for (const exercise of result) {
      finalResult.push(exercise);
      
      if (exercise.isCircuit && exercise.circuitId) {
        const circuitExercises = circuitMap.get(exercise.circuitId) || [];
        circuitExercises
          .sort((a, b) => (a.circuitOrder || 0) - (b.circuitOrder || 0))
          .forEach(e => finalResult.push(e));
      } else if (exercise.isGroup) {
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
  
  const handleRepTypeChange = (exerciseId: string, repType: RepType) => {
    updateExercise(session.id, exerciseId, { repType } as Partial<Exercise>);
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
        if (currentExerciseIndex > 0) {
          newRowIndex = currentExerciseIndex - 1;
        }
        break;
      case "down":
        if (currentExerciseIndex < exercises.length - 1) {
          newRowIndex = currentExerciseIndex + 1;
        } else if (columnName === "notes") {
          addExercise(session.id);
          newRowIndex = currentExerciseIndex + 1;
        } else if (columnName === "name") {
          targetSetIndex = 0;
          newColIndex = 0;
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
          if (currentExerciseIndex < exercises.length - 1) {
            newRowIndex = currentExerciseIndex + 1;
            newColIndex = 0;
          }
        }
        break;
    }
    
    const targetExercise = exercises[newRowIndex];
    const newExerciseId = targetExercise?.id || exerciseId;
    
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
          newSetIndex = setIndex - 1;
        } else if (currentExerciseIndex > 0) {
          newExerciseIndex = currentExerciseIndex - 1;
          const prevExercise = exercises[newExerciseIndex];
          newSetIndex = prevExercise.sets.length - 1;
        } else {
          targetExerciseColumn = "name";
          newSetIndex = undefined;
        }
        break;
      case "down":
        if (setIndex < sets.length - 1) {
          newSetIndex = setIndex + 1;
        } else if (currentExerciseIndex < exercises.length - 1) {
          newExerciseIndex = currentExerciseIndex + 1;
          newSetIndex = 0;
        } else if (currentColIndex === setColumnOrder.length - 1) {
          addExercise(session.id);
          newExerciseIndex = currentExerciseIndex + 1;
          newSetIndex = 0;
        } else {
          targetExerciseColumn = "notes";
          newSetIndex = undefined;
        }
        break;
      case "left":
        if (currentColIndex > 0) {
          newColIndex = currentColIndex - 1;
        } else if (setIndex > 0) {
          newSetIndex = setIndex - 1;
          newColIndex = setColumnOrder.length - 1;
        } else {
          targetExerciseColumn = "name";
          newSetIndex = undefined;
        }
        break;
      case "right":
        if (currentColIndex < setColumnOrder.length - 1) {
          newColIndex = currentColIndex + 1;
        } else if (setIndex < sets.length - 1) {
          newSetIndex = setIndex + 1;
          newColIndex = 0;
        } else {
          targetExerciseColumn = "notes";
          newSetIndex = undefined;
        }
        break;
    }
    
    const targetExercise = exercises[newExerciseIndex];
    
    focusCell({
      rowIndex: newExerciseIndex,
      columnName: targetExerciseColumn || setColumnOrder[newColIndex],
      exerciseId: targetExercise.id,
      setIndex: targetExerciseColumn ? undefined : newSetIndex
    });
  };
  
  return (
    <div className="overflow-x-auto">
      <Table className="workout-table border-collapse w-full" ref={tableRef}>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="border border-muted-foreground/20 p-2 text-center" style={{ width: "40px" }}>#</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2 exercise-cell">Exercise</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Sets</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Reps</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Weight</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">RPE</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Rest</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2 note-cell">Notes</TableHead>
            <TableHead className="border border-muted-foreground/20 p-2" style={{ width: "70px" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizedExercises.map((exercise, exerciseIndex) => {
            const isCircuit = exercise.isCircuit;
            const isInCircuit = exercise.isInCircuit;
            const circuitId = exercise.circuitId;
            const repType = exercise.repType || 'fixed';
            
            const circuit = circuitId 
              ? (session.circuits || []).find(c => c.id === circuitId) 
              : undefined;
            
            return (
              <React.Fragment key={exercise.id}>
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: exerciseIndex * 0.03 }}
                  className={cn(
                    "group exercise-row",
                    isCircuit && "bg-primary/5",
                    isInCircuit && "bg-secondary/30"
                  )}
                >
                  <td className="border border-muted-foreground/20 p-2 text-center text-muted-foreground text-sm">
                    {isInCircuit ? (
                      <div className="flex justify-center items-center">
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    ) : (
                      exerciseIndex + 1
                    )}
                  </td>
                  
                  <td className={cn("border border-muted-foreground/20 p-2", isInCircuit && "pl-4")} colSpan={isCircuit ? 5 : undefined}>
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
                            : `${circuit.rounds} rounds`}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {!isCircuit && (
                    <>
                      <td className="border border-muted-foreground/20 p-2 text-center">
                        {exercise.sets.length}
                      </td>
                      
                      <td className="border border-muted-foreground/20 p-2">
                        <RepTypeSelector
                          value={repType}
                          onChange={(type) => handleRepTypeChange(exercise.id, type)}
                          variant="minimal"
                        />
                      </td>
                      <td className="border border-muted-foreground/20 p-2"></td>
                      <td className="border border-muted-foreground/20 p-2"></td>
                      <td className="border border-muted-foreground/20 p-2"></td>
                      
                      <td className="border border-muted-foreground/20 p-2">
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
                    
                      <td className="border border-muted-foreground/20 p-2">
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
                      <td colSpan={4} className="border border-muted-foreground/20 p-2">
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
                
                {!isCircuit && !isInCircuit && exercise.sets.map((set, setIndex) => (
                  <motion.tr
                    key={`${exercise.id}-${set.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.05 + setIndex * 0.02 }}
                    className="set-row group"
                  >
                    <td className="border border-muted-foreground/20 p-2"></td>
                    <td className="border border-muted-foreground/20 p-2 set-number">Set {setIndex + 1}</td>
                    <td className="border border-muted-foreground/20 p-2"></td>
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.reps}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "reps", value)}
                        placeholder="Reps"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "reps", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        columnName="reps"
                        repType={repType}
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
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.weight}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "weight", value)}
                        placeholder="Weight"
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
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.rpe}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rpe", value)}
                        placeholder="RPE"
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
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.rest}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rest", value)}
                        placeholder="Rest"
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
                    
                    <td className="border border-muted-foreground/20 p-2"></td>
                    
                    <td className="border border-muted-foreground/20 p-2">
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
                
                {isInCircuit && exercise.sets.length > 0 && exercise.sets.map((set, setIndex) => (
                  <motion.tr
                    key={`${exercise.id}-${set.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.05 + setIndex * 0.02 }}
                    className="set-row group bg-secondary/10"
                  >
                    <td className="border border-muted-foreground/20 p-2"></td>
                    <td className="border border-muted-foreground/20 p-2 set-number pl-5">Set {setIndex + 1}</td>
                    <td className="border border-muted-foreground/20 p-2"></td>
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.reps}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "reps", value)}
                        placeholder="Reps"
                        coordinate={{ 
                          rowIndex: exerciseIndex, 
                          columnName: "reps", 
                          exerciseId: exercise.id,
                          setIndex: setIndex
                        }}
                        columnName="reps"
                        repType={repType}
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
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.weight}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "weight", value)}
                        placeholder="Weight"
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
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.rpe}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rpe", value)}
                        placeholder="RPE"
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
                    
                    <td className="border border-muted-foreground/20 p-2">
                      <EditableSetCell
                        value={set.rest}
                        onChange={(value) => handleSetCellChange(exercise.id, set.id, "rest", value)}
                        placeholder="Rest"
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
                    
                    <td className="border border-muted-foreground/20 p-2"></td>
                    
                    <td className="border border-muted-foreground/20 p-2">
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
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkoutTable;
