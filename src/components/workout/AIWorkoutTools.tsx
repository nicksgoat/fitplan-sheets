
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAIWorkoutTools, FileUpload } from '@/hooks/useAIWorkoutTools';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Upload, History, Save, Download, FileText, FilePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWorkout } from '@/contexts/WorkoutContext';
import { GeneratedWorkout } from '@/hooks/useAIWorkoutGenerator';

export default function AIWorkoutTools() {
  const { user, session } = useAuth();
  const { 
    generateFromHistory, 
    processUpload, 
    handleFileUpload, 
    convertToPlatformFormat,
    uploadedFile, 
    generatedWorkoutFromHistory,
    generatedWorkoutFromUpload,
    isGenerating
  } = useAIWorkoutTools();
  
  const { addWorkout, activeWeekId, program, setActiveWorkoutId } = useWorkout();
  
  const [activeTab, setActiveTab] = useState('history');
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);

  // Mock workout data - in a real implementation, you'd fetch from the database
  const mockRecentWorkouts = program?.workouts || [];
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileError(null);
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit');
      return;
    }
    
    // Check file type
    const validTypes = ['text/plain', 'application/pdf', 'application/vnd.ms-excel', 
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                        'text/csv'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a PDF, Excel, CSV, or text file.');
      return;
    }
    
    try {
      await handleFileUpload(file);
    } catch (error: any) {
      setFileError(error.message || 'Failed to read file');
    }
  };
  
  const handleProcessFile = () => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }
    
    processUpload(uploadedFile);
  };
  
  const handleGenerateFromHistory = () => {
    if (selectedWorkouts.length === 0) {
      toast.error('Please select at least one workout from your history');
      return;
    }
    
    const filteredWorkouts = mockRecentWorkouts.filter(w => 
      selectedWorkouts.includes(w.id)
    );
    
    if (filteredWorkouts.length === 0) {
      toast.error('No valid workouts found in selection');
      return;
    }
    
    generateFromHistory(filteredWorkouts);
  };
  
  const toggleWorkoutSelection = (workoutId: string) => {
    if (selectedWorkouts.includes(workoutId)) {
      setSelectedWorkouts(selectedWorkouts.filter(id => id !== workoutId));
    } else {
      setSelectedWorkouts([...selectedWorkouts, workoutId]);
    }
  };
  
  const addToCurrentProgram = (generatedWorkout: GeneratedWorkout | undefined) => {
    if (!generatedWorkout || !activeWeekId) {
      toast.error('No workout generated or no active week selected');
      return;
    }
    
    try {
      // Convert generated workout to platform format
      const platformWorkout = convertToPlatformFormat(generatedWorkout);
      
      // Add the workout to the current program
      const newWorkoutId = addWorkout(activeWeekId);
      
      if (typeof newWorkoutId === 'string') {
        // Set it as active workout
        setActiveWorkoutId(newWorkoutId);
        toast.success('Generated workout added to your program!');
      }
    } catch (error: any) {
      console.error('Error adding generated workout:', error);
      toast.error(`Failed to add workout: ${error.message}`);
    }
  };

  const currentGeneratedWorkout = activeTab === 'history' ? generatedWorkoutFromHistory : generatedWorkoutFromUpload;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1">
          <FilePlus className="h-4 w-4" />
          <span>AI Tools</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FilePlus className="h-6 w-6 text-fitbloom-purple" />
            AI Workout Tools
          </DialogTitle>
          <DialogDescription>
            Generate workouts from your history or import from external documents
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" /> 
              Generate from History
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload & Parse
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-medium">Select Workouts to Analyze</Label>
                <p className="text-sm text-gray-400 mb-4">
                  Choose up to 10 workouts from your history. Our AI will analyze these to generate a new workout.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockRecentWorkouts.length > 0 ? (
                    mockRecentWorkouts.map((workout) => (
                      <Card 
                        key={workout.id} 
                        className={`cursor-pointer transition-all ${
                          selectedWorkouts.includes(workout.id) 
                            ? 'border-fitbloom-purple bg-fitbloom-purple/10' 
                            : 'border-gray-700'
                        }`}
                        onClick={() => toggleWorkoutSelection(workout.id)}
                      >
                        <CardHeader className="py-3">
                          <CardTitle className="text-base flex justify-between items-center">
                            <span>{workout.name}</span>
                            {selectedWorkouts.includes(workout.id) && (
                              <Badge>Selected</Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="text-sm text-gray-400">
                            {workout.exercises.length} exercises
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 p-6 text-center border border-dashed border-gray-700 rounded-lg">
                      <p className="text-gray-400">No workout history found. Create some workouts first.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateFromHistory}
                  className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  disabled={isGenerating || selectedWorkouts.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Workout
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-medium">Upload Document</Label>
                <p className="text-sm text-gray-400 mb-4">
                  Upload a PDF, Excel, CSV, or text file containing workout information to convert it.
                </p>
                
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="file-upload">File</Label>
                  <Input id="file-upload" type="file" onChange={handleFileChange} />
                  {fileError && (
                    <p className="text-sm text-red-500">{fileError}</p>
                  )}
                </div>
                
                {uploadedFile && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{uploadedFile.file.name}</span>
                      <Badge className="ml-2">{(uploadedFile.file.size / 1024).toFixed(2)} KB</Badge>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleProcessFile}
                  className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  disabled={isGenerating || !uploadedFile}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {currentGeneratedWorkout && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">{currentGeneratedWorkout.name}</h3>
                <p className="text-gray-400 mt-1">{currentGeneratedWorkout.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{currentGeneratedWorkout.difficulty}</Badge>
                  <Badge variant="secondary">{currentGeneratedWorkout.duration} minutes</Badge>
                  {currentGeneratedWorkout.targetMuscles?.map((muscle: string) => (
                    <Badge key={muscle} variant="outline">{muscle}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-3">Exercises</h4>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {currentGeneratedWorkout.exercises.map((exercise: any, index: number) => (
                      <Card key={index} className="bg-gray-800/50">
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">{exercise.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Sets:</span> {exercise.sets}
                            </div>
                            <div>
                              <span className="text-gray-400">Reps:</span> {exercise.reps}
                            </div>
                            <div>
                              <span className="text-gray-400">Rest:</span> {exercise.restBetweenSets}
                            </div>
                          </div>
                          {exercise.notes && (
                            <div className="mt-2 text-sm text-gray-400">
                              <span className="font-medium">Notes:</span> {exercise.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Reset the process
                  setActiveTab('history');
                  setSelectedWorkouts([]);
                }}
              >
                Start Over
              </Button>
              {activeWeekId && (
                <Button 
                  className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  onClick={() => addToCurrentProgram(currentGeneratedWorkout)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Add to Program
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
