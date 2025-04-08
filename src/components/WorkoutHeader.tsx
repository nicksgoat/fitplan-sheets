
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";
import { PlusCircle, RefreshCw, Layers, Library } from "lucide-react";
import { SaveAll } from "lucide-react";
import { toast } from "sonner";
import { SaveProgramDialog } from "./workout/header/SaveProgramDialog";
import { LibraryDrawer } from "./workout/header/LibraryDrawer";
import { EditItemDialog } from "./workout/header/EditItemDialog";
import { DeleteDialog } from "./workout/header/DeleteDialog";

const WorkoutHeader: React.FC = () => {
  const { 
    addWorkout, 
    activeWeekId, 
    resetProgram, 
    loadSampleProgram,
    updateWorkoutName,
    updateWeekName,
  } = useWorkout();

  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState<{id: string, type: string, name: string} | null>(null);

  const handleDeleteFromLibrary = () => {
    if (!itemToDelete) return;
    setItemToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleRenameItem = (newName: string) => {
    if (!isEditingName) return;
    
    if (isEditingName.type === "workout") {
      updateWorkoutName(isEditingName.id, newName);
    } else if (isEditingName.type === "week") {
      updateWeekName(isEditingName.id, newName);
    }
    
    setIsEditingName(null);
  };
  
  return (
    <header className="sticky top-0 z-10 glass-panel p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-medium">FitPlan Sheets</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
          onClick={() => setIsProgramDialogOpen(true)}
        >
          <SaveAll className="h-4 w-4" />
          <span>Save Program</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsLibraryOpen(true)}
        >
          <Library className="h-4 w-4" />
          <span>Library</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => loadSampleProgram()}
        >
          <Layers className="h-4 w-4" />
          <span>Load Sample</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => resetProgram()}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => activeWeekId ? addWorkout(activeWeekId) : null}
          disabled={!activeWeekId}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Session</span>
        </Button>
      </div>
      
      <SaveProgramDialog 
        open={isProgramDialogOpen} 
        onOpenChange={setIsProgramDialogOpen} 
      />

      <LibraryDrawer
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
      />
      
      <EditItemDialog
        open={isEditingName !== null}
        onOpenChange={(open) => !open && setIsEditingName(null)}
        initialName={isEditingName?.name || ""}
        onSave={handleRenameItem}
        itemType={isEditingName?.type as "workout" | "week"}
      />
      
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteFromLibrary}
      />
    </header>
  );
};

export default WorkoutHeader;
