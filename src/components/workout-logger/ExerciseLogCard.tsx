
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Exercise } from '@/types/workout';

interface ExerciseLogCardProps {
  exercise: Exercise;
  isDisabled: boolean;
}

export default function ExerciseLogCard({ exercise, isDisabled }: ExerciseLogCardProps) {
  const renderSetRow = (set: any, index: number) => (
    <tr key={set.id || index} className="border-b border-gray-800/50 last:border-0">
      <td className="py-3 pr-2 text-sm text-gray-400">{index + 1}</td>
      <td className="py-3 px-2">
        <Input
          type="text"
          defaultValue={set.weight}
          className="w-20 h-8 text-center"
          placeholder="lbs"
          disabled={isDisabled}
        />
      </td>
      <td className="py-3 px-2">
        <Input
          type="text"
          defaultValue={set.reps}
          className="w-16 h-8 text-center"
          placeholder="reps"
          disabled={isDisabled}
        />
      </td>
      <td className="py-3 pl-2">
        <Input
          type="text"
          placeholder="Notes"
          className="w-full h-8"
          disabled={isDisabled}
        />
      </td>
    </tr>
  );

  return (
    <Card className="mb-4 bg-dark-300 border-dark-border overflow-hidden">
      <CardHeader className="px-4 py-3">
        <h3 className="font-medium">{exercise.name}</h3>
        {exercise.notes && (
          <p className="text-sm text-gray-400">{exercise.notes}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-200">
              <tr className="text-left text-xs text-gray-400">
                <th className="py-2 pl-4 pr-2">Set</th>
                <th className="py-2 px-2">Weight</th>
                <th className="py-2 px-2">Reps</th>
                <th className="py-2 pl-2 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set, index) => 
                renderSetRow(set, index)
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
