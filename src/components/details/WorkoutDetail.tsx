
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ItemType } from '@/lib/types';
import { Download, Clock } from 'lucide-react';
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
    <div className="p-4">
      <div className="aspect-video mb-4 rounded-lg overflow-hidden">
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=2070"} 
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">{item.title}</h2>
          <p className="text-gray-400 text-sm">Created by {item.creator || 'Anonymous'}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {item.tags?.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
          
          <Badge variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.duration || 'N/A'}
          </Badge>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-gray-300">
            {item.description || 'No description available.'}
          </p>
        </div>
        
        <Button 
          className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 mt-4"
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
