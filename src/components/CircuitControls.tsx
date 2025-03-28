
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Copy, 
  RotateCcw, 
  Timer, 
  Clock, 
  Repeat,
  Plus
} from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { WorkoutType, Circuit } from "@/types/workout";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ExerciseSearch from "./ExerciseSearch";

interface CircuitControlsProps {
  sessionId: string;
}

const CircuitControls: React.FC<CircuitControlsProps> = ({ sessionId }) => {
  const { 
    program,
    createCircuit, 
    createSuperset, 
    createEMOM, 
    createAMRAP, 
    createTabata,
    addExercise,
    addExerciseToCircuit
  } = useWorkout();
  
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");
  
  const session = program.sessions.find(s => s.id === sessionId);
  const circuits = session?.circuits || [];

  const workoutTypes: { type: WorkoutType; icon: React.ReactNode; label: string; description: string }[] = [
    { 
      type: 'circuit', 
      icon: <RotateCcw className="h-4 w-4" />, 
      label: 'Circuit', 
      description: 'Perform exercises in sequence with minimal rest'
    },
    { 
      type: 'superset', 
      icon: <Copy className="h-4 w-4" />, 
      label: 'Superset', 
      description: 'Pair exercises with no rest between' 
    },
    { 
      type: 'emom', 
      icon: <Timer className="h-4 w-4" />, 
      label: 'EMOM', 
      description: 'Every Minute On the Minute' 
    },
    { 
      type: 'amrap', 
      icon: <Clock className="h-4 w-4" />, 
      label: 'AMRAP', 
      description: 'As Many Rounds As Possible' 
    },
    { 
      type: 'tabata', 
      icon: <Repeat className="h-4 w-4" />, 
      label: 'Tabata', 
      description: '20s work, 10s rest' 
    },
  ];

  const handleCreateCircuit = (type: WorkoutType) => {
    switch (type) {
      case 'circuit':
        createCircuit(sessionId);
        break;
      case 'superset':
        createSuperset(sessionId);
        break;
      case 'emom':
        createEMOM(sessionId);
        break;
      case 'amrap':
        createAMRAP(sessionId);
        break;
      case 'tabata':
        createTabata(sessionId);
        break;
    }
    setSelectedType(null);
  };
  
  const handleAddExerciseToCircuit = () => {
    if (!selectedCircuit || !newExerciseName.trim()) return;
    
    // First create a new regular exercise
    addExercise(sessionId);
    
    // Get the ID of the newly created exercise (it should be the last one)
    const newSession = program.sessions.find(s => s.id === sessionId);
    if (!newSession) return;
    
    const newExerciseId = newSession.exercises[newSession.exercises.length - 1].id;
    
    // Update the exercise name
    if (newExerciseId) {
      // Add this exercise to the circuit
      addExerciseToCircuit(sessionId, selectedCircuit.id, newExerciseId);
      
      // Close dialog and reset state
      setIsAddExerciseDialogOpen(false);
      setNewExerciseName("");
      setSelectedCircuit(null);
    }
  };
  
  const openAddExerciseDialog = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setIsAddExerciseDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      {circuits.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Circuit</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-dark-200 border-dark-300">
            {circuits.map((circuit) => (
              <DropdownMenuItem 
                key={circuit.id}
                onClick={() => openAddExerciseDialog(circuit)}
                className="cursor-pointer hover:bg-dark-400"
              >
                {circuit.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Dumbbell className="h-4 w-4" />
            <span>Add Circuit</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-dark-200 border-dark-300" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-white">Select Circuit Type</h4>
            <p className="text-sm text-gray-400">
              Choose a type of circuit to add to your workout
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {workoutTypes.map((workoutType) => (
                <Toggle
                  key={workoutType.type}
                  variant="outline"
                  className={cn(
                    "justify-start gap-2 px-3 py-2 w-full bg-dark-300 border-dark-400",
                    selectedType === workoutType.type && "border-blue-500"
                  )}
                  pressed={selectedType === workoutType.type}
                  onPressedChange={() => setSelectedType(workoutType.type)}
                >
                  <div className="flex-1 text-left grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-1 flex items-center justify-center">
                      {workoutType.icon}
                    </div>
                    <div className="col-span-5">
                      <div className="font-medium text-white">{workoutType.label}</div>
                      <div className="text-xs text-gray-400">{workoutType.description}</div>
                    </div>
                  </div>
                </Toggle>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                disabled={!selectedType}
                onClick={() => selectedType && handleCreateCircuit(selectedType)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Dialog 
        open={isAddExerciseDialogOpen} 
        onOpenChange={setIsAddExerciseDialogOpen}
      >
        <DialogContent className="bg-dark-200 border-dark-300 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add Exercise to Circuit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="exerciseName" className="text-gray-300">Exercise Name</Label>
                <div className="mt-1 rounded-md border border-dark-400 bg-dark-300">
                  <ExerciseSearch
                    value={newExerciseName}
                    onChange={setNewExerciseName}
                    placeholder="Search for an exercise..."
                    className="text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddExerciseDialogOpen(false)}
              className="text-gray-300 hover:bg-dark-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddExerciseToCircuit}
              disabled={!newExerciseName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CircuitControls;
