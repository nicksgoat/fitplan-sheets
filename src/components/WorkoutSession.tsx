
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import WorkoutSessionHeader from "./WorkoutSessionHeader";
import WorkoutTable from "./WorkoutTable";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAuth } from "@/hooks/useAuth";

interface WorkoutSessionProps {
  sessionId: string;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ sessionId }) => {
  const { program } = useWorkout();
  const { saveWorkout } = useLibrary();
  const { user } = useAuth();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  if (!program || !program.workouts) return null;
  
  const session = program.workouts.find((s) => s.id === sessionId);
  
  if (!session) return null;
  
  const handleSaveToLibrary = () => {
    if (!user) {
      toast.error("Please sign in to save workouts to your library");
      return;
    }
    
    // Set initial name from current workout
    setWorkoutName(session.name);
    setSaveDialogOpen(true);
  };
  
  const handleConfirmSave = async () => {
    if (!workoutName.trim()) {
      toast.error("Please enter a name for your workout");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveWorkout(session, workoutName);
      toast.success("Workout saved to database library");
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save workout to library");
    } finally {
      setIsSaving(false);
      setSaveDialogOpen(false);
    }
  };
  
  return (
    <div className="session-card bg-dark-200 border border-dark-300 rounded-lg overflow-hidden shadow-md">
      <WorkoutSessionHeader sessionId={sessionId} />
      <div className="p-4 border-b border-dark-300 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-300 border-gray-600 hover:bg-dark-300"
          onClick={handleSaveToLibrary}
          disabled={!user}
        >
          <BookmarkPlus className="h-4 w-4 mr-2" />
          Save to Library
        </Button>
      </div>
      <WorkoutTable session={session} />
      
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-dark-200 text-white border-dark-300">
          <DialogHeader>
            <DialogTitle>Save Workout to Library</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for this workout to save it to your library.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="workout-name" className="text-white">Workout Name</Label>
            <Input 
              id="workout-name"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="bg-dark-100 border-dark-300 text-white"
              placeholder="e.g., Upper Body Strength"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSaveDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              onClick={handleConfirmSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutSession;
