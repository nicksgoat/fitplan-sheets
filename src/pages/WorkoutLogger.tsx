
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Plus, 
  Save,
  Clock,
  Check,
  Award,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Dumbbell,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Workout, Exercise, Set } from '@/types/workout';
import { useWorkoutLoggerIntegration, WorkoutLogExercise } from '@/hooks/useWorkoutLoggerIntegration';

export default function WorkoutLogger() {
  const { user } = useAuth();
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('programId');
  const navigate = useNavigate();
  
  // Integration with existing workout and program logic
  const { 
    workout, 
    workoutLoading, 
    program, 
    programLoading, 
    startWorkoutSession, 
    completeWorkoutLog, 
    isLoading: integrationLoading 
  } = useWorkoutLoggerIntegration(workoutId, programId || undefined);
  
  // Local state
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Initialize workout from fetched data
  useEffect(() => {
    if (workout) {
      setActiveWorkout(workout);
      setWorkoutName(workout.name);
      setExercises(workout.exercises);
      
      // Select the first exercise by default if available
      if (workout.exercises.length > 0) {
        setSelectedExerciseId(workout.exercises[0].id);
      }
    }
  }, [workout]);
  
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
    if (activeWorkout) {
      if (!window.confirm('You have an active workout. Starting a new one will discard the current session. Continue?')) {
        return;
      }
    }
    
    // Use the fetched workout if available, otherwise create a blank one
    if (workout) {
      setActiveWorkout(workout);
      setWorkoutName(workout.name);
      setExercises(workout.exercises);
      
      // Select the first exercise by default if available
      if (workout.exercises.length > 0) {
        setSelectedExerciseId(workout.exercises[0].id);
      }
      
      // Start the workout session in the database
      const sessionData = await startWorkoutSession(workout);
      if (sessionData) {
        setActiveSessionId(sessionData.id);
      }
    } else {
      // Create a blank workout if no workout is loaded
      const today = format(new Date(), 'EEEE, MMMM d');
      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        name: `Workout - ${today}`,
        day: 1,
        exercises: [],
        circuits: []
      };
      
      setActiveWorkout(newWorkout);
      setWorkoutName(newWorkout.name);
      setExercises([]);
      
      // Start the workout session in the database
      const sessionData = await startWorkoutSession(newWorkout);
      if (sessionData) {
        setActiveSessionId(sessionData.id);
      }
    }
    
    setWorkoutNotes('');
    setElapsedTime(0);
    setIsTimerRunning(true);
  };
  
  // Toggle timer
  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };
  
  // Add a new exercise
  const addExercise = () => {
    if (!activeWorkout) {
      toast.error('Start a workout first');
      return;
    }
    
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: 'New Exercise',
      sets: [{
        id: crypto.randomUUID(),
        reps: '',
        weight: '',
        intensity: '',
        rest: '90'
      }],
      notes: ''
    };
    
    setExercises([...exercises, newExercise]);
    setSelectedExerciseId(newExercise.id);
  };
  
  // Add set to exercise
  const addSetToExercise = (exerciseId: string) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, {
            id: crypto.randomUUID(),
            reps: ex.sets[0].reps, // Copy values from previous set
            weight: ex.sets[0].weight,
            intensity: ex.sets[0].intensity,
            rest: ex.sets[0].rest
          }]
        };
      }
      return ex;
    });
    
    setExercises(updatedExercises);
  };
  
  // Update exercise name
  const updateExerciseName = (exerciseId: string, name: string) => {
    const updatedExercises = exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, name } : ex
    );
    setExercises(updatedExercises);
  };
  
  // Update set details
  const updateSetDetails = (exerciseId: string, setId: string, field: keyof Set, value: string) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => 
            set.id === setId ? { ...set, [field]: value } : set
          )
        };
      }
      return ex;
    });
    
    setExercises(updatedExercises);
  };
  
  // Delete set
  const deleteSet = (exerciseId: string, setId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise || exercise.sets.length <= 1) {
      toast.error('Cannot delete the only set');
      return;
    }
    
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(set => set.id !== setId)
        };
      }
      return ex;
    });
    
    setExercises(updatedExercises);
  };
  
  // Delete exercise
  const deleteExercise = (exerciseId: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);
    setExercises(updatedExercises);
    
    if (selectedExerciseId === exerciseId) {
      setSelectedExerciseId(updatedExercises.length > 0 ? updatedExercises[0].id : null);
    }
  };
  
  // Complete the workout
  const completeWorkout = async () => {
    if (!activeWorkout || !user?.id || !activeSessionId) {
      toast.error('Cannot complete workout: missing required information');
      return;
    }
    
    // Validation
    if (!workoutName.trim()) {
      toast.error('Please give your workout a name');
      return;
    }
    
    if (exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    
    if (exercises.some(ex => ex.name === 'New Exercise')) {
      toast.error('Please name all exercises');
      return;
    }
    
    // Map exercises to the format expected by completeWorkoutLog
    const logExercises: WorkoutLogExercise[] = exercises.map(ex => ({
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
    
    // Complete the workout using the integration hook
    completeWorkoutLog.mutate({
      logId: activeSessionId,
      duration: elapsedTime,
      notes: workoutNotes,
      exercises: logExercises
    }, {
      onSuccess: () => {
        // Reset state
        setActiveWorkout(null);
        setWorkoutName('');
        setWorkoutNotes('');
        setExercises([]);
        setElapsedTime(0);
        setIsTimerRunning(false);
        setSelectedExerciseId(null);
        setActiveSessionId(null);
        
        // Navigate to a success page or back to schedules
        toast.success('Workout completed successfully!');
        setTimeout(() => {
          navigate('/schedule');
        }, 1500);
      }
    });
  };
  
  // Return to workout detail if we came from there
  const handleBackToDetail = () => {
    if (workoutId) {
      navigate(`/workout/${workoutId}`);
    } else {
      navigate(-1);
    }
  };
  
  // Loading state
  const isPageLoading = workoutLoading || programLoading || integrationLoading || completeWorkoutLog.isPending;
  
  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={handleBackToDetail}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-2xl font-bold">
          {workout ? `Log: ${workout.name}` : 'Workout Logger'}
          {program && <span className="text-sm text-gray-400 ml-2">({program.name})</span>}
        </h1>
        
        {!activeWorkout ? (
          <Button 
            onClick={startNewWorkout} 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            disabled={isPageLoading}
          >
            <Play className="h-4 w-4 mr-2" />
            {workout ? 'Start This Workout' : 'Start New Workout'}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-dark-200 rounded-md px-3 py-1">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTimer}
              disabled={isPageLoading}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
      
      {isPageLoading && !activeWorkout ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 border-4 border-t-fitbloom-purple animate-spin rounded-full"></div>
            <p className="mt-4">Loading workout...</p>
          </div>
        </div>
      ) : activeWorkout ? (
        <div className="space-y-6">
          {/* Workout Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Input
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Workout Name"
                  className="text-lg font-bold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  disabled={isPageLoading}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPageLoading}
                    className="gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    {format(new Date(), 'MMM dd')}
                  </Button>
                  <Button 
                    onClick={completeWorkout}
                    disabled={isPageLoading}
                    className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  >
                    {isPageLoading ? (
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
                disabled={isPageLoading}
              />
            </CardContent>
          </Card>
          
          {/* Exercises Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exercise List */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  Exercises
                  <Button 
                    onClick={addExercise} 
                    size="sm" 
                    variant="ghost"
                    disabled={isPageLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-2">
                    {exercises.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>No exercises added yet</p>
                        <p className="text-sm">Click + to add your first exercise</p>
                      </div>
                    ) : (
                      exercises.map(exercise => (
                        <div 
                          key={exercise.id} 
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedExerciseId === exercise.id 
                              ? 'bg-fitbloom-purple/20 border border-fitbloom-purple/40' 
                              : 'bg-dark-200 hover:bg-dark-300 border border-dark-300'
                          }`}
                          onClick={() => setSelectedExerciseId(exercise.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{exercise.name}</h3>
                              <div className="text-sm text-gray-400 mt-1">
                                {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 hover:opacity-100 text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteExercise(exercise.id);
                              }}
                              disabled={isPageLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Selected Exercise Detail */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {selectedExerciseId ? (
                    <Input
                      value={exercises.find(ex => ex.id === selectedExerciseId)?.name || ''}
                      onChange={(e) => updateExerciseName(selectedExerciseId, e.target.value)}
                      placeholder="Exercise Name"
                      className="text-lg font-bold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                      disabled={isPageLoading}
                    />
                  ) : (
                    "Select or add an exercise"
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {selectedExerciseId ? (
                  <>
                    <table className="w-full">
                      <thead className="border-b border-gray-800">
                        <tr>
                          <th className="pb-2 text-left text-gray-400 font-medium text-sm">#</th>
                          <th className="pb-2 text-left text-gray-400 font-medium text-sm">Weight</th>
                          <th className="pb-2 text-left text-gray-400 font-medium text-sm">Reps</th>
                          <th className="pb-2 text-left text-gray-400 font-medium text-sm">Rest</th>
                          <th className="pb-2 text-center text-gray-400 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercises.find(ex => ex.id === selectedExerciseId)?.sets.map((set, index) => (
                          <tr key={set.id} className="border-b border-dark-300 last:border-0">
                            <td className="py-3 text-sm">Set {index + 1}</td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.weight}
                                onChange={(e) => updateSetDetails(selectedExerciseId, set.id, 'weight', e.target.value)}
                                className="w-24 h-8 text-center bg-dark-200"
                                placeholder="lbs"
                                disabled={isPageLoading}
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.reps}
                                onChange={(e) => updateSetDetails(selectedExerciseId, set.id, 'reps', e.target.value)}
                                className="w-20 h-8 text-center bg-dark-200"
                                placeholder="reps"
                                disabled={isPageLoading}
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.rest}
                                onChange={(e) => updateSetDetails(selectedExerciseId, set.id, 'rest', e.target.value)}
                                className="w-20 h-8 text-center bg-dark-200"
                                placeholder="sec"
                                disabled={isPageLoading}
                              />
                            </td>
                            <td className="py-2 text-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => deleteSet(selectedExerciseId, set.id)}
                                disabled={exercises.find(ex => ex.id === selectedExerciseId)?.sets.length === 1 || isPageLoading}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSetToExercise(selectedExerciseId)}
                      className="mt-4 w-full border-dashed"
                      disabled={isPageLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Set
                    </Button>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Exercise Notes</h4>
                      <Textarea
                        placeholder="Notes about this exercise (optional)"
                        value={exercises.find(ex => ex.id === selectedExerciseId)?.notes || ''}
                        onChange={(e) => {
                          const updatedExercises = exercises.map(ex => 
                            ex.id === selectedExerciseId ? { ...ex, notes: e.target.value } : ex
                          );
                          setExercises(updatedExercises);
                        }}
                        rows={2}
                        className="resize-none bg-dark-200 border-dark-300"
                        disabled={isPageLoading}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Edit className="h-12 w-12 mb-4 opacity-20" />
                    <p>Select an exercise from the list</p>
                    <p className="text-sm">or add a new one</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-dark-200 p-10 rounded-lg text-center w-full max-w-md">
            <Award className="h-16 w-16 mx-auto mb-4 text-fitbloom-purple opacity-60" />
            <h2 className="text-xl font-bold mb-2">Track Your Workout</h2>
            <p className="text-gray-400 mb-6">
              Log your exercises, sets, reps, and weights to track your progress over time.
            </p>
            {workout ? (
              <Button 
                onClick={startNewWorkout} 
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 w-full"
                disabled={isPageLoading}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Start This Workout
              </Button>
            ) : (
              <Button 
                onClick={startNewWorkout} 
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 w-full"
                disabled={isPageLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
