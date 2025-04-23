
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Exercise } from '@/types/workout';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { formatTime } from '@/utils/timeUtils';

interface ExerciseLogCardProps {
  exercise: Exercise;
  isDisabled: boolean;
  isInCircuit?: boolean;
  circuitName?: string;
  onSetComplete?: (exerciseId: string, setIndex: number, completed: boolean) => void;
}

export default function ExerciseLogCard({ 
  exercise, 
  isDisabled,
  isInCircuit,
  circuitName,
  onSetComplete
}: ExerciseLogCardProps) {
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number | null>(null);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isRestTimerActive && restTimeRemaining !== null && restTimeRemaining > 0) {
      timer = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            setIsRestTimerActive(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restTimeRemaining === 0) {
      setIsRestTimerActive(false);
      setRestTimeRemaining(null);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRestTimerActive, restTimeRemaining]);

  const handleSetComplete = (setIndex: number) => {
    if (!completedSets.includes(setIndex)) {
      const newCompletedSets = [...completedSets, setIndex];
      setCompletedSets(newCompletedSets);
      setCurrentSetIndex(prev => prev + 1);
      
      // Call the parent callback if provided
      if (onSetComplete) {
        onSetComplete(exercise.id, setIndex, true);
      }
      
      // Start rest timer when set is completed
      const currentSet = exercise.sets[setIndex];
      if (currentSet && currentSet.rest) {
        const restSeconds = parseInt(currentSet.rest);
        if (!isNaN(restSeconds)) {
          setRestTimeRemaining(restSeconds);
          setIsRestTimerActive(true);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mb-3 overflow-hidden",
        exercise.isGroup && "bg-dark-200 rounded-lg",
        exercise.isCircuit && "bg-dark-200 rounded-lg",
        !exercise.isGroup && !exercise.isCircuit && "bg-dark-300 border border-dark-border rounded-lg"
      )}
    >
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium text-white truncate",
              exercise.isCircuit && "text-blue-400",
              exercise.name === "Superset" && "text-indigo-400",
              exercise.name.includes("EMOM") && "text-green-400",
              exercise.name.includes("AMRAP") && "text-amber-400"
            )}>
              {exercise.name}
            </h3>
            {exercise.notes && (
              <p className="text-sm text-gray-400 mt-1 italic line-clamp-2">{exercise.notes}</p>
            )}
          </div>
          
          {isRestTimerActive && restTimeRemaining !== null && (
            <div className="text-sm font-mono bg-dark-200 px-2.5 py-1 rounded-full ml-2 whitespace-nowrap">
              Rest: {formatTime(restTimeRemaining)}
            </div>
          )}
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="pb-2 w-12 pl-1">Set</th>
                <th className="pb-2 w-20 px-2">Weight</th>
                <th className="pb-2 w-16 px-2">Reps</th>
                <th className="pb-2 w-12 text-center pr-1">Done</th>
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
                  <td className="py-2 pl-1 text-amber-400">{index + 1}</td>
                  <td className="py-2 px-2 text-white">{set.weight}</td>
                  <td className="py-2 px-2 text-white">{set.reps}</td>
                  <td className="py-2 pr-1 text-center">
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
