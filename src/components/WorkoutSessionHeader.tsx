
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays,
  Plus,
  Copy,
  Trash,
  Save,
  PenLine
} from "lucide-react";
import { toast } from "sonner";

interface WorkoutSessionHeaderProps {
  sessionId: string;
}

const WorkoutSessionHeader: React.FC<WorkoutSessionHeaderProps> = ({ sessionId }) => {
  const { 
    program,
    addExerciseToWorkout,
    duplicateExercise,
    deleteWorkout,
    activeWeekId,
    setActiveWorkoutId,
    updateWorkoutName,
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata
  } = useWorkout();
  
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  
  if (!program || !activeWeekId) return null;
  
  const workout = program.workouts.find(s => s.id === sessionId);
  if (!workout) return null;
  
  const handleAddExercise = () => {
    addExerciseToWorkout(sessionId);
    toast.success("Exercise added");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this workout day?")) {
      deleteWorkout(activeWeekId, sessionId);
      
      // Select another workout in the same week
      const currentWeek = program.weeks.find(w => w.id === activeWeekId);
      if (currentWeek && currentWeek.workouts.length > 0) {
        const anotherWorkoutId = currentWeek.workouts[0];
        setActiveWorkoutId(anotherWorkoutId);
      } else {
        setActiveWorkoutId(null);
      }
      
      toast.success("Workout day deleted");
    }
  };
  
  const startEditing = () => {
    setWorkoutName(workout.name);
    setIsEditing(true);
  };
  
  const saveWorkoutName = () => {
    updateWorkoutName(sessionId, workoutName);
    setIsEditing(false);
    toast.success("Workout name updated");
  };
  
  return (
    <div className="p-4 border-b border-dark-300 bg-dark-300/20">
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center">
          <CalendarDays className="text-blue-500 h-5 w-5 mr-2" />
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-dark-300 border border-dark-400 rounded px-2 py-1 mr-2 text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveWorkoutName();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={saveWorkoutName}
                className="h-8"
              >
                Save
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
                className="h-8"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-lg font-semibold mr-2">
                Day {workout.day}: {workout.name}
              </h2>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={startEditing}
                className="h-8 opacity-50 hover:opacity-100"
              >
                <PenLine className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-dark-300 border-dark-400 text-gray-300 hover:bg-dark-400"
              onClick={() => createCircuit(sessionId)}
            >
              Add Circuit
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-dark-300 border-dark-400 text-gray-300 hover:bg-dark-400"
            onClick={handleAddExercise}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Exercise
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            className="bg-red-900/60 hover:bg-red-900 text-white"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSessionHeader;
