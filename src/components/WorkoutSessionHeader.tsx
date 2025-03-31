
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SaveWorkoutButton from "./SaveWorkoutButton";

interface WorkoutSessionHeaderProps {
  sessionId: string;
}

const WorkoutSessionHeader: React.FC<WorkoutSessionHeaderProps> = ({ sessionId }) => {
  const { program, updateWorkout, updateWorkoutName, addExercise } = useWorkout();
  
  const session = program?.workouts.find((s) => s.id === sessionId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState(session?.name || "");
  
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutName(event.target.value);
  };
  
  const handleNameBlur = () => {
    if (workoutName.trim() && workoutName !== session?.name) {
      updateWorkoutName(sessionId, workoutName);
    }
    setIsEditing(false);
  };
  
  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (workoutName.trim() && workoutName !== session?.name) {
        updateWorkoutName(sessionId, workoutName);
      }
      setIsEditing(false);
    }
  };
  
  const handleDayChange = (value: string) => {
    // Update the workout day property using the function form of updateWorkout
    if (session) {
      updateWorkout(sessionId, (workout) => {
        workout.day = parseInt(value, 10);
      });
    }
  };
  
  const handleAddExercise = () => {
    addExercise(sessionId);
  };
  
  if (!session) return null;
  
  return (
    <div className="p-4 border-b border-dark-300 bg-dark-300/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={workoutName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="text-lg font-semibold bg-dark-300"
              autoFocus
            />
          ) : (
            <h2
              className="text-xl font-semibold cursor-pointer hover:text-fitbloom-purple transition-colors"
              onClick={() => {
                setIsEditing(true);
                setWorkoutName(session.name);
              }}
            >
              {session.name}
            </h2>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <SaveWorkoutButton 
            workoutId={sessionId} 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          />
          
          <Button 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={handleAddExercise}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="day-select" className="text-sm whitespace-nowrap">
            Workout Day:
          </Label>
          <Select
            value={session.day.toString()}
            onValueChange={handleDayChange}
          >
            <SelectTrigger
              id="day-select"
              className="w-20 bg-dark-300"
            >
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent className="bg-dark-300 border-dark-400">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSessionHeader;
