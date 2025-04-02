
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Dumbbell } from 'lucide-react';
import { WorkoutProgram } from '@/types/workout';
import { formatDistanceToNow } from 'date-fns';

interface ProgramCardProps {
  program: WorkoutProgram;
  onSelect?: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSelect }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

  const weekCount = program.weeks?.length || 0;
  const workoutCount = program.workouts?.length || 0;

  return (
    <Card 
      className="bg-dark-200 border-dark-300 hover:border-fitbloom-purple/50 transition-all cursor-pointer overflow-hidden"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{program.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-fitbloom-purple" />
            <span>{weekCount} {weekCount === 1 ? 'week' : 'weeks'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-fitbloom-purple" />
            <span>{workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Updated {formatDate(program.lastModified)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProgramCard;
