
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { toast } from "sonner";
import { ClubShareSelection } from "./ClubShareSelection";
import { useShareWithClubs } from "@/hooks/useClubSharing";

interface SaveWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string;
}

const SaveWorkoutDialog = ({ open, onOpenChange, workoutId }: SaveWorkoutDialogProps) => {
  const { program } = useWorkout();
  const { saveWorkout } = useLibrary();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const shareWithClubsMutation = useShareWithClubs();
  
  // Get the current workout
  const workout = program?.workouts.find(w => w.id === workoutId);
  
  const handleSave = async () => {
    if (!workout) {
      toast.error("Workout not found");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Please enter a name for this workout");
      return;
    }
    
    setSaving(true);
    
    try {
      // Create a copy of the workout with the new name
      const workoutToSave = {
        ...workout,
        name: name.trim()
      };
      
      // Save to library using the context
      const result = await saveWorkout(workoutToSave);
      
      // Check if we got a valid result (string ID)
      if (typeof result === 'string' && result) {
        const savedId = result;
        
        // If workout was saved successfully and clubs are selected, share with clubs
        if (selectedClubs.length > 0) {
          await shareWithClubsMutation.mutateAsync({
            contentId: savedId,
            contentType: 'workout',
            clubIds: selectedClubs
          });
        }
        
        onOpenChange(false);
        toast.success("Workout saved successfully");
      } else {
        toast.error("Failed to save workout");
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save workout");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-dark-200 text-white border-dark-300">
        <DialogHeader>
          <DialogTitle>Save Workout to Library</DialogTitle>
          <DialogDescription className="text-gray-400">
            This workout will be saved to your library for future use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              placeholder="Enter workout name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-dark-300 border-dark-400"
              defaultValue={workout?.name || ""}
            />
          </div>
          
          <div className="pt-2">
            <ClubShareSelection
              contentType="workout"
              selectedClubIds={selectedClubs}
              onSelectionChange={setSelectedClubs}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !name.trim()}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            {saving ? "Saving..." : "Save to Library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWorkoutDialog;
