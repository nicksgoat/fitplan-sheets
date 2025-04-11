
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { TrashIcon, GripVertical, PencilIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkoutSessionHeaderProps {
  sessionId: string;
}

const WorkoutSessionHeader: React.FC<WorkoutSessionHeaderProps> = ({ sessionId }) => {
  const { program, updateWorkoutName, deleteWorkout } = useWorkout();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  if (!program || !program.workouts) return null;
  
  const session = program.workouts.find((s) => s.id === sessionId);
  
  if (!session) return null;

  const handleEditClick = () => {
    setNewName(session.name);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (newName.trim()) {
      updateWorkoutName(sessionId, newName);
    }
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    deleteWorkout(session.weekId || "", sessionId);
    setShowDeleteAlert(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-dark-200 border-b border-dark-300">
      <div className="flex items-center">
        <div className="mr-3 cursor-move opacity-50">
          <GripVertical className="h-5 w-5" />
        </div>
        
        {isEditing ? (
          <div className="flex items-center">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-[200px] mr-2 bg-dark-100"
              autoFocus
            />
            <Button
              onClick={handleSaveClick}
              size="sm"
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              Save
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <h3 className="text-lg font-medium">{session.name}</h3>
            <button
              onClick={handleEditClick}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div>
        <button
          onClick={handleDeleteClick}
          className="text-red-500 hover:text-red-400"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-dark-200 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout Session</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this workout session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowDeleteAlert(false)}
              className="bg-dark-300 hover:bg-dark-400"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutSessionHeader;
