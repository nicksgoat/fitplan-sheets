
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Dumbbell, User } from 'lucide-react';
import { format } from 'date-fns';
import { useClubSharedContent } from '@/hooks/useClubSharedContent';

interface ClubSharedContentProps {
  clubId: string;
}

export default function ClubSharedContent({ clubId }: ClubSharedContentProps) {
  const navigate = useNavigate();
  const { sharedWorkouts, sharedPrograms, workoutsLoading, programsLoading } = useClubSharedContent(clubId);

  const handleViewWorkout = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  const handleViewProgram = (programId: string) => {
    navigate(`/program/${programId}`);
  };

  if (workoutsLoading || programsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!sharedWorkouts?.length && !sharedPrograms?.length) {
    return (
      <div className="text-center py-10">
        <Dumbbell className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No shared content yet</h3>
        <p className="text-muted-foreground mt-2">
          Club members will share workouts and programs here soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shared Workouts Section */}
      {sharedWorkouts && sharedWorkouts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Shared Workouts
          </h3>
          <div className="grid gap-4">
            {sharedWorkouts.map((item) => (
              <Card 
                key={item.id}
                className="p-4 hover:bg-card/60 cursor-pointer"
                onClick={() => handleViewWorkout(item.workout_id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      <h3 className="font-medium">{item.workouts?.name}</h3>
                      {item.workouts?.is_purchasable && (
                        <Badge variant="secondary" className="ml-2">
                          ${item.workouts.price || 0}
                        </Badge>
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
        </div>
      )}

      {/* Shared Programs Section */}
      {sharedPrograms && sharedPrograms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Shared Programs
          </h3>
          <div className="grid gap-4">
            {sharedPrograms.map((item) => (
              <Card 
                key={item.id}
                className="p-4 hover:bg-card/60 cursor-pointer"
                onClick={() => handleViewProgram(item.program_id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      <h3 className="font-medium">{item.programs?.name}</h3>
                      {item.programs?.is_purchasable && (
                        <Badge variant="secondary" className="ml-2">
                          ${item.programs.price || 0}
                        </Badge>
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
        </div>
      )}
    </div>
  );
}
