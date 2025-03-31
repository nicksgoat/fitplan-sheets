
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { addWorkoutToLibrary } from "@/utils/presets";
import { toast } from "sonner";
import SaveWorkoutDialog from "./SaveWorkoutDialog";

interface SaveWorkoutButtonProps {
  workoutId?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const SaveWorkoutButton: React.FC<SaveWorkoutButtonProps> = ({ 
  workoutId, 
  variant = "default",
  size = "default",
  className = ""
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { program, activeWorkoutId } = useWorkout();
  
  // Use provided workoutId or active workout ID
  const targetWorkoutId = workoutId || activeWorkoutId;
  
  const handleClick = () => {
    if (!program || !targetWorkoutId) {
      toast.error("No workout selected");
      return;
    }
    
    const workout = program.workouts.find(w => w.id === targetWorkoutId);
    if (!workout) {
      toast.error("Could not find the selected workout");
      return;
    }
    
    // Open dialog to name and save the workout
    setDialogOpen(true);
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
      >
        <Save className="h-4 w-4 mr-2" />
        Save to Library
      </Button>

      <SaveWorkoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workoutId={targetWorkoutId || ""}
      />
    </>
  );
};

export default SaveWorkoutButton;
