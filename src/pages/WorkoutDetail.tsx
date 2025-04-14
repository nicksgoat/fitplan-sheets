import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parseProductUrl } from '@/utils/urlUtils';
import { useAuth } from '@/hooks/useAuth';
import { useHasUserPurchasedWorkout } from '@/hooks/useWorkoutData';
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
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildCreatorProductUrl } from '@/utils/urlUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const WorkoutDetail = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const extractedId = workoutId ? parseProductUrl(`/workout/${workoutId}`) : null;
  const isValidUuid = extractedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(extractedId);
  const id = isValidUuid ? extractedId : null;
  
  const { workout, loading, error, creatorInfo } = useWorkoutDetail(id);
  
  const purchaseData = useHasUserPurchasedWorkout(user?.id || '', id || '');
  const isPurchased = purchaseData.data?.isPurchased || false;
  const isClubShared = purchaseData.data?.isClubShared || false;
  const sharedWithClubs = purchaseData.data?.sharedWithClubs || [];
  const isPurchaseLoading = purchaseData.isLoading;

  const [ogImageUrl, setOgImageUrl] = React.useState<string | null>(null);

  console.log('[WorkoutDetail]', {
    userId: user?.id,
    workoutId: id,
    workout: workout?.name,
    isPurchased,
    isClubShared,
    isPurchaseLoading,
    sharedWithClubs
  });

  useEffect(() => {
    const getCreatorProfileImage = async () => {
      if (workout?.creatorId) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url, username, display_name')
            .eq('id', workout.creatorId)
            .maybeSingle();
          
          if (profileData?.avatar_url) {
            setOgImageUrl(profileData.avatar_url);
          } else {
            const fallbackImage = `${window.location.origin}/api/og-image?title=${encodeURIComponent(workout.name)}`;
            setOgImageUrl(fallbackImage);
          }
        } catch (err) {
          console.error("Error fetching creator profile:", err);
          const fallbackImage = `${window.location.origin}/api/og-image?title=${encodeURIComponent(workout.name)}`;
          setOgImageUrl(fallbackImage);
        }
      }
    };

    if (workout?.name && workout?.creatorId) {
      getCreatorProfileImage();
    }
  }, [workout?.creatorId, workout?.name]);

  useEffect(() => {
    const checkForRedirect = async () => {
      if (workout && workout.creatorId) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', workout.creatorId)
            .maybeSingle();
          
          if (profileData?.username && workout.slug) {
            console.log(`Redirecting to creator URL: /@${profileData.username}/${workout.slug}`);
            const newUrl = buildCreatorProductUrl(profileData.username, workout.slug);
            navigate(newUrl, { replace: true });
          }
        } catch (err) {
          console.error("Error fetching creator username:", err);
        }
      }
    };

    if (!loading && !error && workout) {
      checkForRedirect();
    }
  }, [workout, loading, error, navigate]);
  
  useEffect(() => {
    const preloadImage = (url: string) => {
      const img = new Image();
      img.src = url;
    };

    if (ogImageUrl) {
      preloadImage(ogImageUrl);
    }
  }, [ogImageUrl]);
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  if (loading || isPurchaseLoading) {
    return <WorkoutDetailSkeleton onBack={() => navigate(-1)} />;
  }
  
  if (error || !workout) {
    return <WorkoutDetailError error={error || 'Workout not found'} />;
  }
  
  const totalSets = workout.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0);
  
  const canPurchase = workout.isPurchasable && workout.price && workout.price > 0;
  
  const hasAccessToWorkout = !workout.isPurchasable || isPurchased || isClubShared;
  
  const workoutDescription = `Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`;
  
  const getFormattedUrl = () => {
    if (!workout) return '';
    return `/workout/${workout.id}-${workout.name.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const metaTitle = creatorInfo ? 
    `${workout.name} by ${creatorInfo.name} - FitBloom Workout` : 
    `${workout.name} - FitBloom Workout`;
  
  const shouldShowFixedPurchaseBar = isMobile && canPurchase && !hasAccessToWorkout;
  
  return (
    <div className={`container max-w-md mx-auto p-3 ${shouldShowFixedPurchaseBar ? 'pb-44' : 'pb-6'}`}>
      <MetaTags 
        title={metaTitle}
        description={workoutDescription}
        type="product"
        url={getFormattedUrl()}
        imageUrl={ogImageUrl || undefined}
        preload={[
          {
            href: ogImageUrl || `${window.location.origin}/api/og-image?title=${encodeURIComponent(workout.name)}`,
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
        <div className="space-y-4 mb-32">
          <WorkoutPreview workout={workout} blurred={true} />
          
          {!isMobile && (
            <ProductPurchaseSection
              itemType="workout"
              itemId={workout.id}
              itemName={workout.name}
              price={workout.price || 0}
              creatorId={workout.creatorId || ''}
              isPurchasable={canPurchase}
              hasPurchased={isPurchased}
              isPurchaseLoading={isPurchaseLoading}
              isClubShared={isClubShared}
              sharedWithClubs={sharedWithClubs}
            />
          )}
        </div>
      )}
      
      {shouldShowFixedPurchaseBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-300/90 backdrop-blur-md border-t border-dark-300 z-50 p-3 max-h-32">
          <ProductPurchaseSection
            itemType="workout"
            itemId={workout.id}
            itemName={workout.name}
            price={workout.price || 0}
            creatorId={workout.creatorId || ''}
            isPurchasable={canPurchase}
            hasPurchased={isPurchased}
            isPurchaseLoading={isPurchaseLoading}
            isClubShared={isClubShared}
            sharedWithClubs={sharedWithClubs}
            className="p-0 bg-transparent"
          />
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
