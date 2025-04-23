
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface SetLoggerProps {
  setNumber: number;
  restTime?: string;
  isDisabled: boolean;
  defaultWeight?: string;
  defaultReps?: string;
  onComplete: (data: { weight: string; reps: string }) => void;
}

export default function SetLogger({ 
  setNumber, 
  restTime, 
  isDisabled,
  defaultWeight,
  defaultReps,
  onComplete 
}: SetLoggerProps) {
  const [weight, setWeight] = useState(defaultWeight || '');
  const [reps, setReps] = useState(defaultReps || '');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            toast.success('Rest complete! Start your next set');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);
  
  const handleSetComplete = () => {
    if (!weight.trim() || !reps.trim()) {
      toast.error('Please enter both weight and reps');
      return;
    }
    
    onComplete({ weight, reps });
    
    if (restTime) {
      const restSeconds = parseInt(restTime);
      if (!isNaN(restSeconds) && restSeconds > 0) {
        setTimer(restSeconds);
        setIsTimerRunning(true);
        toast.info(`Rest timer started: ${restSeconds}s`);
      }
    }
  };

  return (
    <div className="border border-dark-border rounded-lg p-4 mb-4 bg-dark-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-amber-400">Set {setNumber}</h4>
        {timer > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center bg-dark-300 rounded-md px-3 py-1.5">
              <Clock className="h-4 w-4 mr-2 text-blue-400" />
              <span className="font-mono text-sm text-blue-400">{timer}s</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Weight</label>
          <Input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full h-8 text-center bg-dark-200 border-dark-300"
            placeholder="lbs"
            disabled={isDisabled}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Reps</label>
          <Input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full h-8 text-center bg-dark-200 border-dark-300"
            placeholder="reps"
            disabled={isDisabled}
          />
        </div>
      </div>
      
      <Button 
        className="w-full mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
        onClick={handleSetComplete}
        disabled={isDisabled || isTimerRunning}
      >
        Complete Set
      </Button>
    </div>
  );
}
