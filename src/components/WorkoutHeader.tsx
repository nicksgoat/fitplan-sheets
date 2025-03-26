
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";
import { PlusCircle, RefreshCw, Layers, Save, Database, Music, PlaySquare, Album } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { WorkoutSession, WorkoutWeek, WorkoutProgram } from "@/types/workout";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    removeProgramFromLibrary
  } = useWorkout();
  
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [libraryItemName, setLibraryItemName] = useState("");
  
  const sessionLibrary = getSessionLibrary();
  const weekLibrary = getWeekLibrary();
  const programLibrary = getProgramLibrary();
  
  const handleSaveSessionToLibrary = () => {
    if (activeSessionId && libraryItemName) {
      saveSessionToLibrary(activeSessionId, libraryItemName);
      setLibraryItemName("");
      setIsSessionDialogOpen(false);
    }
  };
  
  const handleSaveWeekToLibrary = () => {
    if (activeWeekId && libraryItemName) {
      saveWeekToLibrary(activeWeekId, libraryItemName);
      setLibraryItemName("");
      setIsWeekDialogOpen(false);
    }
  };
  
  const handleSaveProgramToLibrary = () => {
    if (libraryItemName) {
      saveProgramToLibrary(libraryItemName);
      setLibraryItemName("");
      setIsProgramDialogOpen(false);
    }
  };
  
  return (
    <header className="sticky top-0 z-10 glass-panel p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-medium">FitPlan Sheets</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Library Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Music className="h-4 w-4" />
              <span>Library</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Your Library</DropdownMenuLabel>
            
            {/* Workout Playlists (Sessions) */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PlaySquare className="h-4 w-4 mr-2" />
                <span>Workout Playlists</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {sessionLibrary.length > 0 ? (
                  sessionLibrary.map((session: WorkoutSession) => (
                    <DropdownMenuItem 
                      key={session.id}
                      disabled={!activeWeekId}
                      onClick={() => activeWeekId && loadSessionFromLibrary(session, activeWeekId)}
                    >
                      {session.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved workout playlists</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            {/* Training Weeks */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PlaySquare className="h-4 w-4 mr-2" />
                <span>Training Weeks</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {weekLibrary.length > 0 ? (
                  weekLibrary.map((week: WorkoutWeek) => (
                    <DropdownMenuItem 
                      key={week.id}
                      onClick={() => loadWeekFromLibrary(week)}
                    >
                      {week.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved training weeks</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            {/* Training Programs */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Album className="h-4 w-4 mr-2" />
                <span>Training Albums</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {programLibrary.length > 0 ? (
                  programLibrary.map((program: WorkoutProgram) => (
                    <DropdownMenuItem 
                      key={program.id}
                      onClick={() => loadProgramFromLibrary(program)}
                    >
                      {program.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved training albums</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Add to Library</DropdownMenuLabel>
            
            {/* Save Current Session */}
            <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  disabled={!activeSessionId}
                >
                  <PlaySquare className="h-4 w-4 mr-2" />
                  Save Current Workout Playlist
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Workout Playlist to Library</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="session-name" className="text-right">
                      Playlist Name
                    </Label>
                    <Input
                      id="session-name"
                      value={libraryItemName}
                      onChange={(e) => setLibraryItemName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleSaveSessionToLibrary}
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
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  disabled={!activeWeekId}
                >
                  <PlaySquare className="h-4 w-4 mr-2" />
                  Save Current Training Week
                </DropdownMenuItem>
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
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                >
                  <Album className="h-4 w-4 mr-2" />
                  Save Current Training Album
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Training Album to Library</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="program-name" className="text-right">
                      Album Name
                    </Label>
                    <Input
                      id="program-name"
                      value={libraryItemName}
                      onChange={(e) => setLibraryItemName(e.target.value)}
                      className="col-span-3"
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
          </DropdownMenuContent>
        </DropdownMenu>
        
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
    </header>
  );
};

export default WorkoutHeader;
