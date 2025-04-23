
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import EnhancedShareButton from '@/components/share/EnhancedShareButton';

interface WorkoutCompleteScreenProps {
  open: boolean;
  onClose: () => void;
  duration: number;
  exerciseCount: number;
  completedSetsCount: number;
  onSave: (notes: string) => void;
}

export default function WorkoutCompleteScreen({
  open,
  onClose,
  duration,
  exerciseCount,
  completedSetsCount,
  onSave
}: WorkoutCompleteScreenProps) {
  const [notes, setNotes] = React.useState('');
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] text-white border-none">
        <div className="flex flex-col items-center gap-6 p-4">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-fitbloom-purple/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-fitbloom-purple" />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-center">Workout Complete!</h2>
          
          {/* Stats */}
          <div className="w-full bg-black/20 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Duration</span>
              <span>{minutes} min {seconds} sec</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Exercises</span>
              <span>{exerciseCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sets Completed</span>
              <span>{completedSetsCount}</span>
            </div>
          </div>
          
          {/* Notes Input */}
          <div className="w-full space-y-2">
            <label className="text-sm text-gray-400">Add a caption (optional)</label>
            <Textarea
              placeholder="How was your workout?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-black/20 border-gray-700 resize-none h-24"
            />
          </div>
          
          {/* Share Button */}
          <EnhancedShareButton
            url={window.location.href}
            title="Check out my workout!"
            description={`Completed ${exerciseCount} exercises in ${minutes}:${seconds.toString().padStart(2, '0')}`}
            variant="outline"
            className="w-full bg-black/20 hover:bg-black/30 border-gray-700"
          />
          
          {/* Done Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
