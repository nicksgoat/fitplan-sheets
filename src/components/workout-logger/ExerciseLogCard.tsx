
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Exercise } from '@/types/workout';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import SetLogger from './SetLogger';

interface ExerciseLogCardProps {
  exercise: Exercise;
  isDisabled: boolean;
  isInCircuit?: boolean;
  circuitName?: string;
}

export default function ExerciseLogCard({ 
  exercise, 
  isDisabled,
  isInCircuit,
  circuitName
}: ExerciseLogCardProps) {
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const handleSetComplete = (setIndex: number, data: { weight: string; reps: string }) => {
    setCompletedSets(prev => [...prev, setIndex]);
    setCurrentSetIndex(prev => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mb-4 overflow-hidden",
        exercise.isGroup && "bg-dark-200 rounded-lg",
        exercise.isCircuit && "bg-dark-200 rounded-lg",
        !exercise.isGroup && !exercise.isCircuit && "bg-dark-300 border border-dark-border rounded-lg"
      )}
    >
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className={cn(
              "font-medium text-white",
              exercise.isCircuit && "text-blue-400",
              exercise.name === "Superset" && "text-indigo-400",
              exercise.name.includes("EMOM") && "text-green-400",
              exercise.name.includes("AMRAP") && "text-amber-400"
            )}>
              {exercise.name}
            </h3>
            {exercise.notes && (
              <p className="text-sm text-gray-400 mt-1 italic">{exercise.notes}</p>
            )}
          </div>
        </div>

        {!exercise.isCircuit && !exercise.isGroup && currentSetIndex < exercise.sets.length && (
          <SetLogger
            setNumber={currentSetIndex + 1}
            restTime={exercise.sets[currentSetIndex].rest}
            isDisabled={isDisabled}
            defaultWeight={exercise.sets[currentSetIndex].weight}
            defaultReps={exercise.sets[currentSetIndex].reps}
            onComplete={(data) => handleSetComplete(currentSetIndex, data)}
          />
        )}

        {completedSets.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm text-gray-400 mb-2">Completed Sets</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400">
                  <th className="pb-2">Set</th>
                  <th className="pb-2">Weight</th>
                  <th className="pb-2">Reps</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, index) => (
                  completedSets.includes(index) && (
                    <tr key={set.id || index} className="border-t border-dark-border">
                      <td className="py-2 pr-2 text-amber-400">{index + 1}</td>
                      <td className="py-2 px-2 text-white">{set.weight}</td>
                      <td className="py-2 px-2 text-white">{set.reps}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
