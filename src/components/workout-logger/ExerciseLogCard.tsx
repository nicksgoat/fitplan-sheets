
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Exercise } from '@/types/workout';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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

  const handleSetComplete = (setIndex: number) => {
    if (!completedSets.includes(setIndex)) {
      setCompletedSets(prev => [...prev, setIndex]);
      setCurrentSetIndex(prev => prev + 1);
    }
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

        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="pb-2 w-1/12">Set</th>
                <th className="pb-2 w-3/12">Weight</th>
                <th className="pb-2 w-3/12">Reps</th>
                <th className="pb-2 w-1/12 text-center">Done</th>
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set, index) => (
                <tr 
                  key={set.id || index} 
                  className={cn(
                    "border-t border-dark-border", 
                    completedSets.includes(index) ? "opacity-50" : ""
                  )}
                >
                  <td className="py-2 pr-2 text-amber-400">{index + 1}</td>
                  <td className="py-2 px-2 text-white">{set.weight}</td>
                  <td className="py-2 px-2 text-white">{set.reps}</td>
                  <td className="py-2 px-2 text-center">
                    <button 
                      onClick={() => handleSetComplete(index)}
                      disabled={isDisabled || completedSets.includes(index)}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                        completedSets.includes(index) 
                          ? "bg-green-500 text-white" 
                          : "bg-dark-200 border border-gray-600 text-gray-400 hover:bg-dark-300",
                        isDisabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {completedSets.includes(index) ? (
                        <Check className="w-4 h-4" />
                      ) : null}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
