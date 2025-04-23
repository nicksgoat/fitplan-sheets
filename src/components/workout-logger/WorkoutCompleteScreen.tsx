
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Instagram, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  const handleInstagramShare = () => {
    // Instagram story sharing logic
    if (navigator.share) {
      navigator.share({
        url: window.location.href,
        title: `Completed ${workoutName}`,
        text: `Just completed ${workoutName} workout with ${exerciseCount} exercises in ${minutes}:${seconds.toString().padStart(2, '0')}!`
      });
    }
  };

  const handleMessageShare = () => {
    // Message sharing logic
    if (navigator.share) {
      navigator.share({
        url: window.location.href,
        title: `Check out my workout`,
        text: `I just completed ${workoutName} workout!`
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] text-white border-none">
        <div className="flex flex-col items-center gap-6 p-4">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-fitbloom-purple/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-fitbloom-purple" />
          </div>
          
          {/* Workout Card Preview */}
          <Card className="w-full bg-dark-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-fitbloom-purple/20 text-fitbloom-purple">
                  {profile?.display_name?.[0] || user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{profile?.display_name || 'Athlete'}</span>
                  <span className="text-gray-400 text-sm">@{profile?.username || 'user'}</span>
                </div>
                <h3 className="text-lg font-bold mt-1">{workoutName}</h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                  <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                  <span>{exerciseCount} exercises</span>
                  <span>{completedSetsCount} sets</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Share Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              onClick={handleInstagramShare}
              variant="outline"
              className="flex-1 bg-dark-200 border-gray-700 hover:bg-dark-300"
            >
              <Instagram className="mr-2 h-4 w-4" />
              Share to Story
            </Button>
            <Button
              onClick={handleMessageShare}
              variant="outline"
              className="flex-1 bg-dark-200 border-gray-700 hover:bg-dark-300"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
          
          {/* Notes Input */}
          <div className="w-full space-y-2">
            <label className="text-sm text-gray-400">Add a caption (optional)</label>
            <Textarea
              placeholder="How was your workout?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-dark-200 border-gray-700 resize-none h-24"
            />
          </div>
          
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
