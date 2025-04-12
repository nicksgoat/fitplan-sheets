
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Workout } from '@/types/workout';
import { useAuth } from '@/hooks/useAuth';
import { useHasUserPurchasedWorkout } from '@/hooks/useWorkoutData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MetaTags from '@/components/meta/MetaTags';
import EnhancedProductSchema from '@/components/schema/EnhancedProductSchema';
import { ProductPurchaseSection } from '@/components/product/ProductPurchaseSection';
import WorkoutDetailSkeleton from '@/components/workout/WorkoutDetailSkeleton';
import WorkoutDetailError from '@/components/workout/WorkoutDetailError';
import WorkoutStats from '@/components/workout/WorkoutStats';
import ExerciseList from '@/components/workout/ExerciseList';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';
import WorkoutPreview from '@/components/workout/WorkoutPreview';
import { ArrowLeft, Share2 } from 'lucide-react';
import { buildCreatorProductUrl } from '@/utils/urlUtils';

const CreatorWorkoutDetail = () => {
  const { username, workoutSlug } = useParams<{ username: string, workoutSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Fetch the workout ID based on username and slug
  useEffect(() => {
    const getWorkoutBySlug = async () => {
      if (!username || !workoutSlug) {
        setFetchError('Invalid workout URL');
        setIsLoading(false);
        return;
      }
      
      try {
        // First, get the user ID from the username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle();
          
        if (profileError) throw profileError;
        if (!profileData) {
          setFetchError(`Creator ${username} not found`);
          setIsLoading(false);
          return;
        }
        
        // Then, get the workout by slug and user ID
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('id, name')
          .eq('slug', workoutSlug)
          .eq('user_id', profileData.id)
          .maybeSingle();
          
        if (workoutError) throw workoutError;
        if (!workoutData) {
          setFetchError(`Workout ${workoutSlug} not found`);
          setIsLoading(false);
          return;
        }
        
        setWorkoutId(workoutData.id);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching workout:', error);
        setFetchError(error.message || 'Failed to load workout');
        setIsLoading(false);
      }
    };
    
    getWorkoutBySlug();
  }, [username, workoutSlug]);
  
  // Fetch workout details using the existing hook once we have the ID
  // Fix: Break the direct reference chain between the workout detail and the components
  const workoutDetailResult = useWorkoutDetail(workoutId);
  const { workout, loading: workoutLoading, error: workoutError, creatorInfo } = workoutDetailResult;
  
  // Fix: Use the workout ID directly with useHasUserPurchased instead of using workout.id
  const { data: hasPurchased, isLoading: isPurchaseLoading } = 
    useHasUserPurchasedWorkout(user?.id || '', workoutId || '');
  
  // Combined loading state
  const isPageLoading = isLoading || workoutLoading;
  
  // Combined error state
  const pageError = fetchError || workoutError;
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  if (isPageLoading) {
    return <WorkoutDetailSkeleton onBack={handleBackClick} />;
  }
  
  if (pageError || !workout) {
    return <WorkoutDetailError error={pageError || 'Workout not found'} />;
  }
  
  // Calculate total sets here to avoid deep type nesting in JSX
  const totalSets = workout.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0);
  
  // Extract these values to simplify the JSX and avoid deep nesting
  const canPurchase = workout.isPurchasable && workout.price && workout.price > 0;
  const hasAccessToWorkout = !workout.isPurchasable || (workout.isPurchasable && hasPurchased);
  const workoutDescription = `Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`;
  const shareUrl = buildCreatorProductUrl(username || '', workoutSlug || '');
  
  return (
    <div className="container max-w-md mx-auto p-3">
      <MetaTags 
        title={`${workout.name} - FitBloom Workout`}
        description={workoutDescription}
        type="product"
        url={shareUrl}
        preload={[
          {
            href: `${window.location.origin}/api/og-image?title=${encodeURIComponent(workout.name)}`,
            as: 'image',
          }
        ]}
      />
      
      <EnhancedProductSchema 
        name={workout.name}
        description={workoutDescription}
        price={workout.price || 0}
        availability={workout.isPurchasable ? 'InStock' : 'OutOfStock'}
        category="Workout Program"
        seller={creatorInfo ? { name: creatorInfo.name } : undefined}
        url={`${window.location.origin}${shareUrl}`}
      />
      
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="p-1 h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="p-1 h-8 w-8">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-1">{workout.name}</h1>
      <p className="text-gray-400 text-sm mb-4">Day {workout.day} • {workout.exercises.length} exercises</p>
      
      {hasAccessToWorkout ? (
        <Card className="bg-dark-200 border-dark-300">
          <CardContent className="p-4">
            <WorkoutStats workout={workout} totalSets={totalSets} />
            <div className="mt-4">
              <ExerciseList exercises={workout.exercises} />
            </div>
            <Button 
              className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 mt-4"
              onClick={() => navigate('/sheets')}
            >
              Start Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <WorkoutPreview workout={workout} />
          
          <ProductPurchaseSection
            itemType="workout"
            itemId={workout.id}
            itemName={workout.name}
            price={workout.price || 0}
            creatorId={workout.creatorId || ''}
            isPurchasable={canPurchase}
            hasPurchased={!!hasPurchased}
            isPurchaseLoading={isPurchaseLoading}
          />
        </div>
      )}
    </div>
  );
};

export default CreatorWorkoutDetail;
