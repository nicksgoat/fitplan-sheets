
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Exercise } from "@/types/workout";
import { Plus, Save, Trash } from "lucide-react";
import EditableCell from "@/components/EditableCell";
import EditableSetCell from "@/components/EditableSetCell";
import { CellCoordinate } from "@/hooks/useCellNavigation";

interface CreateWorkoutSheetProps {
  weekId?: string;
}

const CreateWorkoutSheet: React.FC<CreateWorkoutSheetProps> = ({ weekId }) => {
  const { addSession } = useWorkout();

  const [sessionName, setSessionName] = useState("New Session");
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "new-exercise-1",
      name: "",
      sets: [
        {
          id: "new-set-1",
          reps: "",
          weight: "",
          intensity: "",
          rest: "",
        }
      ],
      notes: "",
    }
  ]);
  
  // State for tracking focused cell
  const [focusedCell, setFocusedCell] = useState<CellCoordinate | null>(null);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        id: `new-exercise-${exercises.length + 1}`,
        name: "",
        sets: [
          {
            id: `new-set-${exercises.length + 1}-1`,
            reps: "",
            weight: "",
            intensity: "",
            rest: "",
          }
        ],
        notes: "",
      }
    ]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const newSetId = `new-set-${exerciseIndex + 1}-${exercise.sets.length + 1}`;
    
    newExercises[exerciseIndex] = {
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          id: newSetId,
          reps: "",
          weight: "",
          intensity: "",
          rest: "",
        }
      ]
    };
    
    setExercises(newExercises);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (exercises.length > 1) {
      const newExercises = [...exercises];
      newExercises.splice(exerciseIndex, 1);
      setExercises(newExercises);
    }
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    
    if (exercise.sets.length > 1) {
      const newSets = [...exercise.sets];
      newSets.splice(setIndex, 1);
      newExercises[exerciseIndex] = {
        ...exercise,
        sets: newSets
      };
      setExercises(newExercises);
    }
  };

  const handleUpdateExerciseName = (exerciseIndex: number, value: string) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex] = {
      ...newExercises[exerciseIndex],
      name: value
    };
    setExercises(newExercises);
  };

  const handleUpdateSetValue = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof typeof exercises[0]["sets"][0],
    value: string
  ) => {
    const newExercises = [...exercises];
    const updatedSets = [...newExercises[exerciseIndex].sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value
    };
    
    newExercises[exerciseIndex] = {
      ...newExercises[exerciseIndex],
      sets: updatedSets
    };
    
    setExercises(newExercises);
  };
  
  const handleCellFocus = (coordinate: CellCoordinate) => {
    setFocusedCell(coordinate);
  };
  
  const handleCellNavigation = (
    direction: "up" | "down" | "left" | "right", 
    shiftKey: boolean
  ) => {
    if (!focusedCell) return;
    
    const { row, col, section, sectionIndex } = focusedCell;
    
    if (section === "exercise") {
      // Handle navigation for exercise name cells
      if (direction === "down") {
        if (exercises[row].sets.length > 0) {
          setFocusedCell({
            section: "set",
            sectionIndex: row,
            row: 0,
            col: 0
          });
        }
      } else if (direction === "up") {
        if (row > 0) {
          setFocusedCell({
            section: "exercise",
            sectionIndex: row - 1,
            row: row - 1,
            col: col
          });
        }
      }
    } else if (section === "set") {
      const currentExercise = exercises[sectionIndex];
      const setsCount = currentExercise.sets.length;
      
      if (direction === "up") {
        if (row > 0) {
          // Move to previous set
          setFocusedCell({
            section: "set",
            sectionIndex,
            row: row - 1,
            col
          });
        } else {
          // Move to exercise name
          setFocusedCell({
            section: "exercise",
            sectionIndex,
            row: sectionIndex,
            col: 0
          });
        }
      } else if (direction === "down") {
        if (row < setsCount - 1) {
          // Move to next set
          setFocusedCell({
            section: "set",
            sectionIndex,
            row: row + 1,
            col
          });
        } else if (sectionIndex < exercises.length - 1) {
          // Move to next exercise
          setFocusedCell({
            section: "exercise",
            sectionIndex: sectionIndex + 1,
            row: sectionIndex + 1,
            col: 0
          });
        }
      } else if (direction === "left" && col > 0) {
        // Move to previous column
        setFocusedCell({
          section: "set",
          sectionIndex,
          row,
          col: col - 1
        });
      } else if (direction === "right" && col < 3) {
        // Move to next column
        setFocusedCell({
          section: "set",
          sectionIndex,
          row,
          col: col + 1
        });
      }
    }
  };

  const handleSaveWorkout = () => {
    if (weekId) {
      addSession(weekId);
      // After adding session, reset the sheet
      setSessionName("New Session");
      setExercises([
        {
          id: "new-exercise-1",
          name: "",
          sets: [
            {
              id: "new-set-1",
              reps: "",
              weight: "",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
        }
      ]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SheetHeader className="px-6 py-4 border-b border-dark-300">
        <SheetTitle className="text-white">{sessionName}</SheetTitle>
      </SheetHeader>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4">
          <Label htmlFor="session-name">Session Name</Label>
          <Input
            id="session-name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="bg-dark-300 border-dark-400"
          />
        </div>
        
        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="exercise-block border border-dark-300 rounded-lg overflow-hidden">
              <div className="bg-dark-300 p-3 flex justify-between items-center">
                <div className="w-full">
                  <EditableCell
                    value={exercise.name}
                    onChange={(value) => handleUpdateExerciseName(exerciseIndex, value)}
                    placeholder="Exercise name"
                    className="font-medium"
                    coordinate={{
                      section: "exercise",
                      sectionIndex: exerciseIndex,
                      row: exerciseIndex,
                      col: 0
                    }}
                    isFocused={
                      focusedCell?.section === "exercise" && 
                      focusedCell.row === exerciseIndex
                    }
                    onFocus={handleCellFocus}
                    onNavigate={handleCellNavigation}
                    isExerciseName={true}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExercise(exerciseIndex)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-3">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse">
                    <thead>
                      <tr className="text-left text-xs text-gray-400">
                        <th className="p-2 w-16">#</th>
                        <th className="p-2">Reps</th>
                        <th className="p-2">Weight</th>
                        <th className="p-2">RPE</th>
                        <th className="p-2">Rest</th>
                        <th className="p-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set, setIndex) => (
                        <tr key={set.id} className="border-t border-dark-400">
                          <td className="p-2 text-gray-400">{setIndex + 1}</td>
                          <td className="p-2">
                            <EditableSetCell
                              value={set.reps}
                              onChange={(value) => 
                                handleUpdateSetValue(exerciseIndex, setIndex, "reps", value)
                              }
                              placeholder="12"
                              columnName="reps"
                              coordinate={{
                                section: "set",
                                sectionIndex: exerciseIndex,
                                row: setIndex,
                                col: 0
                              }}
                              isFocused={
                                focusedCell?.section === "set" && 
                                focusedCell.sectionIndex === exerciseIndex &&
                                focusedCell.row === setIndex && 
                                focusedCell.col === 0
                              }
                              onFocus={handleCellFocus}
                              onNavigate={handleCellNavigation}
                              repType="fixed"
                              onRepTypeChange={() => {}}
                              hideRepTypeSelector={true}
                            />
                          </td>
                          <td className="p-2">
                            <EditableSetCell
                              value={set.weight}
                              onChange={(value) => 
                                handleUpdateSetValue(exerciseIndex, setIndex, "weight", value)
                              }
                              placeholder="135"
                              columnName="weight"
                              coordinate={{
                                section: "set",
                                sectionIndex: exerciseIndex,
                                row: setIndex,
                                col: 1
                              }}
                              isFocused={
                                focusedCell?.section === "set" && 
                                focusedCell.sectionIndex === exerciseIndex &&
                                focusedCell.row === setIndex && 
                                focusedCell.col === 1
                              }
                              onFocus={handleCellFocus}
                              onNavigate={handleCellNavigation}
                              weightType="pounds"
                              onWeightTypeChange={() => {}}
                              hideWeightTypeSelector={true}
                            />
                          </td>
                          <td className="p-2">
                            <EditableSetCell
                              value={set.intensity}
                              onChange={(value) => 
                                handleUpdateSetValue(exerciseIndex, setIndex, "intensity", value)
                              }
                              placeholder="8"
                              columnName="intensity"
                              coordinate={{
                                section: "set",
                                sectionIndex: exerciseIndex,
                                row: setIndex,
                                col: 2
                              }}
                              isFocused={
                                focusedCell?.section === "set" && 
                                focusedCell.sectionIndex === exerciseIndex &&
                                focusedCell.row === setIndex && 
                                focusedCell.col === 2
                              }
                              onFocus={handleCellFocus}
                              onNavigate={handleCellNavigation}
                              intensityType="rpe"
                              onIntensityTypeChange={() => {}}
                              hideIntensityTypeSelector={true}
                            />
                          </td>
                          <td className="p-2">
                            <EditableCell
                              value={set.rest}
                              onChange={(value) => 
                                handleUpdateSetValue(exerciseIndex, setIndex, "rest", value)
                              }
                              placeholder="60s"
                              coordinate={{
                                section: "set",
                                sectionIndex: exerciseIndex,
                                row: setIndex,
                                col: 3
                              }}
                              isFocused={
                                focusedCell?.section === "set" && 
                                focusedCell.sectionIndex === exerciseIndex &&
                                focusedCell.row === setIndex && 
                                focusedCell.col === 3
                              }
                              onFocus={handleCellFocus}
                              onNavigate={handleCellNavigation}
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                              className="h-6 w-6 text-gray-400 hover:text-gray-200"
                              disabled={exercise.sets.length <= 1}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSet(exerciseIndex)}
                  className="mt-3 border-dark-400 text-gray-300"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Set
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline"

          className="mt-4 border-dark-400 text-gray-300"
          onClick={handleAddExercise}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Exercise
        </Button>
      </div>
      
      <div className="border-t border-dark-300 px-6 py-4 flex justify-end gap-2">
        <SheetClose asChild>
          <Button variant="outline" className="border-dark-400 text-gray-300">
            Cancel
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button onClick={handleSaveWorkout}>
            <Save className="h-4 w-4 mr-2" /> Save Workout
          </Button>
        </SheetClose>
      </div>
    </div>
  );
};

export default CreateWorkoutSheet;
