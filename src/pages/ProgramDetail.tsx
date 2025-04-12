
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutProgram } from '@/types/workout';
import { parseProductUrl } from '@/utils/urlUtils';
import { useAuth } from '@/hooks/useAuth';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Button } from '@/components/ui/button';
import { useHasUserPurchasedProgram } from '@/hooks/useWorkoutData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ShareButton from '@/components/share/ShareButton';
import MetaTags from '@/components/meta/MetaTags';
import { formatCurrency } from '@/utils/workout';

const ProgramDetail = () => {
  const { programId } = useParams<{ programId: string }>();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initiateCheckout, loading: checkoutLoading } = useStripeCheckout();
  
  // Extract the actual ID from the URL parameter (removes the slug part)
  const id = programId ? parseProductUrl(`/program/${programId}`) : null;
  
  const { data: hasPurchased, isLoading: isPurchaseLoading } = 
    useHasUserPurchasedProgram(user?.id || '', id || '');
  
  useEffect(() => {
    if (!id) {
      setError('Invalid program ID');
      setLoading(false);
      return;
    }
    
    const fetchProgram = async () => {
      try {
        // Fetch the program details
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (programError) throw programError;
        
        // Fetch the weeks for this program
        const { data: weeksData, error: weeksError } = await supabase
          .from('weeks')
          .select('*')
          .eq('program_id', id)
          .order('order_num', { ascending: true });
        
        if (weeksError) throw weeksError;
        
        // Fetch the workouts for this program
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .in('week_id', weeksData.map(week => week.id))
          .order('day_num', { ascending: true });
        
        if (workoutsError) throw workoutsError;
        
        // Map weeks to include their workouts
        const mappedWeeks = weeksData.map(week => {
          const weekWorkouts = workoutsData
            .filter(workout => workout.week_id === week.id)
            .map(workout => workout.id);
          
          return {
            id: week.id,
            name: week.name,
            order: week.order_num,
            workouts: weekWorkouts,
            savedAt: week.created_at,
            lastModified: week.updated_at
          };
        });
        
        // Map workouts for program
        const mappedWorkouts = workoutsData.map(workout => ({
          id: workout.id,
          name: workout.name,
          day: workout.day_num,
          exercises: [],
          weekId: workout.week_id,
          savedAt: workout.created_at,
          lastModified: workout.updated_at
        }));
        
        // Create the complete program
        const mappedProgram: WorkoutProgram = {
          id: programData.id,
          name: programData.name,
          weeks: mappedWeeks,
          workouts: mappedWorkouts,
          savedAt: programData.created_at,
          lastModified: programData.updated_at,
          isPublic: programData.is_public,
          isPurchasable: programData.is_purchasable,
          price: programData.price,
          userId: programData.user_id
        };
        
        setProgram(mappedProgram);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching program:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProgram();
  }, [id]);
  
  const handlePurchase = () => {
    if (!program || !program.price) return;
    
    initiateCheckout({
      itemType: 'program',
      itemId: program.id,
      itemName: program.name,
      price: parseFloat(program.price.toString()),
      creatorId: program.userId || ''
    });
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <MetaTags 
          title="Loading Program..." 
          description="Loading program details"
          type="product"
        />
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <Skeleton className="h-8 w-2/3 bg-dark-300" />
            <Skeleton className="h-4 w-1/2 mt-2 bg-dark-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 bg-dark-300" />
                ))}
              </div>
              <Skeleton className="h-40 w-full bg-dark-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !program) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <MetaTags 
          title="Program Not Found" 
          description="The program you're looking for doesn't exist or has been removed."
          type="website"
        />
        <Card className="bg-dark-200 border-dark-300 text-center py-8">
          <CardContent>
            <h2 className="text-2xl font-semibold">Program Not Found</h2>
            <p className="text-gray-400 mt-2">
              {error || "The program you're looking for doesn't exist or has been removed."}
            </p>
            <Button 
              className="mt-6 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              onClick={() => navigate('/explore')}
            >
              Browse Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const weekCount = program.weeks?.length || 0;
  const workoutCount = program.workouts?.length || 0;
  
  const canPurchase = program.isPurchasable && program.price && program.price > 0 && (!hasPurchased) && user;
  const hasAccessToProgram = !program.isPurchasable || (program.isPurchasable && hasPurchased);
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <MetaTags 
        title={`${program.name} - FitBloom Training Program`}
        description={`Training program with ${weekCount} ${weekCount === 1 ? 'week' : 'weeks'} and ${workoutCount} ${workoutCount === 1 ? 'workout' : 'workouts'}`}
        type="product"
        url={`/program/${program.id}-${program.name.toLowerCase().replace(/\s+/g, '-')}`}
      />
      
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <ShareButton 
          url={`/program/${program.id}-${program.name.toLowerCase().replace(/\s+/g, '-')}`}
          title={`Check out ${program.name} training program on FitBloom`}
          description={`Training program with ${weekCount} ${weekCount === 1 ? 'week' : 'weeks'} and ${workoutCount} ${workoutCount === 1 ? 'workout' : 'workouts'}`}
        />
      </div>
      
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{program.name}</CardTitle>
              <CardDescription className="mt-2">
                Training program with {weekCount} {weekCount === 1 ? 'week' : 'weeks'} and {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
              </CardDescription>
            </div>
            
            {program.isPurchasable && program.price && program.price > 0 && (
              <div className="text-xl font-semibold text-green-500">
                {formatCurrency(program.price)}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Calendar className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>{weekCount} {weekCount === 1 ? 'Week' : 'Weeks'}</span>
              </div>
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Dumbbell className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>{workoutCount} {workoutCount === 1 ? 'Workout' : 'Workouts'}</span>
              </div>
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Clock className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>Updated {new Date(program.lastModified || program.savedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Tag className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>{program.isPublic ? 'Public' : 'Private'}</span>
              </div>
            </div>
            
            {hasAccessToProgram ? (
              <div>
                <h3 className="text-lg font-medium mb-3">Program Structure</h3>
                <div className="space-y-4">
                  {program.weeks?.map((week, weekIndex) => (
                    <div key={week.id} className="border border-gray-700 rounded-md overflow-hidden">
                      <div className="bg-dark-300 p-2 px-4">
                        <h4 className="font-medium">Week {weekIndex + 1}: {week.name}</h4>
                      </div>
                      <div className="divide-y divide-gray-700">
                        {week.workouts.map((workoutId) => {
                          const workout = program.workouts.find(w => w.id === workoutId);
                          return workout ? (
                            <div key={workout.id} className="p-3 px-4">
                              <div className="flex justify-between">
                                <span>{workout.name}</span>
                                <span className="text-gray-400">Day {workout.day}</span>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                    onClick={() => navigate('/sheets')}
                  >
                    Start Program
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-700 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Premium Training Program</h3>
                <p className="text-gray-400 mb-6">
                  Purchase this program to see all workouts and start your training
                </p>
                
                {isPurchaseLoading ? (
                  <Button disabled>Loading...</Button>
                ) : canPurchase ? (
                  <Button 
                    onClick={handlePurchase}
                    disabled={checkoutLoading}
                    className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  >
                    {checkoutLoading ? 'Processing...' : `Purchase for ${formatCurrency(program.price || 0)}`}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      disabled={!user}
                      onClick={!user ? () => navigate('/auth') : undefined}
                    >
                      {!user ? 'Sign in to purchase' : 'Already purchased'}
                    </Button>
                    {!user && (
                      <p className="text-sm text-gray-400">
                        You need an account to purchase this program
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="text-gray-400 text-sm">
              <p>Created: {new Date(program.savedAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(program.lastModified || program.savedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramDetail;
