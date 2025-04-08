
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { ListMusic, FileText, AlbumIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryTabContent } from "./LibraryTabContent";
import { SaveDialog } from "./SaveDialog";
import { Workout, WorkoutWeek, WorkoutProgram } from "@/types/workout";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { toast } from "sonner";

interface LibraryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LibraryDrawer = ({ open, onOpenChange }: LibraryDrawerProps) => {
  const [activeTab, setActiveTab] = useState<"workouts" | "weeks" | "programs">("workouts");
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  
  const { 
    activeWorkoutId,
    activeWeekId,
    loadWorkoutFromLibrary,
    loadWeekFromLibrary,
    loadProgramFromLibrary,
    program
  } = useWorkout();
  
  const {
    workouts: workoutLibrary,
    weeks: weekLibrary,
    programs: programLibrary,
    saveWorkout,
    saveWeek,
    removeWorkout,
    removeWeek,
    removeProgram
  } = useLibrary();

  const handleDragStart = (e: React.DragEvent, item: any, type: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({id: item.id, type}));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSaveWorkoutToLibrary = (name: string) => {
    if (activeWorkoutId && name) {
      const workoutToSave = program?.workouts.find(w => w.id === activeWorkoutId);
      if (workoutToSave) {
        saveWorkout(workoutToSave, name);
        setIsWorkoutDialogOpen(false);
        toast.success(`Workout "${name}" saved to library`);
      }
    }
  };
  
  const handleSaveWeekToLibrary = (name: string) => {
    if (activeWeekId && name) {
      const weekToSave = program?.weeks.find(w => w.id === activeWeekId);
      if (weekToSave) {
        saveWeek(weekToSave, name);
        setIsWeekDialogOpen(false);
        toast.success(`Week "${name}" saved to library`);
      }
    }
  };

  const handleAddWorkout = (workout: Workout) => {
    if (activeWeekId) {
      loadWorkoutFromLibrary(workout.id, activeWeekId);
      toast.success(`Workout "${workout.name}" added to week`);
    }
  };

  const handleAddWeek = (week: WorkoutWeek) => {
    loadWeekFromLibrary(week);
    toast.success(`Week "${week.name}" added to program`);
  };

  const handleAddProgram = (program: WorkoutProgram) => {
    loadProgramFromLibrary(program);
    toast.success(`Program "${program.name}" loaded`);
  };

  const handleDeleteItem = (id: string, type: string) => {
    if (type === "workout") {
      removeWorkout(id);
      toast.success("Workout removed from library");
    } else if (type === "week") {
      removeWeek(id);
      toast.success("Week removed from library");
    } else if (type === "program") {
      removeProgram(id);
      toast.success("Program removed from library");
    }
  };
  
  const isMobile = window.innerWidth < 768;
  
  const LibraryComponent = isMobile ? Drawer : Sheet;
  const LibraryContent = isMobile ? DrawerContent : SheetContent;
  const LibraryHeader = isMobile ? DrawerHeader : SheetHeader;
  const LibraryTitle = isMobile ? DrawerTitle : SheetTitle;

  return (
    <LibraryComponent open={open} onOpenChange={onOpenChange}>
      <LibraryContent className="sm:max-w-md" side="right">
        <LibraryHeader>
          <LibraryTitle>Your Fitness Library</LibraryTitle>
        </LibraryHeader>

        <div className="mt-4">
          <div className="flex items-center border-b">
            <button 
              onClick={() => setActiveTab("workouts")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "workouts" ? "border-b-2 border-primary" : ""
              )}
            >
              <ListMusic className="h-4 w-4 mr-2 inline-block" />
              Workouts
            </button>
            <button 
              onClick={() => setActiveTab("weeks")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "weeks" ? "border-b-2 border-primary" : ""
              )}
            >
              <FileText className="h-4 w-4 mr-2 inline-block" />
              Weeks
            </button>
            <button 
              onClick={() => setActiveTab("programs")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "programs" ? "border-b-2 border-primary" : ""
              )}
            >
              <AlbumIcon className="h-4 w-4 mr-2 inline-block" />
              Programs
            </button>
          </div>

          <div className="p-4 h-[50vh] overflow-y-auto">
            {activeTab === "workouts" && (
              <LibraryTabContent 
                type="workouts"
                items={workoutLibrary}
                handleDragStart={handleDragStart}
                onAdd={handleAddWorkout}
                onDelete={handleDeleteItem}
                emptyMessage="No workouts saved yet"
              />
            )}

            {activeTab === "weeks" && (
              <LibraryTabContent 
                type="weeks"
                items={weekLibrary}
                handleDragStart={handleDragStart}
                onAdd={handleAddWeek}
                onDelete={handleDeleteItem}
                emptyMessage="No training weeks saved yet"
              />
            )}

            {activeTab === "programs" && (
              <LibraryTabContent 
                type="programs"
                items={programLibrary}
                handleDragStart={handleDragStart}
                onAdd={handleAddProgram}
                onDelete={handleDeleteItem}
                emptyMessage="No training programs saved yet"
              />
            )}
          </div>

          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">Add to Library</h3>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center justify-start"
                disabled={!activeWorkoutId}
                onClick={() => setIsWorkoutDialogOpen(true)}
              >
                <ListMusic className="h-4 w-4 mr-2" />
                <span>Save Current Workout</span>
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center justify-start"
                disabled={!activeWeekId}
                onClick={() => setIsWeekDialogOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Save Current Week</span>
              </Button>
            </div>
          </div>
        </div>

        <SaveDialog 
          open={isWorkoutDialogOpen}
          onOpenChange={setIsWorkoutDialogOpen}
          title="Add Workout to Library"
          description="This will save only the current workout day to your library."
          onSave={handleSaveWorkoutToLibrary}
          buttonText="Save Workout"
        />

        <SaveDialog 
          open={isWeekDialogOpen}
          onOpenChange={setIsWeekDialogOpen}
          title="Add Training Week to Library"
          description="This will save the current week with all its workouts to your library."
          onSave={handleSaveWeekToLibrary}
          buttonText="Save Week"
        />
      </LibraryContent>
    </LibraryComponent>
  );
};
