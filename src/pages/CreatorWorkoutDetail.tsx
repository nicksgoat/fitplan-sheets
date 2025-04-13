import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { buildCreatorProductUrl } from '@/utils/urlUtils';
import { toast } from 'sonner';
import WorkoutDetailHeader from '@/components/workout/WorkoutDetailHeader';

interface WorkoutDetailState {
  id: string | null;
  isLoading: boolean;
  error: string | null;
}

const CreatorWorkoutDetail = () => {
  const { username: rawUsername, workoutSlug } = useParams<{ username: string; workoutSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const username = rawUsername?.startsWith('@') ? rawUsername.substring(1) : rawUsername;
  
  const [state, setState] = useState<WorkoutDetailState>({
    id: null,
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    const getWorkoutBySlug = async () => {
      if (!username || !workoutSlug) {
        setState(prev => ({ ...prev, error: 'Invalid workout URL', isLoading: false }));
        return;
      }
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .eq('username', username)
          .maybeSingle();
          
        if (profileError) {
          console.error("Profile error:", profileError);
          throw profileError;
        }
        
        if (!profileData) {
          console.error(`Creator @${username} not found`);
          setState(prev => ({ ...prev, error: `Creator "@${username}" not found`, isLoading: false }));
          return;
        }
        
        console.log(`Found profile ID: ${profileData.id}`);
        
        if (profileData.username && profileData.username !== username) {
          console.log(`Redirecting to correct username: ${profileData.username}`);
          navigate(buildCreatorProductUrl(profileData.username, workoutSlug), { replace: true });
          return;
        }
        
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select(`
            id,
            weeks(
              programs(
                user_id
              )
            )
          `)
          .eq('slug', workoutSlug)
          .eq('weeks.programs.user_id', profileData.id)
          .maybeSingle();
          
        if (workoutError) {
          console.error("Workout error:", workoutError);
          throw workoutError;
        }
        
        if (!workoutData) {
          console.error(`Workout ${workoutSlug} not found`);
          setState(prev => ({ 
            ...prev, 
            error: `Workout "${workoutSlug}" not found for creator "@${username}"`, 
            isLoading: false 
          }));
          return;
        }
        
        console.log(`Found workout ID: ${workoutData.id}`);
        setState({ id: workoutData.id, isLoading: false, error: null });
      } catch (error: any) {
        console.error('Error fetching workout:', error);
        setState(prev => ({ 
          ...prev, 
          error: `Couldn't load workout: ${error.message || 'Unknown error'}`, 
          isLoading: false 
        }));
      }
    };
    
    getWorkoutBySlug();
  }, [username, workoutSlug, navigate]);
  
  const { workout, loading: workoutLoading, error: workoutError, creatorInfo } = useWorkoutDetail(state.id);
  
  const { data: hasPurchased, isLoading: isPurchaseLoading } = 
    useHasUserPurchasedWorkout(user?.id || '', state.id || '');
  
  const isPageLoading = state.isLoading || workoutLoading;
  const pageError = state.error || workoutError;
  
  const handleBackClick = () => navigate(-1);
  
  if (isPageLoading) {
    return <WorkoutDetailSkeleton onBack={handleBackClick} />;
  }
  
  if (pageError || !workout) {
    return <WorkoutDetailError error={pageError || 'Workout not found'} />;
  }
  
  const totalSets = workout.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0);
  
  const canPurchase = workout.isPurchasable && workout.price && workout.price > 0;
  const hasAccessToWorkout = !workout.isPurchasable || (workout.isPurchasable && hasPurchased);
  const workoutDescription = `Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`;
  const shareUrl = buildCreatorProductUrl(creatorInfo?.username || username || '', workoutSlug || '');
  const creatorName = creatorInfo?.name || username || '';
  
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
      
      <WorkoutDetailHeader
        title={workout.name}
        description={`Day ${workout.day} • ${workout.exercises.length} exercises`}
        shareUrl={shareUrl}
        shareTitle={`${workout.name} by ${creatorName}`}
        shareDescription={workoutDescription}
        onBack={handleBackClick}
      />
      
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
