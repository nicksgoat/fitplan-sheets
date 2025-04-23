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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useWorkoutLoggerIntegration } from '@/hooks/useWorkoutLoggerIntegration';
import { Set } from '@/types/workout';

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('programId');
  
  // Use the workout context
  const { 
    program,
    workout: activeWorkout,
    addExercise,
    updateExercise,
    updateSet,
    addSet: addNewSet,
    deleteSet: removeSet,
    deleteExercise: removeExercise,
    updateWorkoutName
  } = useWorkout();
  
  // Integration with workout logger
  const { 
    startWorkoutSession, 
    completeWorkoutLog, 
    isLoading: integrationLoading 
  } = useWorkoutLoggerIntegration();
  
  // Local state
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
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
    
    // Start the workout session in the database
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
  
  // Update exercise name
  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    updateExercise(workoutId!, exerciseId, { name });
  };
  
  // Update set details
  const handleUpdateSet = (exerciseId: string, setId: string, field: keyof Set, value: string) => {
    updateSet(workoutId!, exerciseId, setId, { [field]: value });
  };
  
  // Add set to exercise
  const handleAddSet = (exerciseId: string) => {
    addNewSet(workoutId!, exerciseId);
  };
  
  // Delete set
  const handleDeleteSet = (exerciseId: string, setId: string) => {
    removeSet(workoutId!, exerciseId, setId);
  };
  
  // Delete exercise
  const handleDeleteExercise = (exerciseId: string) => {
    removeExercise(workoutId!, exerciseId);
    
    if (selectedExerciseId === exerciseId) {
      setSelectedExerciseId(null);
    }
  };
  
  // Complete the workout
  const handleCompleteWorkout = async () => {
    if (!activeWorkout || !activeSessionId) {
      toast.error('Cannot complete workout: missing required information');
      return;
    }
    
    // Validation
    if (!workoutName.trim()) {
      toast.error('Please give your workout a name');
      return;
    }
    
    if (activeWorkout.exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    
    // Map exercises to the format expected by completeWorkoutLog
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
    
    // Complete the workout using the integration hook
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
        
        setTimeout(() => {
          navigate('/schedule');
        }, 1500);
      }
    });
  };
  
  // Return to workout detail
  const handleBackToDetail = () => {
    if (workoutId) {
      navigate(`/workout/${workoutId}`);
    } else {
      navigate(-1);
    }
  };

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
          {activeWorkout ? `Log: ${activeWorkout.name}` : 'Workout Logger'}
          {program && <span className="text-sm text-gray-400 ml-2">({program.name})</span>}
        </h1>
        
        {!activeWorkout ? (
          <Button 
            onClick={startNewWorkout} 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            disabled={!workoutId}
          >
            <Play className="h-4 w-4 mr-2" />
            {activeWorkout ? 'Start This Workout' : 'Start New Workout'}
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
      
      {!activeWorkout ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 border-4 border-t-fitbloom-purple animate-spin rounded-full"></div>
            <p className="mt-4">Loading workout...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Workout Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Input
                  value={workoutName}
                  onChange={(e) => {
                    setWorkoutName(e.target.value);
                    if (activeWorkout) {
                      updateWorkoutName(activeWorkout.id, e.target.value);
                    }
                  }}
                  placeholder="Workout Name"
                  className="text-lg font-bold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    {format(new Date(), 'MMM dd')}
                  </Button>
                  <Button 
                    onClick={handleCompleteWorkout}
                    className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  >
                    {integrationLoading ? (
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
                    onClick={() => addExercise(activeWorkout.id)} 
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
                    {activeWorkout.exercises.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>No exercises added yet</p>
                        <p className="text-sm">Click + to add your first exercise</p>
                      </div>
                    ) : (
                      activeWorkout.exercises.map(exercise => (
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
                                handleDeleteExercise(exercise.id);
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
                      value={activeWorkout.exercises.find(ex => ex.id === selectedExerciseId)?.name || ''}
                      onChange={(e) => handleUpdateExerciseName(selectedExerciseId, e.target.value)}
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
                        {activeWorkout.exercises.find(ex => ex.id === selectedExerciseId)?.sets.map((set, index) => (
                          <tr key={set.id} className="border-b border-dark-300 last:border-0">
                            <td className="py-3 text-sm">Set {index + 1}</td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.weight}
                                onChange={(e) => handleUpdateSet(selectedExerciseId, set.id, 'weight', e.target.value)}
                                className="w-24 h-8 text-center bg-dark-200"
                                placeholder="lbs"
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.reps}
                                onChange={(e) => handleUpdateSet(selectedExerciseId, set.id, 'reps', e.target.value)}
                                className="w-20 h-8 text-center bg-dark-200"
                                placeholder="reps"
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="text"
                                value={set.rest}
                                onChange={(e) => handleUpdateSet(selectedExerciseId, set.id, 'rest', e.target.value)}
                                className="w-20 h-8 text-center bg-dark-200"
                                placeholder="sec"
                              />
                            </td>
                            <td className="py-2 text-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleDeleteSet(selectedExerciseId, set.id)}
                                disabled={activeWorkout.exercises.find(ex => ex.id === selectedExerciseId)?.sets.length === 1}
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
                      onClick={() => handleAddSet(selectedExerciseId)}
                      className="mt-4 w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Set
                    </Button>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Exercise Notes</h4>
                      <Textarea
                        placeholder="Notes about this exercise (optional)"
                        value={activeWorkout.exercises.find(ex => ex.id === selectedExerciseId)?.notes || ''}
                        onChange={(e) => {
                          if (activeWorkout && selectedExerciseId) {
                            updateExercise(activeWorkout.id, selectedExerciseId, { notes: e.target.value });
                          }
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
      )}
    </div>
  );
}
