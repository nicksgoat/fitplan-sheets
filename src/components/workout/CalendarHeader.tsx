
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarHeaderProps {
  currentWeek: number;
  totalWeeks: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onAddWeek: () => void;
}

const CalendarHeader = ({
  currentWeek,
  totalWeeks,
  onPrevWeek,
  onNextWeek,
  onAddWeek
}: CalendarHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-fitbloom-purple" />
        <h2 className="text-lg font-semibold">Program Calendar</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onPrevWeek}
            className="text-gray-400 hover:text-white"
            disabled={currentWeek === 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <span className="text-sm">
            Week {currentWeek}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onNextWeek}
            className="text-gray-400 hover:text-white"
            disabled={currentWeek === totalWeeks}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onAddWeek}
          className="text-xs flex items-center gap-1 border-gray-700 hover:bg-gray-700"
        >
          <Plus className="h-3 w-3" />
          New Week
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
