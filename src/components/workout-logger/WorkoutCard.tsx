
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Exercise, Workout } from '@/types/workout';
import { Calendar, ChevronRight } from 'lucide-react';

interface WorkoutCardProps {
  workout: Workout;
  onSelect: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onSelect }) => {
  const formatExerciseSummary = (exercises: Exercise[]) => {
    return `${exercises.length} exercises`;
  };

  return (
    <Card 
      onClick={onSelect}
      className="bg-dark-200 hover:bg-dark-300 transition-all cursor-pointer group"
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-white">{workout.name}</h3>
            <p className="text-sm text-gray-400">{formatExerciseSummary(workout.exercises)}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-400 transition-colors" />
        </div>

        {workout.exercises.map((exercise, index) => (
          <div 
            key={exercise.id} 
            className="border-t border-dark-300 py-3 first:border-t-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium text-white">{exercise.name}</h4>
                {exercise.sets.length > 0 && (
                  <p className="text-xs text-gray-400">
                    {exercise.sets.length} × {exercise.sets[0].reps || '-'}
                    {exercise.sets[0].weight && ` @ ${exercise.sets[0].weight}`}
                  </p>
                )}
              </div>
            </div>
            {exercise.notes && (
              <p className="text-xs text-gray-500 mt-1 italic">{exercise.notes}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
