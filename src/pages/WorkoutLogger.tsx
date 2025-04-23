
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Pause, Save, Clock, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useWorkoutLoggerIntegration, WorkoutLogExercise } from '@/hooks/useWorkoutLoggerIntegration';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';
import { getOrganizedExercises } from '@/utils/workoutPreviewUtils';
import { Exercise } from '@/types/workout';

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  const { program, setActiveWorkoutId } = useWorkout();
  
  // Fetch workout details if we have a workoutId
  const { workout: workoutDetails } = useWorkoutDetail(workoutId || null);
  
  // Integration with workout logger
  const { 
    activeWorkout,
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
  
  // Set active workout ID when navigating directly to this page
  useEffect(() => {
    if (workoutId) {
      setActiveWorkoutId(workoutId);
    }
  }, [workoutId, setActiveWorkoutId]);
  
  // Update workout name when active workout changes
  useEffect(() => {
    if (activeWorkout) {
      setWorkoutName(activeWorkout.name);
    } else if (workoutDetails) {
      setWorkoutName(workoutDetails.name);
    }
  }, [activeWorkout, workoutDetails]);
  
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
      } else if (workoutDetails) {
        setWorkoutName(workoutDetails.name);
      }
    }
  };
  
  // Toggle timer
  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };
  
  // Complete the workout
  const handleCompleteWorkout = async () => {
    const workoutToLog = activeWorkout || workoutDetails;
    
    if (!workoutToLog || !activeSessionId) {
      toast.error('Cannot complete workout: missing required information');
      return;
    }
    
    if (!workoutName.trim()) {
      toast.error('Please give your workout a name');
      return;
    }
    
    if (workoutToLog.exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    
    // Map exercises for logging, preserving circuit structure
    const logExercises: WorkoutLogExercise[] = [];
    
    // Get organized exercises with circuit mapping
    const { exercises, circuitMap } = getOrganizedExercises(workoutToLog.exercises);
    
    // Process top-level exercises
    exercises.forEach(ex => {
      // Add circuit container exercise
      if (ex.isCircuit && ex.circuitId) {
        const circuitExercises = circuitMap.get(ex.circuitId) || [];
        
        // Log the parent circuit exercise
        logExercises.push({
          id: ex.id,
          name: ex.name,
          notes: ex.notes,
          isCircuit: true,
          sets: ex.sets.map(set => ({
            id: set.id,
            reps: set.reps,
            weight: set.weight,
            rest: set.rest,
            completed: true
          }))
        });
        
        // Log all exercises in the circuit
        circuitExercises.forEach(circuitEx => {
          logExercises.push({
            id: circuitEx.id,
            name: circuitEx.name,
            notes: circuitEx.notes,
            isInCircuit: true,
            circuitId: ex.circuitId,
            sets: circuitEx.sets.map(set => ({
              id: set.id,
              reps: set.reps,
              weight: set.weight,
              rest: set.rest,
              completed: true
            }))
          });
        });
      } 
      // Regular exercise
      else if (!ex.isInCircuit) {
        logExercises.push({
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
        });
      }
    });
    
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
        setActiveSessionId(null);
        navigate('/schedule');
      }
    });
  };

  // If no workout is available, show placeholder
  if (!activeWorkout && !workoutDetails) {
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

  // Use workout from context or from direct fetch
  const displayWorkout = activeWorkout || workoutDetails;
  
  // Get organized exercises for display
  const { exercises: organizedExercises, circuitMap } = displayWorkout 
    ? getOrganizedExercises(displayWorkout.exercises) 
    : { exercises: [], circuitMap: new Map() };

  // Function to render a set row for an exercise
  const renderSetRow = (set: any, index: number, isDisabled: boolean) => (
    <tr key={set.id || index}>
      <td className="py-2">{index + 1}</td>
      <td className="py-2">
        <Input
          type="text"
          defaultValue={set.weight}
          className="w-24 h-8"
          placeholder="lbs"
          disabled={isDisabled}
        />
      </td>
      <td className="py-2">
        <Input
          type="text"
          defaultValue={set.reps}
          className="w-20 h-8"
          placeholder="reps"
          disabled={isDisabled}
        />
      </td>
      <td className="py-2">
        <Input
          type="text"
          placeholder="Notes"
          className="w-full h-8"
          disabled={isDisabled}
        />
      </td>
    </tr>
  );

  // Function to render a standard exercise card
  const renderExerciseCard = (exercise: Exercise) => (
    <Card key={exercise.id} className="mb-4">
      <CardHeader>
        <h3 className="font-medium">{exercise.name}</h3>
        {exercise.notes && <p className="text-sm text-gray-400">{exercise.notes}</p>}
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
            {exercise.sets.map((set, index) => 
              renderSetRow(set, index, !activeSessionId)
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );

  // Function to render a circuit card with its exercises
  const renderCircuitCard = (circuitExercise: Exercise) => {
    // Get circuit exercises from the circuit map
    const circuitExercises = circuitMap.get(circuitExercise.circuitId || '') || [];
    
    return (
      <Card key={circuitExercise.id} className="mb-4 border border-blue-800 bg-blue-900/10">
        <CardHeader className="bg-blue-900/20 border-b border-blue-800">
          <h3 className="font-medium text-blue-400">Circuit: {circuitExercise.name}</h3>
          {circuitExercise.notes && <p className="text-sm text-gray-400">{circuitExercise.notes}</p>}
        </CardHeader>
        <CardContent className="p-0">
          {circuitExercises.length > 0 ? (
            circuitExercises.map((circuitEx) => (
              <div key={circuitEx.id} className="border-t border-blue-800/30 p-4">
                <h4 className="text-md font-medium mb-2">{circuitEx.name}</h4>
                {circuitEx.notes && <p className="text-xs text-gray-400 mb-3">{circuitEx.notes}</p>}
                
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm">Set</th>
                      <th className="text-left text-sm">Weight</th>
                      <th className="text-left text-sm">Reps</th>
                      <th className="text-left text-sm">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {circuitEx.sets.map((set, index) => 
                      renderSetRow(set, index, !activeSessionId)
                    )}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-400 italic">No exercises in this circuit</div>
          )}
        </CardContent>
      </Card>
    );
  };

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
            {organizedExercises.map((exercise) => {
              if (exercise.isCircuit && exercise.circuitId) {
                return renderCircuitCard(exercise);
              } else if (!exercise.isInCircuit) {
                return renderExerciseCard(exercise);
              }
              // Skip exercises that are in circuits (they're handled by their parent)
              return null;
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
