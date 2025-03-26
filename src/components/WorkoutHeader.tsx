
import React from "react";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";
import { 
  PlusCircle, 
  RefreshCw, 
  Layers, 
  Save, 
  Library, 
  FolderDown,
  CalendarDays,
  CalendarWeek
} from "lucide-react";
import WorkoutLibraryDialog from "./WorkoutLibraryDialog";

const WorkoutHeader: React.FC = () => {
  const { 
    addSession, 
    addWeek,
    resetProgram, 
    loadSampleProgram, 
    saveToLibrary,
    importSession,
    importProgram
  } = useWorkout();
  
  return (
    <header className="sticky top-0 z-10 glass-panel p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-medium">FitPlan Sheets</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => saveToLibrary("program")}
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save Program</span>
          <span className="sm:hidden">Save</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => saveToLibrary("session")}
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save Session</span>
          <span className="sm:hidden">Save</span>
        </Button>
        
        <WorkoutLibraryDialog 
          mode="session" 
          onImportSession={importSession}
          trigger={
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">Import Session</span>
              <span className="sm:hidden">Import</span>
            </Button>
          }
        />
        
        <WorkoutLibraryDialog 
          mode="program" 
          onImportProgram={importProgram}
          trigger={
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FolderDown className="h-4 w-4" />
              <span className="hidden sm:inline">Import Program</span>
              <span className="sm:hidden">Import</span>
            </Button>
          }
        />
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => loadSampleProgram()}
        >
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Load Sample</span>
          <span className="sm:hidden">Sample</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => resetProgram()}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1 mr-1"
          onClick={() => addSession()}
        >
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Add Session</span>
          <span className="sm:hidden">Add</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => addWeek()}
        >
          <CalendarWeek className="h-4 w-4" />
          <span className="hidden sm:inline">Add Week</span>
          <span className="sm:hidden">Week</span>
        </Button>
      </div>
    </header>
  );
};

export default WorkoutHeader;
