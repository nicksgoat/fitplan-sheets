
import React, { useState } from 'react';
import { ItemType } from '@/lib/types';
import { Workout } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, ChevronDown, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeaderboardTab from './LeaderboardTab';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WorkoutDetailProps {
  item: ItemType;
  workoutData?: Workout;
  onClose: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ item, workoutData, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [openExercises, setOpenExercises] = useState<number[]>([]);

  const toggleExercise = (exerciseId: number) => {
    setOpenExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId) 
        : [...prev, exerciseId]
    );
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-y-auto pb-safe">
      {/* Header Image */}
      <div className="relative w-full h-48 md:h-64">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 h-10 w-10"
          onClick={() => {}}
        >
          <Heart className={item.isFavorite ? "h-5 w-5 fill-fitbloom-purple text-fitbloom-purple" : "h-5 w-5 text-white"} />
        </Button>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div className="p-4 space-y-4 flex-1">
        {activeTab === "details" ? (
          <>
            {!workoutData && (
              <Alert variant="destructive" className="bg-amber-900/20 border-amber-800 mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Workout data not found</AlertTitle>
                <AlertDescription>
                  This workout may have been deleted or is not available in your library.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium uppercase text-fitbloom-text-medium">{item.type}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-fitbloom-text-medium" />
                  <span className="text-xs text-fitbloom-text-medium">{item.duration}</span>
                </div>
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
                {item.description || "This workout combines multiple exercises for a complete training session. Follow the exercise sequence for maximum efficiency."}
              </p>
            </div>

            {/* Exercises in this workout */}
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Exercises</h2>
              
              {workoutData && workoutData.exercises.length > 0 ? (
                <div className="space-y-3">
                  {workoutData.exercises.map((exercise, idx) => (
                    <Collapsible 
                      key={exercise.id} 
                      open={openExercises.includes(idx)}
                      onOpenChange={() => toggleExercise(idx)}
                      className="rounded-lg bg-gray-900 overflow-hidden"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-gray-800 flex items-center justify-center text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{exercise.name}</h3>
                            <p className="text-xs text-fitbloom-text-medium">
                              {exercise.sets.length} sets
                              {exercise.isCircuit && " • Circuit"}
                              {exercise.isGroup && " • Group"}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${openExercises.includes(idx) ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="px-3 pb-4">
                        {exercise.notes && (
                          <p className="text-xs italic text-gray-400 mb-3">{exercise.notes}</p>
                        )}
                        
                        {exercise.sets.length > 0 && !exercise.isCircuit && !exercise.isGroup && (
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-800">
                                <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Set</TableHead>
                                <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Reps</TableHead>
                                <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Weight</TableHead>
                                <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Rest</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {exercise.sets.map((set, setIdx) => (
                                <TableRow key={set.id} className="border-b border-gray-800">
                                  <TableCell className="py-2 px-2 text-xs font-medium text-amber-500">{setIdx + 1}</TableCell>
                                  <TableCell className="py-2 px-2 text-xs">{set.reps || '-'}</TableCell>
                                  <TableCell className="py-2 px-2 text-xs text-blue-400">
                                    {set.weight || '-'}
                                  </TableCell>
                                  <TableCell className="py-2 px-2 text-xs">{set.rest || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                        
                        {exercise.isCircuit && (
                          <p className="text-xs text-gray-300 mt-3">
                            This is a circuit exercise. See the workout sheet for full details.
                          </p>
                        )}
                        
                        {exercise.isGroup && (
                          <p className="text-xs text-gray-300 mt-3">
                            This is a group exercise. See the workout sheet for full details.
                          </p>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No exercises found in this workout.</p>
              )}
            </div>
          </>
        ) : (
          <LeaderboardTab itemTitle={item.title} itemType={item.type} />
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 w-full bg-black bg-opacity-80 backdrop-blur-sm p-4 border-t border-gray-800 flex gap-3">
        <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
          Close
        </Button>
        <Button className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90">
          Start Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutDetail;
