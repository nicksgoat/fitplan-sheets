
import React from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { format, isSameDay, startOfWeek, addDays, isWithinInterval, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutProgram } from '@/types/workout';
import WeekAtGlance from './WeekAtGlance';
import { Progress } from '@/components/ui/progress';
import { PlayCircle } from 'lucide-react';

const ScheduleCard: React.FC = () => {
  const { activeSchedule } = useSchedule();
  const { programs } = useLibrary();
  
  // Find the program data for the active schedule
  const findProgramById = (programId: string): WorkoutProgram | undefined => {
    return programs.find(p => p.id === programId);
  };
  
  const program = activeSchedule ? findProgramById(activeSchedule.programId) : undefined;
  
  // Calculate program progress
  const calculateProgress = (): number => {
    if (!activeSchedule) return 0;
    
    const completedWorkouts = activeSchedule.scheduledWorkouts.filter(w => w.completed).length;
    const totalWorkouts = activeSchedule.scheduledWorkouts.length;
    
    if (totalWorkouts === 0) return 0;
    return Math.round((completedWorkouts / totalWorkouts) * 100);
  };
  
  const progress = calculateProgress();
  
  if (!activeSchedule || !program) {
    return (
      <Card className="bg-gray-900/30 border-gray-800">
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
          <CardDescription>You don't have any active programs scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center py-6">
            Start a program from the library to see your workout schedule here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gray-900/30 border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Schedule</CardTitle>
            <CardDescription>
              {program.name} - Started {format(parseISO(activeSchedule.startDate), 'PPP')}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 text-xs border-fitbloom-purple hover:bg-fitbloom-purple/20 text-fitbloom-purple"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Resume
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Program Progress</span>
            <span className="text-xs text-fitbloom-purple">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        
        <WeekAtGlance />
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
