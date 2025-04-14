
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHasUserPurchasedWorkout } from '@/hooks/useWorkoutData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfile } from '@/hooks/useProfile';
import SocialLinks from '@/components/profile/SocialLinks';
import { Calendar, Users } from 'lucide-react';

interface WorkoutDetailState {
  id: string | null;
  isLoading: boolean;
  error: string | null;
}

const CreatorWorkoutDetail = () => {
  const { username: rawUsername, workoutSlug } = useParams<{ username: string; workoutSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
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
  
  // Get creator profile information if we have their ID
  const creatorId = workout?.creatorId;
  const { profile: creatorProfile } = useProfile(creatorId);
  
  // Get purchase and club access data
  const purchaseData = useHasUserPurchasedWorkout(user?.id || '', state.id || '');
  const isPurchased = purchaseData.data?.isPurchased || false;
  const isClubShared = purchaseData.data?.isClubShared || false;
  const sharedWithClubs = purchaseData.data?.sharedWithClubs || [];
  const isPurchaseLoading = purchaseData.isLoading;
  
  console.log('[CreatorWorkoutDetail]', {
    username,
    workoutId: state.id,
    userId: user?.id,
    isPurchased,
    isClubShared,
    isPurchaseLoading,
    sharedWithClubs
  });
  
  const isPageLoading = state.isLoading || workoutLoading || isPurchaseLoading;
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
  
  // User has access if: workout is not purchasable, or user has purchased it, or user has club access
  const hasAccessToWorkout = !workout.isPurchasable || isPurchased || isClubShared;
  
  const workoutDescription = `Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`;
  const shareUrl = buildCreatorProductUrl(creatorInfo?.username || username || '', workoutSlug || '');
  const creatorName = creatorInfo?.name || username || '';
  
  // Determine if we should show the fixed purchase bar
  const shouldShowFixedPurchaseBar = isMobile && canPurchase && !hasAccessToWorkout;
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (creatorName) {
      return creatorName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return username ? username.substring(0, 2).toUpperCase() : 'FB';
  };
  
  return (
    <div className={`container max-w-md mx-auto p-3 ${shouldShowFixedPurchaseBar ? 'pb-24' : ''}`}>
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
      
      {/* Creator Info Card */}
      <Card className="bg-dark-200 border-dark-300 mb-4">
        <CardContent className="p-4 flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={creatorProfile?.avatar_url || undefined} alt={creatorName} />
            <AvatarFallback className="bg-fitbloom-purple/20 text-fitbloom-purple">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-white">
              {creatorName}
              {username && <span className="text-gray-400 ml-1">@{username}</span>}
            </p>
            {creatorProfile?.bio && (
              <p className="text-gray-400 text-sm line-clamp-1 mt-1">{creatorProfile.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>
      
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
          <WorkoutPreview workout={workout} blurred={true} />
          
          {/* Social Proof Section */}
          <Card className="bg-dark-200 border-dark-300">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Created {new Date(workout.savedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">Premium workout by certified trainer</span>
                </div>
              </div>
              
              {/* Creator Social Links if available */}
              {creatorProfile?.social_links && creatorProfile.social_links.length > 0 && (
                <div className="mt-3">
                  <SocialLinks links={creatorProfile.social_links} className="justify-start" />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Only show the non-fixed purchase section on desktop */}
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

      {/* Fixed Purchase Bar on Mobile */}
      {shouldShowFixedPurchaseBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-300/95 backdrop-blur-md border-t border-dark-300 z-50 p-3">
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

export default CreatorWorkoutDetail;
