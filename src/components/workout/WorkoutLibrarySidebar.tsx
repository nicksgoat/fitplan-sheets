
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Plus } from 'lucide-react';
import { useWorkoutLibraryIntegration } from '@/hooks/useWorkoutLibraryIntegration';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Workout } from '@/types/workout';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';

interface WorkoutLibrarySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkoutLibrarySidebar = ({ open, onOpenChange }: WorkoutLibrarySidebarProps) => {
  const { libraryWorkouts, useDraggableLibraryWorkout, saveCurrentWorkoutToLibrary } = useWorkoutLibraryIntegration();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [newWorkoutName, setNewWorkoutName] = React.useState('');

  const filteredWorkouts = React.useMemo(() => {
    if (!searchTerm.trim()) return libraryWorkouts;
    
    return libraryWorkouts.filter(workout => 
      workout.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [libraryWorkouts, searchTerm]);

  const handleSaveCurrentWorkout = () => {
    if (newWorkoutName.trim()) {
      saveCurrentWorkoutToLibrary(newWorkoutName);
      setNewWorkoutName('');
      setSaveDialogOpen(false);
    } else {
      toast.error('Please enter a workout name');
    }
  };

  const DraggableWorkoutItem = ({ workout }: { workout: Workout }) => {
    const [{ isDragging }, dragRef] = useDraggableLibraryWorkout(workout);
    
    return (
      <div 
        ref={dragRef}
        className={`p-3 mb-2 bg-dark-200 rounded-md border border-dark-300 cursor-grab hover:bg-dark-300 transition-all ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">{workout.name}</h4>
            <p className="text-xs text-gray-400">
              {workout.day > 0 ? `Day ${workout.day} • ` : ''}
              {workout.exercises.length} exercises
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-80 sm:w-96 bg-dark-100 text-white border-l border-dark-300">
          <SheetHeader>
            <SheetTitle className="text-white">Workout Library</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 flex-1 overflow-hidden">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search workouts..."
                className="bg-dark-200 border-dark-300 pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-300">Drag to Calendar</h3>
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                {filteredWorkouts.length > 0 ? (
                  filteredWorkouts.map((workout) => (
                    <DraggableWorkoutItem key={workout.id} workout={workout} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>No workouts in your library</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <SheetFooter className="border-t border-dark-300 pt-4">
            <div className="space-y-2 w-full">
              <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Save Current Workout
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-200 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Save Current Workout</h3>
            <Input
              placeholder="Workout name"
              className="mb-4 bg-dark-300 border-dark-400"
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSaveDialogOpen(false);
                  setNewWorkoutName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCurrentWorkout}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutLibrarySidebar;
