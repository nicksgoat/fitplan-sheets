
import React, { useState, useEffect, useRef } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import CircuitControls from "./CircuitControls";

interface WorkoutSessionHeaderProps {
  sessionId: string;
}

const WorkoutSessionHeader: React.FC<WorkoutSessionHeaderProps> = ({ sessionId }) => {
  const { program, updateWorkoutName, addExercise, deleteWorkout } = useWorkout();
  const workout = program.workouts.find((s) => s.id === sessionId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(workout?.name || "");
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (workout) {
      setTitle(workout.name);
    }
  }, [workout]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (workout && title.trim() !== "") {
      updateWorkoutName(sessionId, title);
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(workout?.name || "");
    }
  };
  
  if (!workout) return null;
  
  return (
    <div className="session-header flex justify-between mb-4">
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <h2 className="text-lg font-medium flex items-center">
            {title || `Day ${workout.day} Session`}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-6 w-6 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </h2>
        ) : (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className={cn(
                "bg-white rounded-md px-2 py-1 text-base",
                "border border-border focus:border-primary focus:ring-1 focus:ring-primary",
                "w-[200px]"
              )}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={`Day ${workout.day} Session`}
            />
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="text-xs text-muted-foreground">Day {workout.day}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <CircuitControls sessionId={sessionId} />
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => addExercise(sessionId)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Exercise
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => deleteWorkout(sessionId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WorkoutSessionHeader;
