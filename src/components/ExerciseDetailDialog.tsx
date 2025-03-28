
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/utils/exerciseLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Plus, Share } from "lucide-react";

interface ExerciseDetailDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLiked: boolean;
  onLikeToggle: () => void;
}

const ExerciseDetailDialog: React.FC<ExerciseDetailDialogProps> = ({
  exercise,
  open,
  onOpenChange,
  isLiked,
  onLikeToggle,
}) => {
  if (!exercise) return null;

  // Generate a background gradient based on the exercise category
  const getBgGradient = (category: string) => {
    switch (category) {
      case "barbell":
        return "bg-gradient-to-br from-purple-900 to-blue-900";
      case "dumbbell":
        return "bg-gradient-to-br from-blue-900 to-teal-900";
      case "machine":
        return "bg-gradient-to-br from-teal-900 to-green-900";
      case "bodyweight":
        return "bg-gradient-to-br from-orange-900 to-red-900";
      case "kettlebell":
        return "bg-gradient-to-br from-red-900 to-pink-900";
      case "cable":
        return "bg-gradient-to-br from-indigo-900 to-purple-900";
      case "cardio":
        return "bg-gradient-to-br from-green-900 to-yellow-900";
      default:
        return "bg-gradient-to-br from-gray-800 to-gray-900";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className={`-mx-6 -mt-6 h-48 flex items-center justify-center ${getBgGradient(exercise.category)}`}>
          <span className="text-2xl font-bold text-white">{exercise.name}</span>
        </div>
        
        <DialogHeader className="mt-4">
          <DialogTitle className="text-xl">{exercise.name}</DialogTitle>
          <DialogDescription>
            Primary muscle: {exercise.primaryMuscle.charAt(0).toUpperCase() + exercise.primaryMuscle.slice(1)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Muscles Worked</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-dark-300">
                  {exercise.primaryMuscle.charAt(0).toUpperCase() + exercise.primaryMuscle.slice(1)}
                </Badge>
                
                {exercise.secondaryMuscles && exercise.secondaryMuscles.map((muscle) => (
                  <Badge key={muscle} variant="outline" className="bg-dark-300">
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Category</h3>
              <Badge variant="outline" className="bg-dark-300">
                {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
              </Badge>
            </div>
            
            {exercise.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-400">{exercise.description}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="instructions">
            {exercise.instructions ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">How to perform</h3>
                <p className="text-gray-400">{exercise.instructions}</p>
              </div>
            ) : (
              <div className="text-gray-400 py-8 text-center">
                No detailed instructions available for this exercise.
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={onLikeToggle} className={isLiked ? "bg-purple-500 hover:bg-purple-600 text-white" : ""}>
            <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-white" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add to Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailDialog;
