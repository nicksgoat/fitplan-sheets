
import React from "react";
import { 
  Save, 
  Plus, 
  BookOpen, 
  RotateCcw, 
  Settings,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EditableTitle from "./EditableTitle";
import WorkoutLibrary from "./WorkoutLibrary";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useState } from "react";

const WorkoutHeader: React.FC = () => {
  const { 
    program, 
    resetProgram, 
    loadSampleProgram,
    saveSessionToLibrary,
    saveWeekToLibrary,
    saveProgramToLibrary,
    activeSessionId,
    activeWeekId
  } = useWorkout();
  
  const [saveName, setSaveName] = useState("");
  const [saveType, setSaveType] = useState<"workout" | "week" | "program">("workout");

  const handleSave = () => {
    if (!saveName.trim()) return;
    
    switch (saveType) {
      case "workout":
        if (activeSessionId) {
          saveSessionToLibrary(activeSessionId, saveName);
        }
        break;
      case "week":
        if (activeWeekId) {
          saveWeekToLibrary(activeWeekId, saveName);
        }
        break;
      case "program":
        saveProgramToLibrary(saveName);
        break;
    }
    
    setSaveName("");
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">
          <EditableTitle 
            value={program.name}
            onSave={(newName) => {
              // TODO: Implement program name update
              console.log("Program name updated:", newName);
            }}
          />
        </h1>
        <p className="text-muted-foreground">
          {program.weeks.length} {program.weeks.length === 1 ? "week" : "weeks"} • 
          {program.sessions.length} {program.sessions.length === 1 ? "workout" : "workouts"}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save to Library</DialogTitle>
              <DialogDescription>
                Save your workout content to reuse it later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="save-type" className="text-right">
                  Type
                </Label>
                <select 
                  id="save-type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={saveType}
                  onChange={(e) => setSaveType(e.target.value as any)}
                >
                  <option value="workout">Current Workout</option>
                  <option value="week">Current Week</option>
                  <option value="program">Entire Program</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter a name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={!saveName.trim()}>
                <BookOpen className="h-4 w-4 mr-2" />
                Save to Library
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <WorkoutLibrary />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Empty Program
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create New Program</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your current program. Are you sure?
                    Unsaved changes will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetProgram}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Download className="h-4 w-4 mr-2" />
                  Load Sample Program
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Load Sample Program</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace your current program with a sample workout program.
                    Unsaved changes will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={loadSampleProgram}>Load Sample</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <DropdownMenuItem disabled>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default WorkoutHeader;
