
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";
import { PlusCircle, RefreshCw, Layers, Library, Music, AlbumIcon, ListMusic, FileText, Disc, X, GripVertical, Edit, Trash2, Save, Database } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkoutSession, WorkoutWeek, WorkoutProgram } from "@/types/workout";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const WorkoutHeader: React.FC = () => {
  const { 
    addSession, 
    activeWeekId, 
    activeSessionId,
    resetProgram, 
    loadSampleProgram,
    saveSessionToLibrary,
    saveWeekToLibrary,
    saveProgramToLibrary,
    loadSessionFromLibrary,
    loadWeekFromLibrary,
    loadProgramFromLibrary,
    getSessionLibrary,
    getWeekLibrary,
    getProgramLibrary,
    removeSessionFromLibrary,
    removeWeekFromLibrary,
    removeProgramFromLibrary,
    program,
    updateSessionName,
    updateWeekName,
  } = useWorkout();
  
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [libraryItemName, setLibraryItemName] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeLibraryTab, setActiveLibraryTab] = useState<"workouts" | "weeks" | "programs">("workouts");
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState<{id: string, type: string, name: string} | null>(null);
  
  // Get library data
  const workoutLibrary = getSessionLibrary();
  const weekLibrary = getWeekLibrary();
  const programLibrary = getProgramLibrary();

  // Function to handle drag start
  const handleDragStart = (e: React.DragEvent, item: any, type: string) => {
    setDraggedItem({...item, type});
    e.dataTransfer.setData("application/json", JSON.stringify({id: item.id, type}));
    e.dataTransfer.effectAllowed = "move";
  };

  // Function to handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Function to handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!activeWeekId) return;
    
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    
    try {
      const { id, type } = JSON.parse(data);
      
      if (type === "workout") {
        const workout = workoutLibrary.find(w => w.id === id);
        if (workout) {
          loadSessionFromLibrary(workout, activeWeekId);
        }
      } else if (type === "week") {
        const week = weekLibrary.find(w => w.id === id);
        if (week) {
          loadWeekFromLibrary(week);
        }
      } else if (type === "program") {
        const prog = programLibrary.find(p => p.id === id);
        if (prog) {
          loadProgramFromLibrary(prog);
        }
      }
    } catch (error) {
      console.error("Error parsing drag data:", error);
    }
  };

  // Function to handle saving a workout to library
  const handleSaveWorkoutToLibrary = () => {
    if (activeSessionId && libraryItemName) {
      saveSessionToLibrary(activeSessionId, libraryItemName);
      setLibraryItemName("");
      setIsWorkoutDialogOpen(false);
    }
  };
  
  // Function to handle saving a week to library
  const handleSaveWeekToLibrary = () => {
    if (activeWeekId && libraryItemName) {
      saveWeekToLibrary(activeWeekId, libraryItemName);
      setLibraryItemName("");
      setIsWeekDialogOpen(false);
    }
  };
  
  // Function to handle saving a program to library
  const handleSaveProgramToLibrary = () => {
    if (libraryItemName) {
      saveProgramToLibrary(libraryItemName);
      setLibraryItemName("");
      setIsProgramDialogOpen(false);
    }
  };

  // Function to handle deleting an item from library
  const handleDeleteFromLibrary = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === "workout") {
      removeSessionFromLibrary(itemToDelete.id);
    } else if (itemToDelete.type === "week") {
      removeWeekFromLibrary(itemToDelete.id);
    } else if (itemToDelete.type === "program") {
      removeProgramFromLibrary(itemToDelete.id);
    }
    
    setItemToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Function to handle renaming an item
  const handleRenameItem = () => {
    if (!isEditingName) return;
    
    if (isEditingName.type === "session" && isEditingName.id === activeSessionId) {
      updateSessionName(isEditingName.id, isEditingName.name);
    } else if (isEditingName.type === "week" && isEditingName.id === activeWeekId) {
      updateWeekName(isEditingName.id, isEditingName.name);
    }
    
    setIsEditingName(null);
  };

  // Handle click on session tab when already selected (for renaming)
  const handleSessionTabClick = (sessionId: string) => {
    if (sessionId === activeSessionId) {
      const session = program.sessions.find(s => s.id === sessionId);
      if (session) {
        setIsEditingName({
          id: sessionId,
          type: "session",
          name: session.name
        });
      }
    }
  };

  // Handle click on week tab when already selected (for renaming)
  const handleWeekTabClick = (weekId: string) => {
    if (weekId === activeWeekId) {
      const week = program.weeks.find(w => w.id === weekId);
      if (week) {
        setIsEditingName({
          id: weekId,
          type: "week",
          name: week.name
        });
      }
    }
  };
  
  // Use mobile detection to determine if we should use Drawer instead of Sheet for library
  const isMobile = window.innerWidth < 768;
  
  const LibraryComponent = isMobile ? Drawer : Sheet;
  const LibraryTrigger = isMobile ? DrawerTrigger : SheetTrigger;
  const LibraryContent = isMobile ? DrawerContent : SheetContent;
  const LibraryHeader = isMobile ? DrawerHeader : SheetHeader;
  const LibraryTitle = isMobile ? DrawerTitle : SheetTitle;
  const LibraryClose = isMobile ? DrawerClose : SheetClose;
  
  return (
    <header className="sticky top-0 z-10 glass-panel p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-medium">FitPlan Sheets</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Library Button */}
        <LibraryComponent>
          <LibraryTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Library className="h-4 w-4" />
              <span>Library</span>
            </Button>
          </LibraryTrigger>
          <LibraryContent className="sm:max-w-md" side="right">
            <LibraryHeader>
              <LibraryTitle>Your Fitness Library</LibraryTitle>
            </LibraryHeader>

            <div className="mt-4">
              <div className="flex items-center border-b">
                <button 
                  onClick={() => setActiveLibraryTab("workouts")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeLibraryTab === "workouts" ? "border-b-2 border-primary" : ""
                  )}
                >
                  <ListMusic className="h-4 w-4 mr-2 inline-block" />
                  Workouts
                </button>
                <button 
                  onClick={() => setActiveLibraryTab("weeks")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeLibraryTab === "weeks" ? "border-b-2 border-primary" : ""
                  )}
                >
                  <FileText className="h-4 w-4 mr-2 inline-block" />
                  Weeks
                </button>
                <button 
                  onClick={() => setActiveLibraryTab("programs")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeLibraryTab === "programs" ? "border-b-2 border-primary" : ""
                  )}
                >
                  <AlbumIcon className="h-4 w-4 mr-2 inline-block" />
                  Programs
                </button>
              </div>

              <div className="p-4 h-[50vh] overflow-y-auto">
                {activeLibraryTab === "workouts" && (
                  <div>
                    <h3 className="font-medium mb-2">Workout Playlists</h3>
                    {workoutLibrary.length > 0 ? (
                      <div className="space-y-2">
                        {workoutLibrary.map((workout) => (
                          <div 
                            key={workout.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, workout, "workout")}
                            className="flex items-center p-2 border rounded-md hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4 mr-2 text-gray-400" />
                            <ListMusic className="h-4 w-4 mr-2" />
                            <span className="flex-1">{workout.name}</span>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (activeWeekId) {
                                    loadSessionFromLibrary(workout, activeWeekId);
                                  }
                                }}
                                disabled={!activeWeekId}
                                className="h-8 w-8"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setItemToDelete({id: workout.id, type: "workout"});
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No workouts saved yet</p>
                    )}
                  </div>
                )}

                {activeLibraryTab === "weeks" && (
                  <div>
                    <h3 className="font-medium mb-2">Training Weeks</h3>
                    {weekLibrary.length > 0 ? (
                      <div className="space-y-2">
                        {weekLibrary.map((week) => (
                          <div 
                            key={week.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, week, "week")}
                            className="flex items-center p-2 border rounded-md hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4 mr-2 text-gray-400" />
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="flex-1">{week.name}</span>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => loadWeekFromLibrary(week)}
                                className="h-8 w-8"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setItemToDelete({id: week.id, type: "week"});
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No training weeks saved yet</p>
                    )}
                  </div>
                )}

                {activeLibraryTab === "programs" && (
                  <div>
                    <h3 className="font-medium mb-2">Training Programs</h3>
                    {programLibrary.length > 0 ? (
                      <div className="space-y-2">
                        {programLibrary.map((program) => (
                          <div 
                            key={program.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, program, "program")}
                            className="flex items-center p-2 border rounded-md hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4 mr-2 text-gray-400" />
                            <AlbumIcon className="h-4 w-4 mr-2" />
                            <span className="flex-1">{program.name}</span>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => loadProgramFromLibrary(program)}
                                className="h-8 w-8"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setItemToDelete({id: program.id, type: "program"});
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No training programs saved yet</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <h3 className="font-medium mb-2">Add to Library</h3>
                <div className="flex flex-col gap-2">
                  {/* Save Current Workout */}
                  <Dialog open={isWorkoutDialogOpen} onOpenChange={setIsWorkoutDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-start"
                        disabled={!activeSessionId}
                      >
                        <ListMusic className="h-4 w-4 mr-2" />
                        <span>Save Current Workout</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Workout to Library</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="workout-name" className="text-right">
                            Workout Name
                          </Label>
                          <Input
                            id="workout-name"
                            value={libraryItemName}
                            onChange={(e) => setLibraryItemName(e.target.value)}
                            className="col-span-3"
                            autoFocus
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleSaveWorkoutToLibrary}
                          disabled={!libraryItemName}
                        >
                          Add to Library
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Save Current Week */}
                  <Dialog open={isWeekDialogOpen} onOpenChange={setIsWeekDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-start"
                        disabled={!activeWeekId}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Save Current Week</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Training Week to Library</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="week-name" className="text-right">
                            Week Name
                          </Label>
                          <Input
                            id="week-name"
                            value={libraryItemName}
                            onChange={(e) => setLibraryItemName(e.target.value)}
                            className="col-span-3"
                            autoFocus
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleSaveWeekToLibrary}
                          disabled={!libraryItemName}
                        >
                          Add to Library
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Save Current Program */}
                  <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-start"
                      >
                        <AlbumIcon className="h-4 w-4 mr-2" />
                        <span>Save Current Program</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Training Program to Library</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="program-name" className="text-right">
                            Program Name
                          </Label>
                          <Input
                            id="program-name"
                            value={libraryItemName}
                            onChange={(e) => setLibraryItemName(e.target.value)}
                            className="col-span-3"
                            autoFocus
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleSaveProgramToLibrary}
                          disabled={!libraryItemName}
                        >
                          Add to Library
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </LibraryContent>
        </LibraryComponent>
        
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
          onClick={() => activeWeekId ? addSession(activeWeekId) : null}
          disabled={!activeWeekId}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Session</span>
        </Button>
      </div>
      
      {/* Rename Dialog */}
      <Dialog 
        open={isEditingName !== null} 
        onOpenChange={(open) => !open && setIsEditingName(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Rename {isEditingName?.type === "session" ? "Workout" : "Week"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={isEditingName?.name || ""}
              onChange={(e) => setIsEditingName(prev => prev ? {...prev, name: e.target.value} : null)}
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleRenameItem}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFromLibrary}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default WorkoutHeader;
