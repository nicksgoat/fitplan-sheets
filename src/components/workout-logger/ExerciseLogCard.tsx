
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Exercise } from '@/types/workout';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

        {!exercise.isCircuit && !exercise.isGroup && (
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400">
                  <th className="pb-2">Set</th>
                  <th className="pb-2">Weight</th>
                  <th className="pb-2">Reps</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, index) => (
                  <tr key={set.id || index} className="border-t border-dark-border">
                    <td className="py-2 pr-2 text-amber-400">{index + 1}</td>
                    <td className="py-2 px-2">
                      <Input
                        type="text"
                        defaultValue={set.weight}
                        className="w-20 h-8 text-center bg-dark-200 border-dark-300"
                        placeholder="lbs"
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="text"
                        defaultValue={set.reps}
                        className="w-16 h-8 text-center bg-dark-200 border-dark-300"
                        placeholder="reps"
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="py-2 pl-2">
                      <Input
                        type="text"
                        placeholder="Notes"
                        className="w-full h-8 bg-dark-200 border-dark-300"
                        disabled={isDisabled}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {exercise.sets.some(set => set.rest) && (
              <div className="mt-3 text-xs text-gray-400">
                <div className="grid grid-cols-2 gap-2">
                  {exercise.sets.map((set, idx) => (
                    set.rest ? (
                      <div key={idx} className="flex items-center gap-1 text-blue-400">
                        <Clock className="w-3 h-3" />
                        <span>Set {idx + 1}: {set.rest}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
