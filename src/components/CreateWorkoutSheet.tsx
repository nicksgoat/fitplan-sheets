
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkout } from "@/contexts/WorkoutContext";
import { WorkoutSession } from "@/types/workout";
import { toast } from "sonner";

const CreateWorkoutSheet = () => {
  const { activeWeekId, addSession } = useWorkout();
  const [sessionName, setSessionName] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      toast.error("Session name is required");
      return;
    }

    if (!activeWeekId) {
      toast.error("No active week selected");
      return;
    }

    const newSession: WorkoutSession = {
      id: uuidv4(),
      name: sessionName,
      day: 1,
      exercises: [],
      circuits: [],
      weekId: activeWeekId,
    };

    // Fixed: Correctly pass the activeWeekId and newSession to addSession
    addSession(activeWeekId, newSession);
    
    toast.success(`Session "${sessionName}" created`);
    setSessionName("");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="ml-2">
          New Session
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Session</SheetTitle>
          <SheetDescription>
            Add a new workout session to your program.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Upper Body, Leg Day"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" onClick={handleCreateSession}>
            Create Session
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateWorkoutSheet;
