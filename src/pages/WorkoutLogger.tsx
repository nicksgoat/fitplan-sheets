import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
  Trash2
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

export default function WorkoutLogger() {
  const { user } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
  const startNewWorkout = () => {
    if (activeWorkout) {
      if (!window.confirm('You have an active workout. Starting a new one will discard the current session. Continue?')) {
        return;
      }
    }
    
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
    setWorkoutNotes('');
    setExercises([]);
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
    if (!activeWorkout || !user?.id) return;
    
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
    
    setIsLoading(true);
    
    try {
      const completedWorkout: Workout = {
        ...activeWorkout,
        name: workoutName,
        exercises,
        circuits: []
      };

      const now = new Date().toISOString();
      
      // Save to Supabase
      const { error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_id: completedWorkout.id,
          duration: elapsedTime,
          notes: workoutNotes,
          start_time: new Date(Date.now() - elapsedTime * 1000).toISOString(),
          end_time: now,
          // Store exercises and sets as JSON in separate tables or columns if needed
        });
      
      if (error) throw error;
      
      toast.success('Workout logged successfully!');
      
      // Reset state
      setActiveWorkout(null);
      setWorkoutName('');
      setWorkoutNotes('');
      setExercises([]);
      setElapsedTime(0);
      setIsTimerRunning(false);
      setSelectedExerciseId(null);
    } catch (error: any) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workout Logger</h1>
        
        {!activeWorkout ? (
          <Button 
            onClick={startNewWorkout} 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            <Play className="h-4 w-4 mr-2" />
            Start New Workout
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
      
      {activeWorkout ? (
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
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    {format(new Date(), 'MMM dd')}
                  </Button>
                  <Button 
                    onClick={completeWorkout}
                    disabled={isLoading}
                    className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
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
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.reps}
                                onChange={(e) => updateSetDetails(selectedExerciseId, set.id, 'reps', e.target.value)}
                                className="w-20 h-8 text-center bg-dark-200"
                                placeholder="reps"
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.rest}
                                onChange={(e) => updateSetDetails(selectedExerciseId, set.id, 'rest', e.target.value)}
                                className="w-20 h-8 text-center bg-dark-200"
                                placeholder="sec"
                              />
                            </td>
                            <td className="py-2 text-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => deleteSet(selectedExerciseId, set.id)}
                                disabled={exercises.find(ex => ex.id === selectedExerciseId)?.sets.length === 1}
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
            <Button 
              onClick={startNewWorkout} 
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
