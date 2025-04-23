
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { useAIWorkoutGenerator, WorkoutGenerationParams, GeneratedWorkout } from '@/hooks/useAIWorkoutGenerator';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Dumbbell, Save, Download, Copy, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Abs', 'Legs', 'Glutes', 'Calves', 'Forearms',
  'Full Body', 'Core', 'Upper Body', 'Lower Body'
];

const equipmentOptions = [
  'None', 'Dumbbells', 'Barbell', 'Kettlebell',
  'Resistance Bands', 'Pull-up Bar', 'Bench', 'Cable Machine',
  'Squat Rack', 'TRX/Suspension Trainer', 'Medicine Ball'
];

export default function AIWorkoutGenerator() {
  const { user, session } = useAuth();
  const { generateWorkout, isGenerating, generatedWorkout, error, saveToWorkout } = useAIWorkoutGenerator();
  
  const [params, setParams] = useState<WorkoutGenerationParams>({
    fitnessLevel: 'intermediate',
    targetMuscles: [],
    duration: 45,
    equipment: [],
    goals: '',
    additionalNotes: ''
  });
  
  const [activeTab, setActiveTab] = useState('generator');
  const [savedWorkout, setSavedWorkout] = useState<{ id: string } | null>(null);

  const handleGenerate = () => {
    if (!session) {
      toast.error('You need to log in to generate workouts');
      return;
    }
    
    if (params.targetMuscles.length === 0) {
      toast.error('Please select at least one muscle group');
      return;
    }
    
    generateWorkout(params);
    setActiveTab('results');
  };
  
  const handleSave = async () => {
    if (!generatedWorkout) return;
    
    try {
      const result = await saveToWorkout(generatedWorkout);
      setSavedWorkout(result);
      toast.success('Workout saved to your library!');
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedWorkout) return;
    
    const workoutText = `
      ${generatedWorkout.name}
      
      ${generatedWorkout.description}
      
      Difficulty: ${generatedWorkout.difficulty}
      Duration: ${generatedWorkout.duration} minutes
      Target Muscles: ${generatedWorkout.targetMuscles.join(', ')}
      
      Exercises:
      ${generatedWorkout.exercises.map(ex => (
        `- ${ex.name}: ${ex.sets} sets of ${ex.reps}, Rest: ${ex.restBetweenSets}
         Notes: ${ex.notes}`
      )).join('\n')}
    `;
    
    navigator.clipboard.writeText(workoutText.trim());
    toast.success('Workout copied to clipboard!');
  };

  const toggleMuscleGroup = (muscle: string) => {
    if (params.targetMuscles.includes(muscle)) {
      setParams({
        ...params,
        targetMuscles: params.targetMuscles.filter(m => m !== muscle)
      });
    } else {
      setParams({
        ...params,
        targetMuscles: [...params.targetMuscles, muscle]
      });
    }
  };
  
  const toggleEquipment = (equipment: string) => {
    if (params.equipment?.includes(equipment)) {
      setParams({
        ...params,
        equipment: params.equipment.filter(e => e !== equipment)
      });
    } else {
      setParams({
        ...params,
        equipment: [...(params.equipment || []), equipment]
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card className="border border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-fitbloom-purple" />
            AI Workout Generator
          </CardTitle>
          <CardDescription>
            Generate personalized workouts tailored to your fitness goals and available equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="results" disabled={!generatedWorkout && !isGenerating}>
                Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fitness-level">Fitness Level</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                      <Button
                        key={level}
                        type="button"
                        variant={params.fitnessLevel === level ? "default" : "outline"}
                        onClick={() => setParams({...params, fitnessLevel: level as any})}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Target Muscle Groups</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {muscleGroups.map(muscle => (
                      <Badge
                        key={muscle}
                        variant={params.targetMuscles.includes(muscle) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-fitbloom-purple/80"
                        onClick={() => toggleMuscleGroup(muscle)}
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration">Workout Duration: {params.duration} minutes</Label>
                  <Slider
                    id="duration"
                    min={15}
                    max={120}
                    step={5}
                    value={[params.duration || 45]}
                    onValueChange={(values) => setParams({...params, duration: values[0]})}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Available Equipment</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {equipmentOptions.map(equipment => (
                      <Badge
                        key={equipment}
                        variant={params.equipment?.includes(equipment) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-fitbloom-purple/80"
                        onClick={() => toggleEquipment(equipment)}
                      >
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="goals">Fitness Goals</Label>
                  <Input
                    id="goals"
                    placeholder="e.g., weight loss, muscle gain, endurance"
                    value={params.goals || ''}
                    onChange={(e) => setParams({...params, goals: e.target.value})}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any injuries, preferences, or specific requests"
                    value={params.additionalNotes || ''}
                    onChange={(e) => setParams({...params, additionalNotes: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4 mt-4 min-h-[300px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <Loader2 className="h-12 w-12 text-fitbloom-purple animate-spin" />
                  <p className="mt-4 text-gray-400">Crafting your perfect workout...</p>
                </div>
              ) : generatedWorkout ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{generatedWorkout.name}</h3>
                    <p className="text-gray-400 mt-1">{generatedWorkout.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">{generatedWorkout.difficulty}</Badge>
                      <Badge variant="secondary">{generatedWorkout.duration} minutes</Badge>
                      {generatedWorkout.targetMuscles.map((muscle) => (
                        <Badge key={muscle} variant="outline">{muscle}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Exercises</h4>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {generatedWorkout.exercises.map((exercise, index) => (
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
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <p className="text-red-400">Failed to generate workout: {error.message}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('generator')}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {activeTab === 'generator' ? (
            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Workout'
                )}
              </Button>
            </div>
          ) : generatedWorkout ? (
            <div className="flex flex-wrap gap-2 w-full justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  disabled={!!savedWorkout}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savedWorkout ? 'Saved' : 'Save to Library'}
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('generator')}>
                  Regenerate
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
