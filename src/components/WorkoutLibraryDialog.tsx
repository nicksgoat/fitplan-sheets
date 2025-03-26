
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckIcon, LibraryIcon, FolderIcon } from "lucide-react";
import { WorkoutProgram, WorkoutSession } from "@/types/workout";

type LibraryItem = {
  id: string;
  name: string;
  type: "program" | "session";
  data: WorkoutProgram | WorkoutSession;
};

interface WorkoutLibraryDialogProps {
  onImportSession?: (session: WorkoutSession) => void;
  onImportProgram?: (program: WorkoutProgram) => void;
  mode: "session" | "program";
  trigger: React.ReactNode;
}

const WorkoutLibraryDialog: React.FC<WorkoutLibraryDialogProps> = ({ 
  onImportSession, 
  onImportProgram, 
  mode,
  trigger 
}) => {
  const { workoutLibrary } = useWorkout();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  
  const handleImport = () => {
    if (!selected) return;
    
    const item = workoutLibrary.find(item => item.id === selected);
    if (!item) return;
    
    if (mode === "session" && onImportSession && item.type === "session") {
      onImportSession(item.data as WorkoutSession);
      setOpen(false);
    } else if (mode === "program" && onImportProgram && item.type === "program") {
      onImportProgram(item.data as WorkoutProgram);
      setOpen(false);
    }
  };
  
  const filteredLibrary = workoutLibrary.filter(item => 
    mode === "session" ? item.type === "session" : item.type === "program"
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "session" ? "Import Session" : "Import Program"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder={`Search ${mode === "session" ? "sessions" : "programs"}...`} />
            <CommandList>
              <CommandEmpty>No {mode === "session" ? "sessions" : "programs"} found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-72">
                  {filteredLibrary.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Your library is empty. Save some {mode === "session" ? "sessions" : "programs"} first.
                    </div>
                  ) : (
                    filteredLibrary.map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => setSelected(item.id)}
                        className="flex items-center gap-2 px-4 py-2"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {item.type === "program" ? (
                            <FolderIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <LibraryIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{item.name}</span>
                        </div>
                        {selected === item.id && (
                          <CheckIcon className="h-4 w-4" />
                        )}
                      </CommandItem>
                    ))
                  )}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!selected}>
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutLibraryDialog;
