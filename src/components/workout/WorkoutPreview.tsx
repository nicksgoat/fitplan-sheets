import React from 'react';
import { Workout } from '@/types/workout';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Clock, Tag, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
interface WorkoutPreviewProps {
  workout: Workout;
}
const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  workout
}) => {
  // Calculate stats
  const totalSets = workout.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0);

  // Get a subset of exercises to preview (first 3)
  const previewExercises = workout.exercises.slice(0, 3);

  // Calculate equipment types
  const equipmentTypes = new Set<string>();
  workout.exercises.forEach(exercise => {
    if (exercise.name.toLowerCase().includes('dumbbell')) equipmentTypes.add('Dumbbells');
    if (exercise.name.toLowerCase().includes('barbell')) equipmentTypes.add('Barbell');
    if (exercise.name.toLowerCase().includes('machine')) equipmentTypes.add('Machine');
    if (exercise.name.toLowerCase().includes('cable')) equipmentTypes.add('Cable');
    if (exercise.name.toLowerCase().includes('bodyweight')) equipmentTypes.add('Bodyweight');
  });

  // Determine difficulty based on intensity and number of sets
  const getDifficulty = () => {
    if (totalSets > 25) return 'Advanced';
    if (totalSets > 15) return 'Intermediate';
    return 'Beginner';
  };
  return <div className="space-y-4">
      
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center p-3 bg-dark-300 rounded-md">
          <Dumbbell className="h-5 w-5 mr-3 text-fitbloom-purple" />
          <span>{workout.exercises.length} Exercises</span>
        </div>
        <div className="flex items-center p-3 bg-dark-300 rounded-md">
          <Clock className="h-5 w-5 mr-3 text-fitbloom-purple" />
          <span>~{totalSets} Sets Total</span>
        </div>
        <div className="flex items-center p-3 bg-dark-300 rounded-md">
          <Tag className="h-5 w-5 mr-3 text-fitbloom-purple" />
          <span>Day {workout.day}</span>
        </div>
        <div className="flex items-center p-3 bg-dark-300 rounded-md justify-between">
          <div className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-3 text-fitbloom-purple" />
            <span>Difficulty</span>
          </div>
          <Badge className="bg-amber-600">{getDifficulty()}</Badge>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Sample Exercises</h4>
        <Card className="bg-dark-300 border-dark-400">
          <CardContent className="p-3 space-y-2">
            {previewExercises.map((exercise, index) => <div key={exercise.id} className="border-b border-dark-400 pb-2 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="font-medium">{index + 1}. {exercise.name}</span>
                  <span className="text-gray-400">{exercise.sets?.length || 0} sets</span>
                </div>
                {/* Show the first set as a preview */}
                {exercise.sets && exercise.sets[0] && <div className="text-sm text-gray-400 mt-1">
                    {exercise.sets[0].reps && `Reps: ${exercise.sets[0].reps}`}
                    {exercise.sets[0].weight && ` | Weight: ${exercise.sets[0].weight}`}
                  </div>}
              </div>)}
            
            {workout.exercises.length > 3 && <div className="text-center text-sm text-gray-500 pt-1">
                + {workout.exercises.length - 3} more exercises
              </div>}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Workout Features</h4>
        <div className="space-y-2">
          <div className="flex items-start">
            <Check className="h-5 w-5 text-fitbloom-purple mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">Complete workout programming with sets, reps and instructions</span>
          </div>
          <div className="flex items-start">
            <Check className="h-5 w-5 text-fitbloom-purple mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">Equipment needed: {Array.from(equipmentTypes).join(', ') || 'Various'}</span>
          </div>
          <div className="flex items-start">
            <Check className="h-5 w-5 text-fitbloom-purple mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">Detailed notes and guidance for proper execution</span>
          </div>
          <div className="flex items-start">
            <Check className="h-5 w-5 text-fitbloom-purple mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">Track your progress with the workout tracking tool</span>
          </div>
        </div>
      </div>
    </div>;
};
export default WorkoutPreview;