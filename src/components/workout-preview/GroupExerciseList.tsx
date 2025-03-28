
import React from 'react';
import { Exercise } from "@/types/workout";

interface GroupExerciseListProps {
  groupId: string;
  exercises: Exercise[];
}

const GroupExerciseList: React.FC<GroupExerciseListProps> = ({ groupId, exercises }) => {
  const groupExercises = exercises.filter(ex => ex.groupId === groupId);
  
  if (groupExercises.length === 0) return null;
  
  return (
    <div className="mt-2">
      {groupExercises.map((subExercise) => (
        <div
          key={subExercise.id}
          className="pl-3 py-2 border-t border-dark-300 flex items-center"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-white">{subExercise.name}</div>
            <div className="text-xs text-gray-400 truncate">
              {subExercise.sets.length} x {subExercise.sets[0]?.reps || '-'}
              {subExercise.sets[0]?.weight && ` @ ${subExercise.sets[0]?.weight}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupExerciseList;
