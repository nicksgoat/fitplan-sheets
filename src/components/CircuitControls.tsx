
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Copy, 
  RotateCcw, 
  Timer, 
  Clock, 
  Repeat
} from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkoutType } from "@/types/workout";
import { cn } from "@/lib/utils";

interface CircuitControlsProps {
  sessionId: string;
}

const CircuitControls: React.FC<CircuitControlsProps> = ({ sessionId }) => {
  const { 
    createCircuit, 
    createSuperset, 
    createEMOM, 
    createAMRAP, 
    createTabata,
    addCircuit
  } = useWorkout();
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const [rounds, setRounds] = useState<string>("3");

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
        createCircuit(sessionId, rounds);
        break;
      case 'superset':
        createSuperset(sessionId, rounds);
        break;
      case 'emom':
        createEMOM(sessionId, rounds);
        break;
      case 'amrap':
        createAMRAP(sessionId);
        break;
      case 'tabata':
        createTabata(sessionId, rounds);
        break;
    }
    setSelectedType(null);
  };

  return (
    <div className="flex items-center gap-2">
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
        <PopoverContent className="w-80" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">Select Circuit Type</h4>
            <p className="text-sm text-muted-foreground">
              Choose a type of circuit to add to your workout
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {workoutTypes.map((workoutType) => (
                <Toggle
                  key={workoutType.type}
                  variant="outline"
                  className={cn(
                    "justify-start gap-2 px-3 py-2 w-full",
                    selectedType === workoutType.type && "border-primary"
                  )}
                  pressed={selectedType === workoutType.type}
                  onPressedChange={() => setSelectedType(workoutType.type)}
                >
                  <div className="flex-1 text-left grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-1 flex items-center justify-center">
                      {workoutType.icon}
                    </div>
                    <div className="col-span-5">
                      <div className="font-medium">{workoutType.label}</div>
                      <div className="text-xs text-muted-foreground">{workoutType.description}</div>
                    </div>
                  </div>
                </Toggle>
              ))}
            </div>
            
            {selectedType && selectedType !== 'amrap' && (
              <div className="pt-2">
                <Label htmlFor="rounds">Number of Rounds</Label>
                <Input 
                  id="rounds" 
                  type="number" 
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  min="1"
                  max="20"
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                disabled={!selectedType}
                onClick={() => selectedType && handleCreateCircuit(selectedType)}
              >
                Create
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CircuitControls;
