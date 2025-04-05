
import React from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useWorkoutLibraryIntegration } from '@/hooks/useWorkoutLibraryIntegration';
import { Button } from '@/components/ui/button';
import { Edit2, Save, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { WorkoutSession } from '@/types/workout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface WorkoutEditorHeaderProps {
  workoutId: string;
}

const WorkoutEditorHeader: React.FC<WorkoutEditorHeaderProps> = ({ workoutId }) => {
  const { program, updateWorkoutName } = useWorkout();
  const { saveCurrentWorkoutToLibrary } = useWorkoutLibraryIntegration();
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  
  // Find the current workout
  const workout = program?.workouts.find(w => w.id === workoutId);
  
  if (!program || !workout) return null;
  
  const handleSaveToLibrary = () => {
    setIsSaveDialogOpen(true);
    setSaveAsName(workout.name);
  };
  
  const handleConfirmSave = () => {
    saveCurrentWorkoutToLibrary(saveAsName);
    setIsSaveDialogOpen(false);
  };
  
  const startEditing = () => {
    setWorkoutName(workout.name);
    setIsEditing(true);
  };
  
  const saveWorkoutName = () => {
    if (workoutName.trim()) {
      updateWorkoutName(workoutId, workoutName);
    }
    setIsEditing(false);
  };
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-64 bg-dark-200 border-dark-300"
              onKeyDown={(e) => e.key === 'Enter' && saveWorkoutName()}
              autoFocus
            />
            <Button onClick={saveWorkoutName} variant="outline">Save</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{workout.name}</h2>
            <button
              onClick={startEditing}
              className="text-gray-400 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}
        <p className="text-sm text-gray-400">Day {workout.day}</p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSaveToLibrary}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4 mr-1" />
          Save to Library
        </Button>
      </div>
      
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-dark-200 border-dark-300">
          <DialogHeader>
            <DialogTitle>Save Workout to Library</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Workout Name
            </label>
            <Input 
              value={saveAsName} 
              onChange={(e) => setSaveAsName(e.target.value)} 
              className="bg-dark-300 border-dark-400"
              placeholder="Enter workout name"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSave}
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              Save Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutEditorHeader;
