
import React, { useState } from 'react';
import { ItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeaderboardTab from './LeaderboardTab';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WorkoutDetailProps {
  item: ItemType;
  onClose: () => void;
}

interface ExerciseSet {
  number: number;
  target: string;
  weight: number;
  reps: number;
  restTime?: number;
}

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  instructions?: string;
  setDetails: ExerciseSet[];
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [openExercises, setOpenExercises] = useState<number[]>([]);

  // Sample exercise data - in a real app this would come from your backend
  const exercises: Exercise[] = [
    {
      id: 1,
      name: "Back Squat",
      sets: 3,
      reps: 12,
      instructions: "Keep your heels down and drive your knees out over your toes",
      setDetails: [
        { number: 1, target: "—", weight: 95, reps: 12, restTime: 60 },
        { number: 2, target: "—", weight: 115, reps: 12, restTime: 60 },
        { number: 3, target: "—", weight: 115, reps: 12, restTime: 60 },
      ]
    },
    {
      id: 2,
      name: "Push-ups",
      sets: 3,
      reps: 15,
      instructions: "Keep your core tight and elbows close to your body",
      setDetails: [
        { number: 1, target: "—", weight: 0, reps: 15, restTime: 45 },
        { number: 2, target: "—", weight: 0, reps: 15, restTime: 45 },
        { number: 3, target: "—", weight: 0, reps: 15, restTime: 45 },
      ]
    },
    {
      id: 3,
      name: "Planks",
      sets: 3,
      reps: 30,
      instructions: "Keep your body in a straight line from head to heels",
      setDetails: [
        { number: 1, target: "—", weight: 0, reps: 30, restTime: 30 },
        { number: 2, target: "—", weight: 0, reps: 30, restTime: 30 },
        { number: 3, target: "—", weight: 0, reps: 30, restTime: 30 },
      ]
    },
    {
      id: 4,
      name: "Lunges",
      sets: 3,
      reps: 12,
      instructions: "Step forward and lower your back knee toward the ground",
      setDetails: [
        { number: 1, target: "—", weight: 0, reps: 12, restTime: 45 },
        { number: 2, target: "—", weight: 0, reps: 12, restTime: 45 },
        { number: 3, target: "—", weight: 0, reps: 12, restTime: 45 },
      ]
    }
  ];

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
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <Collapsible 
                    key={exercise.id} 
                    open={openExercises.includes(exercise.id)}
                    onOpenChange={() => toggleExercise(exercise.id)}
                    className="rounded-lg bg-gray-900 overflow-hidden"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-gray-800 flex items-center justify-center text-xs">
                          {exercise.id}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">{exercise.name}</h3>
                          <p className="text-xs text-fitbloom-text-medium">{exercise.sets} sets, {exercise.reps} reps</p>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${openExercises.includes(exercise.id) ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="px-3 pb-4">
                      {exercise.instructions && (
                        <p className="text-xs italic text-gray-400 mb-3">{exercise.instructions}</p>
                      )}
                      
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-800">
                            <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Set</TableHead>
                            <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Target</TableHead>
                            <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Weight</TableHead>
                            <TableHead className="py-2 px-2 text-xs font-medium text-gray-400">Reps</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.setDetails.map((set) => (
                            <TableRow key={set.number} className="border-b border-gray-800">
                              <TableCell className="py-2 px-2 text-xs font-medium text-amber-500">{set.number}</TableCell>
                              <TableCell className="py-2 px-2 text-xs">{set.target}</TableCell>
                              <TableCell className="py-2 px-2 text-xs text-blue-400">
                                {set.weight > 0 ? set.weight : '—'}
                              </TableCell>
                              <TableCell className="py-2 px-2 text-xs">{set.reps}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {/* Rest Times */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {exercise.setDetails.map((set) => set.restTime && (
                          <div key={`rest-${set.number}`} className="flex items-center text-xs text-blue-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Set {set.number}: {set.restTime}s</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
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
