import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutProgram } from '@/types/workout';
import { useAuth } from '@/hooks/useAuth';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Button } from '@/components/ui/button';
import { useHasUserPurchasedProgram } from '@/hooks/useWorkoutData';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dumbbell, Calendar, Clock, Tag, ArrowLeft, Users, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ShareButton from '@/components/share/ShareButton';
import MetaTags from '@/components/meta/MetaTags';
import { formatCurrency } from '@/utils/workout';
import { buildCreatorProductUrl } from '@/utils/urlUtils';
import { useProfile } from '@/hooks/useProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import SocialLinks from '@/components/profile/SocialLinks';
import WorkoutDetailHeader from '@/components/workout/WorkoutDetailHeader';
import WorkoutPreview from '@/components/workout/WorkoutPreview';
import { ProductPurchaseSection } from '@/components/product/ProductPurchaseSection';
import WorkoutDetailError from '@/components/workout/WorkoutDetailError';
import WorkoutDetailSkeleton from '@/components/workout/WorkoutDetailSkeleton';

const CreatorProgramDetail = () => {
  const { username: rawUsername, programSlug } = useParams<{ username: string, programSlug: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const username = rawUsername?.startsWith('@') ? rawUsername.substring(1) : rawUsername;
  
  const [programId, setProgramId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { initiateCheckout, loading: checkoutLoading } = useStripeCheckout();
  
  useEffect(() => {
    if (!username || !programSlug) {
      setFetchError('Invalid program URL');
      setIsLoading(false);
      return;
    }
    
    const getProgramBySlug = async () => {
      try {
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
        
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('id, name')
          .eq('slug', programSlug)
          .eq('user_id', profileData.id)
          .maybeSingle();
          
        if (programError) throw programError;
        if (!programData) {
          setFetchError(`Program ${programSlug} not found`);
          setIsLoading(false);
          return;
        }
        
        setProgramId(programData.id);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching program:', error);
        setFetchError(error.message || 'Failed to load program');
        setIsLoading(false);
      }
    };
    
    getProgramBySlug();
  }, [username, programSlug]);
  
  useEffect(() => {
    if (!programId) {
      return;
    }
    
    const fetchProgram = async () => {
      try {
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('*')
          .eq('id', programId)
          .single();
        
        if (programError) throw programError;
        
        const { data: weeksData, error: weeksError } = await supabase
          .from('weeks')
          .select('*')
          .eq('program_id', programId)
          .order('order_num', { ascending: true });
        
        if (weeksError) throw weeksError;
        
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .in('week_id', weeksData.map(week => week.id))
          .order('day_num', { ascending: true });
        
        if (workoutsError) throw workoutsError;
        
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
        
        const mappedWorkouts = workoutsData.map(workout => ({
          id: workout.id,
          name: workout.name,
          day: workout.day_num,
          exercises: [],
          circuits: [],
          weekId: workout.week_id,
          savedAt: workout.created_at,
          lastModified: workout.updated_at
        }));
        
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
          creatorId: programData.user_id
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
  }, [programId]);
  
  const creatorId = program?.creatorId;
  const { profile: creatorProfile } = useProfile(creatorId);
  
  const { data: hasPurchased, isLoading: isPurchaseLoading } = 
    useHasUserPurchasedProgram(user?.id || '', programId || '');
  
  const handlePurchase = () => {
    if (!program || !program.price) return;
    
    initiateCheckout({
      itemType: 'program',
      itemId: program.id,
      itemName: program.name,
      price: parseFloat(program.price.toString()),
      creatorId: program.creatorId || ''
    });
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  const generateProgramSchema = () => {
    if (!program) return null;
    
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": program.name,
      "description": `Training program with ${program.weeks?.length || 0} weeks and ${program.workouts?.length || 0} workouts`,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "price": program.price || 0,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    
    return JSON.stringify(schemaData);
  };
  
  const isPageLoading = isLoading || loading;
  const pageError = fetchError || error;
  
  const getInitials = () => {
    const creatorName = creatorProfile?.display_name || username || '';
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
  
  const shouldShowFixedPurchaseBar = isMobile && program?.isPurchasable && program?.price && program?.price > 0 && !hasPurchased;
  
  if (isPageLoading) {
    return <WorkoutDetailSkeleton onBack={handleBackClick} />;
  }
  
  if (pageError || !program) {
    return <WorkoutDetailError error={pageError || 'Program not found'} />;
  }
  
  const totalWorkouts = program.workouts?.length || 0;
  const weekCount = program.weeks?.length || 0;
  const programDescription = `Training program with ${weekCount} ${weekCount === 1 ? 'week' : 'weeks'} and ${totalWorkouts} ${totalWorkouts === 1 ? 'workout' : 'workouts'}`;
  const shareUrl = buildCreatorProductUrl(username || '', programSlug || '');
  const creatorName = creatorProfile?.display_name || username || '';
  
  const canPurchase = program.isPurchasable && program.price && program.price > 0;
  const hasAccessToProgram = !program.isPurchasable || (program.isPurchasable && hasPurchased);
  
  return (
    <div className={`container max-w-md mx-auto p-3 ${shouldShowFixedPurchaseBar ? 'pb-24' : ''}`}>
      <MetaTags 
        title={`${program.name} - FitBloom Training Program`}
        description={programDescription}
        type="product"
        url={shareUrl}
      />
      
      <WorkoutDetailHeader
        title={program.name}
        description={`${weekCount} weeks • ${totalWorkouts} workouts`}
        shareUrl={shareUrl}
        shareTitle={`${program.name} by ${creatorName}`}
        shareDescription={programDescription}
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
      
      {hasAccessToProgram ? (
        <Card className="bg-dark-200 border-dark-300">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Calendar className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>{weekCount} {weekCount === 1 ? 'Week' : 'Weeks'}</span>
              </div>
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Dumbbell className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>{totalWorkouts} {totalWorkouts === 1 ? 'Workout' : 'Workouts'}</span>
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
            
            <div className="space-y-4">
              {program.weeks?.map((week, weekIndex) => (
                <div key={week.id} className="border border-gray-700 rounded-md overflow-hidden">
                  <div className="bg-dark-300 p-3 px-4 flex justify-between items-center">
                    <h4 className="font-medium">Week {weekIndex + 1}: {week.name}</h4>
                    <span className="text-sm text-gray-400">{week.workouts.length} workouts</span>
                  </div>
                  <div className="divide-y divide-gray-700">
                    {week.workouts.map((workoutId) => {
                      const workout = program.workouts.find(w => w.id === workoutId);
                      return workout ? (
                        <div key={workout.id} className="p-3 px-4 hover:bg-dark-300/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Dumbbell className="h-4 w-4 mr-2 text-fitbloom-purple" />
                              <span>{workout.name}</span>
                            </div>
                            <span className="text-gray-400 text-sm">Day {workout.day}</span>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 mt-4"
              onClick={() => navigate('/sheets')}
            >
              Start Program
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <WorkoutPreview 
            workout={program} 
            title="Program Preview" 
            description={programDescription} 
          />
          
          {/* Social Proof Section */}
          <Card className="bg-dark-200 border-dark-300">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Created {new Date(program.savedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">Premium program by certified trainer</span>
                </div>
              </div>
              
              {creatorProfile?.social_links && creatorProfile.social_links.length > 0 && (
                <div className="mt-3">
                  <SocialLinks links={creatorProfile.social_links} className="justify-start" />
                </div>
              )}
            </CardContent>
          </Card>
          
          {!isMobile && (
            <ProductPurchaseSection
              itemType="program"
              itemId={program.id}
              itemName={program.name}
              price={program.price || 0}
              creatorId={program.creatorId || ''}
              isPurchasable={canPurchase}
              hasPurchased={!!hasPurchased}
              isPurchaseLoading={isPurchaseLoading}
            />
          )}
        </div>
      )}
      
      {/* Fixed Purchase Bar on Mobile */}
      {shouldShowFixedPurchaseBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-300/95 backdrop-blur-md border-t border-dark-300 z-50 p-3">
          <ProductPurchaseSection
            itemType="program"
            itemId={program.id}
            itemName={program.name}
            price={program.price || 0}
            creatorId={program.creatorId || ''}
            isPurchasable={canPurchase}
            hasPurchased={!!hasPurchased}
            isPurchaseLoading={isPurchaseLoading}
            className="p-0 bg-transparent"
          />
          <div className="flex justify-center items-center text-xs text-gray-400 mt-2">
            <Shield className="h-3 w-3 mr-1 text-gray-400" />
            <p>Secure payment • Instant access</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProgramDetail;
