
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { WorkoutProgram } from '@/types/workout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface StartProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: WorkoutProgram;
}

const StartProgramDialog: React.FC<StartProgramDialogProps> = ({
  open,
  onOpenChange,
  program,
}) => {
  const { startProgram } = useSchedule();
  const [startDate, setStartDate] = useState<Date>(new Date());

  const handleStartProgram = () => {
    try {
      startProgram(program, startDate);
      toast.success(`Program "${program.name}" scheduled starting ${format(startDate, 'PPP')}`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to schedule program');
      console.error('Error scheduling program:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Program</DialogTitle>
          <DialogDescription>
            Schedule "{program.name}" by selecting your start date below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center my-6 space-y-4">
          <div className="border rounded-md p-1 w-full">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-fitbloom-purple" />
            <span>Starting: {format(startDate, 'EEEE, MMMM do, yyyy')}</span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={handleStartProgram}
          >
            Schedule Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartProgramDialog;
