
import React from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/utils/exerciseLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 bg-black max-h-[90vh] overflow-y-auto">
        <div className="bg-black w-full">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-transparent">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent">
                Details
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent">
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-0 m-0">
              <div className="p-6">
                <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">
                  EXERCISE
                </div>
                <h1 className="text-2xl font-bold mb-1">{exercise.name}</h1>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-black text-white border border-gray-700">
                    {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                  </Badge>
                  <Badge className="bg-black text-white border border-gray-700">
                    {exercise.primaryMuscle.charAt(0).toUpperCase() + exercise.primaryMuscle.slice(1)}
                  </Badge>
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.map((muscle) => (
                    <Badge key={muscle} className="bg-black text-white border border-gray-700">
                      {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                    </Badge>
                  ))}
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-3">Description</h2>
                  <p className="text-gray-400">
                    {exercise.description || "No description available for this exercise."}
                  </p>
                </div>
                
                {exercise.instructions && (
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Instructions</h2>
                    <p className="text-gray-400">{exercise.instructions}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="p-6">
              <div className="text-gray-400 py-8 text-center">
                Exercise history will be displayed here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex px-6 py-4 border-t border-gray-800 justify-between">
          <DialogClose asChild>
            <Button variant="outline" className="bg-transparent border-gray-700 text-white">
              Close
            </Button>
          </DialogClose>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            Add to Workout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailDialog;
