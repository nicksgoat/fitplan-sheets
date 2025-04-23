
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, BookOpen, User } from 'lucide-react';
import { format } from 'date-fns';
import { useClubSharedContent } from '@/hooks/useClubSharedContent';

interface ClubSharedContentProps {
  clubId: string;
}

export default function ClubSharedContent({ clubId }: ClubSharedContentProps) {
  const [activeTab, setActiveTab] = useState('workouts');
  const navigate = useNavigate();
  const { sharedWorkouts, sharedPrograms, workoutsLoading, programsLoading } = useClubSharedContent(clubId);

  const handleViewWorkout = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  const handleViewProgram = (programId: string) => {
    navigate(`/program/${programId}`);
  };

  // Render workout cards
  const renderWorkouts = () => {
    if (workoutsLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }

    if (!sharedWorkouts || sharedWorkouts.length === 0) {
      return (
        <div className="text-center py-10">
          <Dumbbell className="mx-auto h-10 w-10 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium">No workouts shared yet</h3>
          <p className="text-gray-500 mt-2">
            Club members will share workouts here soon.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {sharedWorkouts.map((item) => (
          <Card 
            key={item.id} 
            className="p-4 hover:bg-card/60 cursor-pointer"
            onClick={() => handleViewWorkout(item.workout_id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                  <h3 className="font-medium">{item.workouts?.name}</h3>
                  {item.workouts?.is_purchasable && (
                    <Badge variant="secondary" className="ml-2">${item.workouts.price || 0}</Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  <span>
                    Shared by {item.profiles?.display_name || item.profiles?.username || 'Member'}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {format(new Date(item.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render program cards
  const renderPrograms = () => {
    if (programsLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }

    if (!sharedPrograms || sharedPrograms.length === 0) {
      return (
        <div className="text-center py-10">
          <BookOpen className="mx-auto h-10 w-10 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium">No programs shared yet</h3>
          <p className="text-gray-500 mt-2">
            Club members will share programs here soon.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {sharedPrograms.map((item) => (
          <Card 
            key={item.id} 
            className="p-4 hover:bg-card/60 cursor-pointer"
            onClick={() => handleViewProgram(item.program_id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  <h3 className="font-medium">{item.programs?.name}</h3>
                  {item.programs?.is_purchasable && (
                    <Badge variant="secondary" className="ml-2">${item.programs.price || 0}</Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  <span>
                    Shared by {item.profiles?.display_name || item.profiles?.username || 'Member'}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {format(new Date(item.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="workouts">
            <Dumbbell className="h-4 w-4 mr-2" />
            Workouts
          </TabsTrigger>
          <TabsTrigger value="programs">
            <BookOpen className="h-4 w-4 mr-2" />
            Programs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workouts" className="space-y-4">
          {renderWorkouts()}
        </TabsContent>
        
        <TabsContent value="programs" className="space-y-4">
          {renderPrograms()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
