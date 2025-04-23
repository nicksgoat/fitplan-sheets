
import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Instagram, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface WorkoutCompleteScreenProps {
  open: boolean;
  onClose: () => void;
  duration: number;
  exerciseCount: number;
  completedSetsCount: number;
  onSave: (notes: string) => void;
  workoutName: string;
}

export default function WorkoutCompleteScreen({
  open,
  onClose,
  duration,
  exerciseCount,
  completedSetsCount,
  onSave,
  workoutName
}: WorkoutCompleteScreenProps) {
  const [notes, setNotes] = React.useState('');
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  const captureCard = async () => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing card:', error);
      return null;
    }
  };

  const handleInstagramShare = async () => {
    const imageData = await captureCard();
    if (!imageData) {
      toast.error("Could not create sharing image");
      return;
    }

    if (navigator.share) {
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], 'workout.png', { type: 'image/png' });

      try {
        await navigator.share({
          files: [file],
          title: `Completed ${workoutName}`,
          text: `Just completed ${workoutName} workout with ${exerciseCount} exercises in ${minutes}:${seconds.toString().padStart(2, '0')}!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to downloading the image
        const link = document.createElement('a');
        link.download = 'workout-complete.png';
        link.href = imageData;
        link.click();
        toast.success("Image downloaded - you can now share it to your stories!");
      }
    } else {
      // Direct download if sharing is not supported
      const link = document.createElement('a');
      link.download = 'workout-complete.png';
      link.href = imageData;
      link.click();
      toast.success("Image downloaded - you can now share it to your stories!");
    }
  };

  const handleMessageShare = async () => {
    const imageData = await captureCard();
    if (!imageData) {
      toast.error("Could not create sharing image");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my workout`,
          text: `I just completed ${workoutName} workout!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black text-white border border-gray-800">
        <div className="flex flex-col items-center gap-6 p-4">
          {/* Success Icon with Chrome Effect */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 flex items-center justify-center border border-gray-700 shadow-lg">
            <Check className="w-8 h-8 text-gray-300" />
          </div>
          
          {/* Workout Card Preview */}
          <Card ref={cardRef} className="w-full bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl">
            <div className="flex items-start gap-3">
              <img 
                src="/lovable-uploads/776879d2-1d7f-499e-a729-2d4fb447485d.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-300">{profile?.display_name || 'Athlete'}</span>
                  <span className="text-gray-500 text-sm">@{profile?.username || 'user'}</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                  {workoutName}
                </h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                  <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                  <span>{exerciseCount} exercises</span>
                  <span>{completedSetsCount} sets</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Share Buttons with Chrome Effect */}
          <div className="flex gap-3 w-full">
            <Button
              onClick={handleInstagramShare}
              variant="outline"
              className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <Instagram className="mr-2 h-4 w-4" />
              Share to Story
            </Button>
            <Button
              onClick={handleMessageShare}
              variant="outline"
              className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
          
          {/* Notes Input with Chrome Effect */}
          <div className="w-full space-y-2">
            <label className="text-sm text-gray-400">Add a caption (optional)</label>
            <Textarea
              placeholder="How was your workout?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 resize-none h-24 text-gray-300 placeholder:text-gray-600"
            />
          </div>
          
          {/* Done Button with Chrome Effect */}
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 hover:from-gray-300 hover:to-gray-200 text-gray-900 font-medium"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
