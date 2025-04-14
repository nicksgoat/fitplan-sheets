
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarDays, LayoutIcon, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { Workout } from "@/types/workout";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLibrary } from "@/contexts/LibraryContext";
import { ItemType } from "@/lib/types";
import ContentGrid from "@/components/ui/ContentGrid";
import { useNavigate } from "react-router-dom";
import { useWorkoutLibraryIntegration } from "@/hooks/useWorkoutLibraryIntegration";
import { Badge } from "@/components/ui/badge";
import WorkoutPreview from "@/components/workout/WorkoutPreview";
import { ClubShareDialog } from "@/components/club/ClubShareDialog";
import { useAuth } from "@/hooks/useAuth";

// Define the draggable item types for consistency
const ItemTypes = {
  LIBRARY_WORKOUT: 'library-workout'
};

interface DraggableWorkoutItemProps {
  workout: Workout;
  onDelete: (event: React.MouseEvent, workoutId: string) => void;
  onDragStart?: () => void;
}

const DraggableWorkoutItem: React.FC<DraggableWorkoutItemProps> = ({ workout, onDelete, onDragStart }) => {
  const { useDraggableLibraryWorkout } = useWorkoutLibraryIntegration();
  const [{ isDragging }, drag] = useDraggableLibraryWorkout(workout, onDragStart);
  const [expanded, setExpanded] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useAuth();
  
  // Get exercise count by type for summary
  const circuitCount = workout.exercises.filter(ex => ex.isCircuit).length;
  const supersetCount = workout.exercises.filter(ex => ex.isCircuit && ex.name === "Superset").length;
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    setExpanded(!expanded);
  };
  
  return (
    <div className="mb-4">
      <div 
        ref={drag}
        className={`flex flex-col p-3 border rounded-md bg-dark-200 hover:bg-dark-300 cursor-grab active:cursor-grabbing transition-opacity ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-sm font-medium">{workout.name}</h3>
              {workout.isPurchasable && workout.price && workout.price > 0 && (
                <Badge variant="outline" className="ml-2 text-xs flex items-center text-green-500 border-green-500">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {Number(workout.price).toFixed(2)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {workout.day > 0 ? `Day ${workout.day} • ` : ''}
              {workout.exercises.length} exercises
              {circuitCount > 0 && ` • ${circuitCount} circuit${circuitCount !== 1 ? 's' : ''}`}
              {supersetCount > 0 && ` • ${supersetCount} superset${supersetCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareDialog(true)}
                className="h-8 w-8"
                title="Share with clubs"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-8 w-8"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => onDelete(e, workout.id)}
              className="h-8 w-8"
              title="Remove from library"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-2 pt-2 border-t border-dark-300">
            <WorkoutPreview workout={workout} />
          </div>
        )}
      </div>
      
      {showShareDialog && (
        <ClubShareDialog 
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          contentId={workout.id}
          contentType="workout"
        />
      )}
    </div>
  );
};

interface WorkoutsLibraryTabProps {
  onDragStart?: () => void;
}

const WorkoutsLibraryTab: React.FC<WorkoutsLibraryTabProps> = ({ onDragStart }) => {
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
    lastModified: workout.lastModified,
    price: workout.price,
    isPurchasable: workout.isPurchasable
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
        <>
          <div className="mb-4">
            <h3 className="font-medium mb-2">Drag workouts to the calendar</h3>
            <p className="text-sm text-gray-400">Drag these workouts onto calendar days to add them to your program</p>
            <div className="mt-4 space-y-2">
              {workouts.map(workout => (
                <DraggableWorkoutItem 
                  key={workout.id} 
                  workout={workout} 
                  onDelete={handleDeleteWorkout}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
          <ContentGrid items={workoutItems} />
        </>
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
