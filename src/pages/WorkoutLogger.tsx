
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Save, Clock, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useWorkoutLoggerIntegration } from '@/hooks/useWorkoutLoggerIntegration';

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const { activeWorkout } = useWorkout();
  
  // Integration with workout logger
  const { 
    startWorkoutSession, 
    completeWorkoutLog,
    isLoading
  } = useWorkoutLoggerIntegration();
  
  // Local state
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  
  // Update workout name when active workout changes
  useEffect(() => {
    if (activeWorkout) {
      setWorkoutName(activeWorkout.name);
    }
  }, [activeWorkout]);
  
  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isTimerRunning) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning]);
  
  // Format elapsed time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start a new workout session
  const startNewWorkout = async () => {
    if (!workoutId) {
      toast.error('No workout selected');
      return;
    }
    
    const sessionData = await startWorkoutSession();
    if (sessionData) {
      setActiveSessionId(sessionData.id);
      setIsTimerRunning(true);
      
      if (activeWorkout) {
        setWorkoutName(activeWorkout.name);
      }
    }
  };
  
  // Toggle timer
  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };
  
  // Complete the workout
  const handleCompleteWorkout = async () => {
    if (!activeWorkout || !activeSessionId) {
      toast.error('Cannot complete workout: missing required information');
      return;
    }
    
    if (!workoutName.trim()) {
      toast.error('Please give your workout a name');
      return;
    }
    
    if (activeWorkout.exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    
    // Map exercises for logging
    const logExercises = activeWorkout.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      notes: ex.notes,
      sets: ex.sets.map(set => ({
        id: set.id,
        reps: set.reps,
        weight: set.weight,
        rest: set.rest,
        completed: true
      }))
    }));
    
    // Complete the workout
    completeWorkoutLog.mutate({
      logId: activeSessionId,
      duration: elapsedTime,
      notes: workoutNotes,
      exercises: logExercises
    }, {
      onSuccess: () => {
        setElapsedTime(0);
        setIsTimerRunning(false);
        setSelectedExerciseId(null);
        setActiveSessionId(null);
        navigate('/schedule');
      }
    });
  };

  if (!activeWorkout) {
    return (
      <div className="container max-w-5xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg mb-4">Please select a workout from the library first</p>
            <Button onClick={() => navigate('/library')}>
              Go to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-dark-200 rounded-md px-3 py-1">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
          
          {!activeSessionId ? (
            <Button 
              onClick={startNewWorkout}
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTimer}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Workout Name"
                className="text-lg font-bold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                readOnly={!activeSessionId}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCompleteWorkout}
                  className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  disabled={!activeSessionId || isLoading}
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
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Textarea 
              placeholder="Workout notes (optional)"
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              rows={2}
              className="resize-none bg-dark-200 border-dark-300"
              disabled={!activeSessionId}
            />
          </CardContent>
        </Card>
        
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {activeWorkout.exercises.map(exercise => (
              <Card key={exercise.id} className="overflow-hidden">
                <CardHeader>
                  <h3 className="font-medium">{exercise.name}</h3>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Set</th>
                        <th className="text-left">Weight</th>
                        <th className="text-left">Reps</th>
                        <th className="text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set, index) => (
                        <tr key={set.id}>
                          <td className="py-2">{index + 1}</td>
                          <td className="py-2">
                            <Input
                              type="text"
                              value={set.weight}
                              className="w-24 h-8"
                              placeholder="lbs"
                              disabled={!activeSessionId}
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="text"
                              value={set.reps}
                              className="w-20 h-8"
                              placeholder="reps"
                              disabled={!activeSessionId}
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="text"
                              placeholder="Notes"
                              className="w-full h-8"
                              disabled={!activeSessionId}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
