
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarDays, ExternalLink } from "lucide-react";
import { getWorkoutLibrary, removeWorkoutFromLibrary } from "@/utils/presets";
import { Workout } from "@/types/workout";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWorkout } from "@/contexts/WorkoutContext";

const WorkoutsLibraryTab: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loadWorkoutFromLibrary, setActiveWeekId, setActiveWorkoutId } = useWorkout();
  
  // Load workouts from library
  useEffect(() => {
    setWorkouts(getWorkoutLibrary());
  }, []);
  
  const handleDeleteWorkout = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (workoutToDelete) {
      removeWorkoutFromLibrary(workoutToDelete);
      setWorkouts(getWorkoutLibrary());
      toast.success("Workout removed from library");
      setDeleteDialogOpen(false);
      setWorkoutToDelete(null);
    }
  };
  
  const handleUseWorkout = (workout: Workout) => {
    // Navigate to Sheets and set up the workout
    navigate("/sheets");
    
    // Create a temporary week if needed
    // This functionality would be expanded in a full implementation
    toast.info("Opening workout in sheets...");
    
    // This is a placeholder for now - in a full implementation
    // we would properly set up the workout in the context
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <div 
              key={workout.id} 
              className="bg-dark-200 border border-dark-300 rounded-lg overflow-hidden shadow-md hover:border-purple-500 transition-colors"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Day {workout.day}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{workout.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => handleDeleteWorkout(workout.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-400 mb-3">
                  <div className="flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>Saved: {formatDate(workout.savedAt)}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-300">
                    {workout.exercises.length} exercises
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full justify-center border-gray-600 hover:bg-dark-300"
                  onClick={() => handleUseWorkout(workout)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Sheets
                </Button>
              </div>
            </div>
          ))}
        </div>
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
