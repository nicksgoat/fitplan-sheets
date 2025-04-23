import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useWorkoutLoggerIntegration } from '@/hooks/useWorkoutLoggerIntegration';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';
import { getOrganizedExercises } from '@/utils/workoutPreviewUtils';
import WorkoutLoggerHeader from '@/components/workout-logger/WorkoutLoggerHeader';
import ExerciseLogCard from '@/components/workout-logger/ExerciseLogCard';
import { WorkoutLogExercise } from '@/types/workoutLog';

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  const { program, setActiveWorkoutId } = useWorkout();
  
  const { 
    activeWorkout,
    startWorkoutSession, 
    completeWorkoutLog,
    isLoading
  } = useWorkoutLoggerIntegration();
  
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    if (workoutId) {
      setActiveWorkoutId(workoutId);
    }
  }, [workoutId, setActiveWorkoutId]);
  
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
      } else if (workoutDetail) {
        setWorkoutName(workoutDetail.name);
      }
    }
  };
  
  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };
  
  const handleCompleteWorkout = async () => {
    const workoutToLog = activeWorkout || workoutDetail;
    
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
    
    const logExercises: WorkoutLogExercise[] = [];
    
    const { exercises, circuitMap } = getOrganizedExercises(workoutToLog.exercises);
    
    exercises.forEach(ex => {
      if (ex.isCircuit && ex.circuitId) {
        const circuitExercises = circuitMap.get(ex.circuitId) || [];
        
        logExercises.push({
          id: ex.id,
          name: ex.name,
          notes: ex.notes,
          isCircuit: true,
          circuitId: ex.circuitId,
          sets: ex.sets.map(set => ({
            id: set.id,
            reps: set.reps,
            weight: set.weight,
            rest: set.rest,
            completed: true
          }))
        });
        
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

  if (!activeWorkout && !workoutDetail) {
    return (
      <div className="h-full flex flex-col">
        <WorkoutLoggerHeader
          workoutName=""
          onWorkoutNameChange={() => {}}
          elapsedTime={0}
          isTimerRunning={false}
          onToggleTimer={() => {}}
          onStartWorkout={() => navigate('/library')}
          onCompleteWorkout={() => {}}
          isLoading={false}
          activeSessionId={null}
        />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg mb-4">Please select a workout from the library first</p>
              <Button onClick={() => navigate('/library')}>
                Go to Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayWorkout = activeWorkout || workoutDetail;
  const { exercises: organizedExercises, circuitMap } = displayWorkout 
    ? getOrganizedExercises(displayWorkout.exercises) 
    : { exercises: [], circuitMap: new Map() };

  const circuitNames = new Map<string, string>();
  organizedExercises.forEach(exercise => {
    if (exercise.isCircuit && exercise.circuitId) {
      circuitNames.set(exercise.circuitId, exercise.name);
    }
  });

  return (
    <div className="h-full flex flex-col">
      <WorkoutLoggerHeader
        workoutName={workoutName}
        onWorkoutNameChange={setWorkoutName}
        elapsedTime={elapsedTime}
        isTimerRunning={isTimerRunning}
        onToggleTimer={toggleTimer}
        onStartWorkout={startNewWorkout}
        onCompleteWorkout={handleCompleteWorkout}
        isLoading={isLoading}
        activeSessionId={activeSessionId}
      />
      
      <div className="flex-1 flex flex-col px-4 py-3">
        {activeSessionId && (
          <Textarea 
            placeholder="Workout notes (optional)"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            rows={2}
            className="mb-4 resize-none bg-dark-200 border-dark-300"
          />
        )}
        
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-4 pb-4">
            {organizedExercises.map((exercise) => {
              if (exercise.isCircuit && exercise.circuitId) {
                const circuitExercises = circuitMap.get(exercise.circuitId) || [];
                
                return (
                  <Card key={exercise.id} className="mb-4 border border-blue-800 bg-blue-900/10">
                    <CardContent className="p-4">
                      <div className="px-4 py-3 mb-4 bg-blue-900/20 border border-blue-800 rounded-md">
                        <h3 className="font-medium text-blue-400">
                          Circuit: {exercise.name}
                        </h3>
                        {exercise.notes && (
                          <p className="text-sm text-gray-400">{exercise.notes}</p>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {circuitExercises.map((circuitEx) => (
                          <ExerciseLogCard
                            key={circuitEx.id}
                            exercise={circuitEx}
                            isDisabled={!activeSessionId}
                            isInCircuit={true}
                            circuitName={exercise.name}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              
              if (!exercise.isInCircuit) {
                return (
                  <ExerciseLogCard
                    key={exercise.id}
                    exercise={exercise}
                    isDisabled={!activeSessionId}
                  />
                );
              }
              
              return null;
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
