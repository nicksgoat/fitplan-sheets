
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Edit, Play } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LeaderboardTab from './LeaderboardTab';

interface ExerciseDetailProps {
  item: ItemType;
  onClose: () => void;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const navigate = useNavigate();

  const renderMedia = () => {
    if (item.videoUrl) {
      return (
        <div className="relative w-full h-48 md:h-64 bg-black flex items-center justify-center">
          <video 
            src={item.videoUrl} 
            className="w-full h-full max-h-full object-contain" 
            controls
            autoPlay={false}
            playsInline
            loop
          />
        </div>
      );
    } else {
      return (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-48 md:h-64 object-cover"
        />
      );
    }
  };

  const handleEdit = () => {
    onClose();
    if (item.id) {
      console.log("Navigating to edit exercise:", item.id);
      navigate(`/edit-exercise/${item.id}`);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-y-auto pb-safe">
      <div className="relative">
        {renderMedia()}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 h-10 w-10"
          onClick={() => {}}
        >
          <Heart className={item.isFavorite ? "h-5 w-5 fill-fitbloom-purple text-fitbloom-purple" : "h-5 w-5 text-white"} />
        </Button>
      </div>

      <div className="border-b border-gray-800">
        <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-transparent h-14 p-0 w-full flex justify-start">
            <TabsTrigger 
              value="details"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-fitbloom-purple rounded-none h-full"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-fitbloom-purple rounded-none h-full"
            >
              Leaderboard
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {activeTab === "details" ? (
          <>
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium uppercase text-fitbloom-text-medium">{item.type}</span>
                {item.duration && (
                  <span className="text-xs text-fitbloom-text-medium">{item.duration}</span>
                )}
              </div>
              <h1 className="text-xl font-bold mb-1">{item.title}</h1>
              <p className="text-sm text-fitbloom-text-medium">{item.creator}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {item.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              <Badge variant={item.difficulty === 'beginner' ? 'secondary' : item.difficulty === 'intermediate' ? 'default' : 'destructive'} 
                    className="text-xs px-2 py-0.5">
                {item.difficulty}
              </Badge>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-sm text-gray-300">
                {item.description || "This exercise helps you build strength and improve your form. Follow the instructions carefully for maximum benefit and to avoid injury."}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold mb-2">Instructions</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                <li>Start in the proper position with your back straight</li>
                <li>Engage your core muscles before beginning the movement</li>
                <li>Perform the movement slowly with controlled form</li>
                <li>Remember to breathe throughout the exercise</li>
                <li>Complete the recommended sets and repetitions</li>
              </ol>
            </div>
          </>
        ) : (
          <LeaderboardTab itemTitle={item.title} itemType={item.type} />
        )}
      </div>

      <div className="sticky bottom-0 w-full bg-black bg-opacity-80 backdrop-blur-sm p-4 border-t border-gray-800 flex gap-3">
        {item.isCustom && (
          <Button 
            variant="secondary" 
            size="lg" 
            className="flex-1"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        
        <Button 
          className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          size="lg" // Add size="lg" to match the edit button
        >
          <Play className="h-4 w-4 mr-2" />
          Start Exercise
        </Button>
      </div>
    </div>
  );
};

export default ExerciseDetail;
