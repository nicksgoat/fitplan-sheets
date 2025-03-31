import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarDays, ExternalLink, Info } from "lucide-react";
import { getWorkoutLibrary, removeWorkoutFromLibrary } from "@/utils/presets";
import { Workout } from "@/types/workout";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkout } from "@/contexts/WorkoutContext";

const WorkoutsLibraryTab: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const navigate = useNavigate();
  const { 
    loadWorkoutFromLibrary, 
    setActiveWeekId, 
    setActiveWorkoutId,
    addWeek,
    program
  } = useWorkout();
  
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
  
  const handleShowDetails = (workout: Workout) => {
    setSelectedWorkout(workout);
    setDetailsDialogOpen(true);
  };
  
  const handleUseWorkout = (workout: Workout) => {
    // Create a week if none exists in the program
    let weekId: string;
    
    if (!program || program.weeks.length === 0) {
      const newWeekId = addWeek();
      // Check if addWeek returned a valid ID
      if (typeof newWeekId !== 'string') {
        toast.error("Could not create a new week");
        return;
      }
      weekId = newWeekId;
    } else {
      weekId = program.weeks[0].id;
    }
    
    // Load the workout into the Sheets system
    const workoutId = loadWorkoutFromLibrary(workout, weekId);
    
    // Check if workoutId is a valid string
    if (typeof workoutId === 'string') {
      // Set the active week and workout IDs
      setActiveWeekId(weekId);
      setActiveWorkoutId(workoutId);
      
      // Navigate to Sheets and notify the user
      navigate("/sheets");
      toast.success("Workout loaded into Sheets");
    } else {
      toast.error("Failed to load workout");
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getExercisesSummary = (workout: Workout) => {
    if (!workout.exercises || workout.exercises.length === 0) {
      return "No exercises";
    }
    
    // Group exercises by primary muscle if possible
    const muscleGroups: Record<string, number> = {};
    
    workout.exercises.forEach(exercise => {
      // Skip circuit headers
      if (exercise.isCircuit) return;
      
      // Try to extract a muscle group from the name
      let muscleGroup = "Other";
      
      const lowerName = exercise.name.toLowerCase();
      if (lowerName.includes("chest") || lowerName.includes("bench") || lowerName.includes("fly")) {
        muscleGroup = "Chest";
      } else if (lowerName.includes("back") || lowerName.includes("row") || lowerName.includes("pull")) {
        muscleGroup = "Back";
      } else if (lowerName.includes("shoulder") || lowerName.includes("press") || lowerName.includes("delt")) {
        muscleGroup = "Shoulders";
      } else if (lowerName.includes("leg") || lowerName.includes("squat") || lowerName.includes("lunge")) {
        muscleGroup = "Legs";
      } else if (lowerName.includes("arm") || lowerName.includes("curl") || lowerName.includes("extension")) {
        muscleGroup = "Arms";
      } else if (lowerName.includes("core") || lowerName.includes("ab") || lowerName.includes("crunch")) {
        muscleGroup = "Core";
      }
      
      muscleGroups[muscleGroup] = (muscleGroups[muscleGroup] || 0) + 1;
    });
    
    // Format as a summary
    return Object.entries(muscleGroups)
      .map(([group, count]) => `${group}: ${count}`)
      .join(", ");
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
                  <div className="flex space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-purple-400"
                            onClick={() => handleShowDetails(workout)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteWorkout(workout.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Workout</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 mb-3">
                  <div className="flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>Saved: {formatDate(workout.savedAt)}</span>
                  </div>
                </div>
                
                <div className="mb-4 space-y-1">
                  <p className="text-sm text-gray-300">
                    {workout.exercises.length} exercises
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {getExercisesSummary(workout)}
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
      
      {/* Delete confirmation dialog */}
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
      
      {/* Workout details dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-dark-200 text-white border-dark-300 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorkout?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Workout details and exercise list
            </DialogDescription>
          </DialogHeader>
          
          {selectedWorkout && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Created</p>
                  <p>{formatDate(selectedWorkout.savedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Modified</p>
                  <p>{formatDate(selectedWorkout.lastModified)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Day</p>
                  <p>{selectedWorkout.day}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Exercises</p>
                  <p>{selectedWorkout.exercises.length}</p>
                </div>
              </div>
              
              <div className="border-t border-dark-300 pt-4">
                <h4 className="text-md font-semibold mb-2">Exercises</h4>
                <div className="space-y-2">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div 
                      key={exercise.id} 
                      className={`p-3 rounded ${exercise.isCircuit ? 'bg-dark-300 font-semibold' : 'bg-dark-300/50'} ${exercise.isInCircuit ? 'ml-4' : ''}`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="text-gray-400 mr-2">{index + 1}.</span>
                          {exercise.name}
                        </div>
                        <div className="text-gray-400">
                          {exercise.sets.length > 0 ? `${exercise.sets.length} sets` : ''}
                        </div>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-gray-400 mt-1">{exercise.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  onClick={() => {
                    handleUseWorkout(selectedWorkout);
                    setDetailsDialogOpen(false);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Workout in Sheets
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutsLibraryTab;
