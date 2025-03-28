import React, { useRef, useCallback } from "react";
import { WorkoutSession, Exercise, SetCellType, ExerciseCellType, Set } from "@/types/workout";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useCellNavigation, CellCoordinate } from "@/hooks/useCellNavigation";
import { 
  Table,
  TableBody,
} from "@/components/ui/table";
import WorkoutTableHeader from "./workout-table/WorkoutTableHeader";
import ExerciseRow from "./workout-table/ExerciseRow";
import CircuitRow from "./workout-table/CircuitRow";
import CircuitExerciseRow from "./workout-table/CircuitExerciseRow";
import SetRow from "./workout-table/SetRow";

interface WorkoutTableProps {
  session: WorkoutSession;
}

const exerciseColumnOrder: ExerciseCellType[] = ["name", "notes"];
const setColumnOrder: SetCellType[] = ["reps", "weight", "intensity", "rest"];

const WorkoutTable: React.FC<WorkoutTableProps> = ({ session }) => {
  const { 
    updateExercise, 
    updateSet,
    addExercise, 
    addSet,
    deleteSet,
    deleteExercise,
    addExerciseToCircuit,
    program
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
  
  const handleRepTypeChange = (exerciseId: string, repType: Exercise['repType']) => {
    updateExercise(session.id, exerciseId, { repType } as Partial<Exercise>);
    
    const exercise = session.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      exercise.sets.forEach(set => {
        updateSet(session.id, exerciseId, set.id, { repType } as Partial<Set>);
      });
    }
  };
  
  const handleIntensityTypeChange = (exerciseId: string, intensityType: Exercise['intensityType']) => {
    console.log("WorkoutTable: Setting exercise intensity type to:", intensityType);
    
    updateExercise(session.id, exerciseId, { intensityType } as Partial<Exercise>);
    
    const exercise = session.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      exercise.sets.forEach(set => {
        let updatedIntensity = set.intensity;
        
        const numMatch = set.intensity.match(/[0-9.]+/);
        const numValue = numMatch ? numMatch[0] : '';
        
        if (numValue) {
          if (intensityType === 'rpe') {
            updatedIntensity = `RPE ${numValue}`;
          } else if (intensityType === 'arpe') {
            updatedIntensity = `aRPE ${numValue}`;
          } else if (intensityType === 'percent') {
            updatedIntensity = `${numValue}%`;
          } else if (intensityType === 'velocity') {
            updatedIntensity = `${numValue} m/s`;
          } else {
            updatedIntensity = numValue;
          }
        }
        
        updateSet(session.id, exerciseId, set.id, { 
          intensityType,
          intensity: updatedIntensity
        } as Partial<Set>);
      });
    }
  };
  
  const handleSetIntensityTypeChange = (exerciseId: string, setId: string, intensityType: Set['intensityType']) => {
    updateSet(session.id, exerciseId, setId, { intensityType } as Partial<Set>);
  };
  
  const handleWeightTypeChange = (exerciseId: string, weightType: Exercise['weightType']) => {
    console.log("WorkoutTable: Setting exercise weight type to:", weightType);
    
    updateExercise(session.id, exerciseId, { weightType } as Partial<Exercise>);
    
    const exercise = session.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      const convertWeight = (weight: string, fromType: WeightType, toType: WeightType): string => {
        if (!weight || fromType === toType) return weight;
        
        const numMatch = weight.match(/[0-9.]+/);
        if (!numMatch) return weight;
        
        const numValue = parseFloat(numMatch[0]);
        if (isNaN(numValue)) return weight;
        
        if ((fromType === 'pounds' && toType === 'kilos')) {
          const kilos = Math.round(numValue / 2.20462 * 10) / 10;
          return `${kilos}`;
        } else if ((fromType === 'kilos' && toType === 'pounds')) {
          const pounds = Math.round(numValue * 2.20462 * 10) / 10;
          return `${pounds}`;
        }
        
        return `${numValue}`;
      };
      
      const fromType = exercise.weightType || 'pounds';
      
      exercise.sets.forEach(set => {
        const convertedWeight = convertWeight(set.weight, fromType, weightType);
        
        updateSet(session.id, exerciseId, set.id, { 
          weightType,
          weight: convertedWeight
        } as Partial<Set>);
      });
    }
  };
  
  const handleSetWeightTypeChange = (exerciseId: string, setId: string, weightType: Set['weightType']) => {
    updateSet(session.id, exerciseId, setId, { weightType } as Partial<Set>);
  };
  
  const handleCellFocus = useCallback((coordinate: CellCoordinate) => {
    focusCell(coordinate);
  }, [focusCell]);
  
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
  
  const handleAddExerciseToCircuit = (circuitId: string) => {
    addExercise(session.id, undefined, (newExerciseId) => {
      if (newExerciseId) {
        console.log("Adding exercise to circuit:", circuitId, newExerciseId);
        addExerciseToCircuit(session.id, circuitId, newExerciseId);
      }
    });
  };
  
  return (
    <div className="workout-container">
      <Table className="workout-table border-collapse w-full" ref={tableRef}>
        <WorkoutTableHeader />
        <TableBody>
          {organizedExercises.map((exercise, exerciseIndex) => {
            const isCircuit = exercise.isCircuit;
            const isInCircuit = exercise.isInCircuit;
            const circuitId = exercise.circuitId;
            
            const circuit = circuitId 
              ? (session.circuits || []).find(c => c.id === circuitId) 
              : undefined;
            
            return (
              <React.Fragment key={exercise.id}>
                {isCircuit && (
                  <CircuitRow 
                    exercise={exercise}
                    exerciseIndex={exerciseIndex}
                    circuit={circuit}
                    handleExerciseCellChange={handleExerciseCellChange}
                    isCellFocused={isCellFocused}
                    handleCellFocus={handleCellFocus}
                    handleExerciseCellNavigate={handleExerciseCellNavigate}
                    handleAddExerciseToCircuit={handleAddExerciseToCircuit}
                    deleteExercise={deleteExercise}
                    sessionId={session.id}
                  />
                )}
                
                {isInCircuit && (
                  <CircuitExerciseRow 
                    exercise={exercise}
                    exerciseIndex={exerciseIndex}
                    circuit={circuit}
                    isCellFocused={isCellFocused}
                    handleCellFocus={handleCellFocus}
                    handleExerciseCellNavigate={handleExerciseCellNavigate}
                    handleExerciseCellChange={handleExerciseCellChange}
                    sessionId={session.id}
                    deleteExercise={deleteExercise}
                    addSet={addSet}
                    handleSetCellNavigate={handleSetCellNavigate}
                    handleSetCellChange={handleSetCellChange}
                    handleSetIntensityTypeChange={handleSetIntensityTypeChange}
                    handleSetWeightTypeChange={handleSetWeightTypeChange}
                    handleRepTypeChange={handleRepTypeChange}
                    handleAddExerciseToCircuit={handleAddExerciseToCircuit}
                  />
                )}
                
                {!isCircuit && !isInCircuit && (
                  <ExerciseRow 
                    exercise={exercise}
                    exerciseIndex={exerciseIndex}
                    handleExerciseCellChange={handleExerciseCellChange}
                    isCellFocused={isCellFocused}
                    handleCellFocus={handleCellFocus}
                    handleExerciseCellNavigate={handleExerciseCellNavigate}
                    handleRepTypeChange={handleRepTypeChange}
                    handleIntensityTypeChange={handleIntensityTypeChange}
                    handleWeightTypeChange={handleWeightTypeChange}
                    addSet={addSet}
                    deleteExercise={deleteExercise}
                    sessionId={session.id}
                  />
                )}
                
                {!isCircuit && !isInCircuit && exercise.sets.map((set, setIndex) => (
                  <SetRow
                    key={`${exercise.id}-${set.id}`}
                    exercise={exercise}
                    set={set}
                    setIndex={setIndex}
                    exerciseIndex={exerciseIndex}
                    exerciseName={exercise.name}
                    handleSetCellChange={handleSetCellChange}
                    isCellFocused={isCellFocused}
                    handleCellFocus={handleCellFocus}
                    handleSetCellNavigate={handleSetCellNavigate}
                    handleSetIntensityTypeChange={handleSetIntensityTypeChange}
                    handleSetWeightTypeChange={handleSetWeightTypeChange}
                    handleRepTypeChange={handleRepTypeChange}
                    deleteSet={deleteSet}
                    sessionId={session.id}
                  />
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
