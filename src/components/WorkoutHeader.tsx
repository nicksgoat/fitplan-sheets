
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";
import { PlusCircle, RefreshCw, Layers, Save, Database } from "lucide-react";
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
    saveSessionAsPreset,
    saveWeekAsPreset,
    saveProgramAsPreset,
    loadSessionPreset,
    loadWeekPreset,
    loadProgramPreset,
    getSessionPresets,
    getWeekPresets,
    getProgramPresets,
    deleteSessionPreset,
    deleteWeekPreset,
    deleteProgramPreset
  } = useWorkout();
  
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  
  const sessionPresets = getSessionPresets();
  const weekPresets = getWeekPresets();
  const programPresets = getProgramPresets();
  
  const handleSaveSessionPreset = () => {
    if (activeSessionId && presetName) {
      saveSessionAsPreset(activeSessionId, presetName);
      setPresetName("");
      setIsSessionDialogOpen(false);
    }
  };
  
  const handleSaveWeekPreset = () => {
    if (activeWeekId && presetName) {
      saveWeekAsPreset(activeWeekId, presetName);
      setPresetName("");
      setIsWeekDialogOpen(false);
    }
  };
  
  const handleSaveProgramPreset = () => {
    if (presetName) {
      saveProgramAsPreset(presetName);
      setPresetName("");
      setIsProgramDialogOpen(false);
    }
  };
  
  return (
    <header className="sticky top-0 z-10 glass-panel p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-medium">FitPlan Sheets</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Presets Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Database className="h-4 w-4" />
              <span>Presets</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Load Presets</DropdownMenuLabel>
            
            {/* Session Presets */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Session Presets</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {sessionPresets.length > 0 ? (
                  sessionPresets.map((preset: WorkoutSession) => (
                    <DropdownMenuItem 
                      key={preset.id}
                      disabled={!activeWeekId}
                      onClick={() => activeWeekId && loadSessionPreset(preset, activeWeekId)}
                    >
                      {preset.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved sessions</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            {/* Week Presets */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Week Presets</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {weekPresets.length > 0 ? (
                  weekPresets.map((preset: WorkoutWeek) => (
                    <DropdownMenuItem 
                      key={preset.id}
                      onClick={() => loadWeekPreset(preset)}
                    >
                      {preset.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved weeks</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            {/* Program Presets */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Program Presets</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {programPresets.length > 0 ? (
                  programPresets.map((preset: WorkoutProgram) => (
                    <DropdownMenuItem 
                      key={preset.id}
                      onClick={() => loadProgramPreset(preset)}
                    >
                      {preset.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved programs</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Save Presets</DropdownMenuLabel>
            
            {/* Save Current Session */}
            <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  disabled={!activeSessionId}
                >
                  Save Current Session
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save Session as Preset</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="session-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="session-name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleSaveSessionPreset}
                    disabled={!presetName}
                  >
                    Save
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
                  Save Current Week
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save Week as Preset</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="week-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="week-name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleSaveWeekPreset}
                    disabled={!presetName}
                  >
                    Save
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
                  Save Current Program
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save Program as Preset</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="program-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="program-name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleSaveProgramPreset}
                    disabled={!presetName}
                  >
                    Save
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
