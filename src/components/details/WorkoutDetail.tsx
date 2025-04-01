
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ItemType } from '@/lib/types';
import { Download, Clock, CalendarDays, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePublicWorkoutLibrary } from '@/hooks/useWorkoutLibraryIntegration';
import { toast } from 'sonner';

interface WorkoutDetailProps {
  item: ItemType;
  onClose: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ item, onClose }) => {
  const navigate = useNavigate();
  const { workouts, saveWorkout } = usePublicWorkoutLibrary();
  
  const handleUseWorkout = () => {
    // Find the original workout
    const workout = workouts.find(w => w.id === item.id);
    
    if (workout) {
      // First, save the workout to user's personal library
      saveWorkout(workout);
      
      // Navigate to sheets page and load the workout
      navigate('/sheets');
      
      // Toast notification
      toast.success(`"${workout.name}" added to your workout program`);
      
      // Close the drawer
      onClose();
    }
  };
  
  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=2070"} 
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {item.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-black/50 text-white border-none text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{item.title}</h2>
          <p className="text-fitbloom-text-medium text-sm">Created by {item.creator || 'Anonymous'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-dark-300">
            <Clock className="h-5 w-5 text-fitbloom-purple" />
            <div>
              <p className="text-xs text-fitbloom-text-medium">Duration</p>
              <p className="font-medium">{item.duration || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-dark-300">
            <Dumbbell className="h-5 w-5 text-fitbloom-purple" />
            <div>
              <p className="text-xs text-fitbloom-text-medium">Difficulty</p>
              <p className="font-medium capitalize">{item.difficulty || 'Beginner'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-dark-300">
            <CalendarDays className="h-5 w-5 text-fitbloom-purple" />
            <div>
              <p className="text-xs text-fitbloom-text-medium">Added</p>
              <p className="font-medium">{item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Recently'}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-fitbloom-text-medium">
            {item.description || 'No description available.'}
          </p>
        </div>
        
        <Button 
          className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          onClick={handleUseWorkout}
        >
          <Download className="h-4 w-4 mr-2" />
          Use This Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutDetail;
