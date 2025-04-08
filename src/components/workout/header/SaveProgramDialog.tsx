
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaveAll, Save } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { toast } from "sonner";

interface SaveProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaveProgramDialog = ({ open, onOpenChange }: SaveProgramDialogProps) => {
  const [programName, setProgramName] = useState("");
  const { program } = useWorkout();
  const { saveProgram } = useLibrary();

  const handleSaveProgramToLibrary = () => {
    if (programName) {
      saveProgram(program!, programName);
      setProgramName("");
      onOpenChange(false);
      toast.success(`Program "${programName}" saved to library`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Your Program to Library</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="program-name" className="text-right">
              Program Name
            </Label>
            <Input
              id="program-name"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="col-span-3"
              autoFocus
              placeholder="My Awesome Program"
            />
          </div>
          <div className="col-span-4">
            <p className="text-sm text-muted-foreground">
              This will save your entire program with all weeks and workouts
              to your library. You can access it from the Library page.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSaveProgramToLibrary}
            disabled={!programName}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
