
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkout } from "@/contexts/WorkoutContext";
import { addWorkoutToLibrary } from "@/utils/presets";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface SaveWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string;
}

const SaveWorkoutDialog = ({ open, onOpenChange, workoutId }: SaveWorkoutDialogProps) => {
  const { program } = useWorkout();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Get the current workout
  const workout = program?.workouts.find(w => w.id === workoutId);
  
  const handleSave = () => {
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
        name: name.trim(),
        isPublic: isPublic,
        userId: user?.id,
        creator: user?.email || "Anonymous",
        savedAt: new Date().toISOString()
      };
      
      // Save to local library
      addWorkoutToLibrary(workoutToSave);
      
      toast.success(`Workout saved ${isPublic ? 'to public library' : 'to your library'}`);
      onOpenChange(false);
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
          <DialogTitle>Save Workout</DialogTitle>
          <DialogDescription className="text-gray-400">
            This workout will be saved for future use.
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
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="public-switch" className="text-sm">
              Make this workout public
            </Label>
            <Switch
              id="public-switch"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          
          {isPublic && !user && (
            <p className="text-amber-400 text-sm">
              Note: You're not logged in. Your workout will be saved publicly but anonymously.
            </p>
          )}
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
            {saving ? "Saving..." : isPublic ? "Publish to Library" : "Save to Library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWorkoutDialog;
