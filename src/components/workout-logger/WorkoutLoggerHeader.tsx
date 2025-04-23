
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Play, Pause, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/timeUtils';

interface WorkoutLoggerHeaderProps {
  workoutName: string;
  onWorkoutNameChange: (name: string) => void;
  elapsedTime: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onStartWorkout: () => void;
  onCompleteWorkout: () => void;
  isLoading: boolean;
  activeSessionId: string | null;
}

export default function WorkoutLoggerHeader({
  workoutName,
  onWorkoutNameChange,
  elapsedTime,
  isTimerRunning,
  onToggleTimer,
  onStartWorkout,
  onCompleteWorkout,
  isLoading,
  activeSessionId,
}: WorkoutLoggerHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-black/90 backdrop-blur-lg z-50 border-b border-gray-800">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <input
          type="text"
          value={workoutName}
          onChange={(e) => onWorkoutNameChange(e.target.value)}
          className="text-lg font-bold bg-transparent border-none focus:outline-none flex-1 mx-2"
          placeholder="Workout Name"
          readOnly={!activeSessionId}
        />

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-dark-200 rounded-md px-3 py-1.5">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
          </div>

          {!activeSessionId ? (
            <Button 
              onClick={onStartWorkout}
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onToggleTimer}
                className="h-8 w-8"
              >
                {isTimerRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                onClick={onCompleteWorkout}
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Complete
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
