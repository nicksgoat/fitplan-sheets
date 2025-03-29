
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import SaveWorkoutDialog from "./SaveWorkoutDialog";

interface WorkoutSessionHeaderProps {
  sessionId: string;
}

const WorkoutSessionHeader: React.FC<WorkoutSessionHeaderProps> = ({ sessionId }) => {
  const { program, updateWorkout } = useWorkout();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  if (!program) return null;
  
  const session = program.workouts.find((s) => s.id === sessionId);
  
  if (!session) return null;
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWorkout(sessionId, (draft) => {
      draft.name = e.target.value;
    });
  };
  
  return (
    <div className="p-4 border-b border-dark-300 flex justify-between items-center">
      <div className="flex-1">
        <input
          type="text"
          value={session.name}
          onChange={handleNameChange}
          className="bg-transparent border-none outline-none text-white text-xl font-semibold focus:ring-1 focus:ring-purple-500 px-2 py-1 rounded w-full"
          placeholder="Workout Name"
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-white border-gray-600 hover:bg-dark-300"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="h-4 w-4 mr-2" />
          Save to Library
        </Button>
      </div>
      
      <SaveWorkoutDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        workoutId={sessionId}
      />
    </div>
  );
};

export default WorkoutSessionHeader;
