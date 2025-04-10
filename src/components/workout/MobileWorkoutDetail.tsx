
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ChevronLeft, PlayCircle, Share2 } from 'lucide-react';
import { ItemType } from '@/lib/types';
import { Workout } from '@/types/workout';
import LikeButton from '@/components/ui/LikeButton';
import { useLikeItem } from '@/hooks/useLikeItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

interface MobileWorkoutDetailProps {
  item: ItemType;
  workoutData: Workout;
  onClose: () => void;
}

const MobileWorkoutDetail: React.FC<MobileWorkoutDetailProps> = ({ item, workoutData, onClose }) => {
  const navigate = useNavigate();
  const { liked, toggleLikeItem } = useLikeItem(item);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const handleStartWorkout = () => {
    // Logic to start the workout
    navigate(`/workout/${item.id}`);
    onClose();
  };
  
  // Truncate description for preview
  const description = item.description || '';
  const shouldTruncate = description.length > 100;
  const truncatedDescription = shouldTruncate 
    ? description.substring(0, 100) + '...' 
    : description;

  return (
    <Dialog>
      <div className="flex flex-col h-full bg-dark-200 text-white rounded-t-xl">
        {/* Header with image */}
        <div className="relative h-60">
          <img 
            src={item.imageUrl || "https://placehold.co/600x400?text=Workout"} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/40 rounded-full">
              <ChevronLeft className="h-5 w-5 text-white" />
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="bg-black/40 rounded-full">
                <Share2 className="h-5 w-5 text-white" />
              </Button>
              <div className="bg-black/40 rounded-full">
                <LikeButton item={item} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <ScrollArea className="flex-1 px-4 pb-20">
          <div className="py-4">
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm text-gray-400">{item.creator}</div>
              <div className="flex gap-1 text-xs">
                {item.tags?.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-dark-300 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-sm text-gray-300">
                {showFullDescription ? description : truncatedDescription}
                {shouldTruncate && (
                  <Button 
                    variant="link" 
                    className="text-fitbloom-purple p-0 h-auto font-normal text-sm"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </Button>
                )}
              </p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Exercises</h2>
              <div className="space-y-3">
                {workoutData.exercises.map((exercise, index) => (
                  <div key={index} className="bg-dark-300 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <div className="text-xs text-gray-400">
                        {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                      </div>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-400 mt-1">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {/* Bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark-200 border-t border-gray-800">
          <Button 
            className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 gap-2"
            onClick={handleStartWorkout}
          >
            <PlayCircle className="h-5 w-5" />
            Start Workout
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default MobileWorkoutDetail;
