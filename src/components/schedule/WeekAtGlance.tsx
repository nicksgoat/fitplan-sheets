
import React from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { format, addDays, startOfWeek, parseISO, isToday, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const WeekAtGlance = () => {
  const { activeSchedule, workoutsForDay } = useSchedule();
  
  if (!activeSchedule) return null;
  
  // Get current week days (Monday to Sunday)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return date;
  });
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-medium">This Week</h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date) => {
          const workouts = workoutsForDay(date);
          const hasWorkout = workouts.length > 0;
          const allCompleted = hasWorkout && workouts.every(w => w.completed);
          const pastDayWithMissedWorkout = isPast(date) && hasWorkout && !allCompleted && !isToday(date);
          
          return (
            <div key={format(date, 'yyyy-MM-dd')} className="flex flex-col items-center">
              <div className="text-xs text-gray-400">{format(date, 'EEE')}</div>
              <div 
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs",
                  isToday(date) ? "bg-fitbloom-purple text-white" : "text-gray-300"
                )}
              >
                {format(date, 'd')}
              </div>
              <div className="mt-1">
                {hasWorkout ? (
                  allCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : pastDayWithMissedWorkout ? (
                    <Circle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Badge 
                      variant="secondary" 
                      className="text-xs h-4 px-1 bg-gray-800"
                    >
                      {workouts.length}
                    </Badge>
                  )
                ) : (
                  <span className="block h-4"></span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekAtGlance;
