
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Exercise } from '@/types/workout';
import { Badge } from '@/components/ui/badge';

interface ExerciseLogCardProps {
  exercise: Exercise;
  isDisabled: boolean;
  isInCircuit?: boolean;
  circuitName?: string;
}

export default function ExerciseLogCard({ 
  exercise, 
  isDisabled, 
  isInCircuit = false,
  circuitName
}: ExerciseLogCardProps) {
  const renderSetRow = (set: any, index: number) => (
    <tr key={set.id || index} className="border-b border-gray-800/50 last:border-0">
      <td className="py-2 pr-2 text-sm text-gray-400">{index + 1}</td>
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
  );

  if (isInCircuit) {
    return (
      <div className="bg-dark-200 p-3 rounded-lg mb-3">
        <div className="flex justify-between mb-2">
          <h3 className="font-medium text-white">{exercise.name}</h3>
          <div className="text-xs text-gray-400">
            {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
          </div>
        </div>
        {exercise.notes && (
          <p className="text-sm text-gray-400 mb-3">{exercise.notes}</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="py-2 pr-2">Set</th>
                <th className="py-2 px-2">Weight</th>
                <th className="py-2 px-2">Reps</th>
                <th className="py-2 pl-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set, index) => renderSetRow(set, index))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-4 overflow-hidden border-dark-border bg-dark-100">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between bg-dark-200">
        <div>
          <h3 className="font-medium text-white">{exercise.name}</h3>
          {exercise.notes && (
            <p className="text-sm text-gray-400">{exercise.notes}</p>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
        </div>
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
              {exercise.sets.map((set, index) => renderSetRow(set, index))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
