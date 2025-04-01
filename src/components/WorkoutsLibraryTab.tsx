
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarDays, LayoutIcon } from "lucide-react";
import { Workout } from "@/types/workout";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLibrary } from "@/contexts/LibraryContext";
import { ItemType } from "@/lib/types";
import ContentGrid from "@/components/ui/ContentGrid";
import { useNavigate } from "react-router-dom";

const WorkoutsLibraryTab: React.FC = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { workouts, removeWorkout } = useLibrary();
  
  const handleDeleteWorkout = (event: React.MouseEvent, workoutId: string) => {
    event.stopPropagation(); // Stop click from propagating to parent
    setWorkoutToDelete(workoutId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (workoutToDelete) {
      removeWorkout(workoutToDelete);
      toast.success("Workout removed from library");
      setDeleteDialogOpen(false);
      setWorkoutToDelete(null);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Convert workouts to ItemType format for ContentGrid
  const workoutItems: ItemType[] = workouts.map(workout => ({
    id: workout.id,
    title: workout.name,
    type: 'workout' as const,
    creator: 'You',
    imageUrl: 'https://placehold.co/600x400?text=Workout',
    tags: ['Workout', 'Custom'],
    duration: `${workout.exercises.length} exercises`,
    difficulty: 'intermediate' as const,
    isFavorite: false,
    description: `Day ${workout.day} workout with ${workout.exercises.length} exercises`,
    isCustom: true,
    savedAt: workout.savedAt,
    lastModified: workout.lastModified
  }));
  
  return (
    <div className="space-y-6">
      {workouts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You haven't saved any workouts to your library yet.</p>
          <Button 
            className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90 text-sm"
            onClick={() => navigate("/sheets")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
        </div>
      ) : (
        <ContentGrid items={workoutItems} />
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-dark-200 text-white border-dark-300">
          <DialogHeader>
            <DialogTitle>Delete Workout</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove this workout from your library? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutsLibraryTab;
