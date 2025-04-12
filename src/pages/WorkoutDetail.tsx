
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parseProductUrl } from '@/utils/urlUtils';
import { useAuth } from '@/hooks/useAuth';
import { useHasUserPurchasedWorkout } from '@/hooks/useWorkoutData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MetaTags from '@/components/meta/MetaTags';
import EnhancedProductSchema from '@/components/schema/EnhancedProductSchema';
import { ProductPurchaseSection } from '@/components/product/ProductPurchaseSection';
import WorkoutDetailSkeleton from '@/components/workout/WorkoutDetailSkeleton';
import WorkoutDetailError from '@/components/workout/WorkoutDetailError';
import WorkoutStats from '@/components/workout/WorkoutStats';
import ExerciseList from '@/components/workout/ExerciseList';
import WorkoutDetailHeader from '@/components/workout/WorkoutDetailHeader';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';

const WorkoutDetail = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Extract the workoutId from the URL parameter
  const extractedId = workoutId ? parseProductUrl(`/workout/${workoutId}`) : null;
  
  // Safely check if extractedId is a valid UUID format
  const isValidUuid = extractedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(extractedId);
  
  // Only fetch if ID appears to be in valid format
  const id = isValidUuid ? extractedId : null;
  
  // Fetch workout data using custom hook
  const { workout, loading, error, creatorInfo } = useWorkoutDetail(id);
  
  const { data: hasPurchased, isLoading: isPurchaseLoading } = 
    useHasUserPurchasedWorkout(user?.id || '', id || '');
  
  // Preload exercise details for better performance
  useEffect(() => {
    const preloadImage = (url: string) => {
      const img = new Image();
      img.src = url;
    };

    // Preload OG image for sharing
    if (workout?.name) {
      const ogImageUrl = `${window.location.origin}/api/og-image?title=${encodeURIComponent(workout.name)}`;
      preloadImage(ogImageUrl);
    }
  }, [workout?.name]);
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  // Early return for loading state
  if (loading) {
    return <WorkoutDetailSkeleton onBack={handleBackClick} />;
  }
  
  // Early return for error state
  if (error || !workout) {
    return <WorkoutDetailError error={error || 'Workout not found'} />;
  }
  
  const totalSets = workout.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0);
  
  const canPurchase = workout.isPurchasable && workout.price && workout.price > 0;
  const hasAccessToWorkout = !workout.isPurchasable || (workout.isPurchasable && hasPurchased);
  const workoutDescription = `Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`;
  
  // Formatted URL for sharing and SEO
  const getFormattedUrl = () => {
    if (!workout) return '';
    return `/workout/${workout.id}-${workout.name.toLowerCase().replace(/\s+/g, '-')}`;
  };
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <MetaTags 
        title={`${workout.name} - FitBloom Workout`}
        description={workoutDescription}
        type="product"
        url={getFormattedUrl()}
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
        url={`${window.location.origin}${getFormattedUrl()}`}
      />
      
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <WorkoutDetailHeader 
            title={workout.name}
            description={`Day ${workout.day} workout with ${workout.exercises.length} exercises`}
            shareUrl={getFormattedUrl()}
            shareTitle={`Check out ${workout.name} workout on FitBloom`}
            shareDescription={workoutDescription}
            onBack={handleBackClick}
          />
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <WorkoutStats workout={workout} totalSets={totalSets} />
            
            {hasAccessToWorkout ? (
              <ExerciseList exercises={workout.exercises} />
            ) : (
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
            )}
            
            <div className="text-gray-400 text-sm">
              <p>Last updated: {new Date(workout.lastModified || workout.savedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutDetail;
