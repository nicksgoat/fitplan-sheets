
import React from 'react';
import { Exercise } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ExerciseListProps {
  exercises: Exercise[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Exercises</h3>
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div key={exercise.id} className="p-3 border border-gray-700 rounded-md">
            <div className="flex justify-between">
              <span className="font-medium">{index + 1}. {exercise.name}</span>
              <span className="text-gray-400">{exercise.sets?.length || 0} sets</span>
            </div>
            {exercise.notes && (
              <p className="text-sm text-gray-400 mt-1">{exercise.notes}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <Button 
          className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          onClick={() => navigate('/sheets')}
        >
          Start Workout
        </Button>
      </div>
    </div>
  );
};

export default ExerciseList;
