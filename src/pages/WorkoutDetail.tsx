import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Workout } from '@/types/workout';
import { parseProductUrl } from '@/utils/urlUtils';
import { useAuth } from '@/hooks/useAuth';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Button } from '@/components/ui/button';
import { useHasUserPurchasedWorkout } from '@/hooks/useWorkoutData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ShareButton from '@/components/share/ShareButton';
import MetaTags from '@/components/meta/MetaTags';
import { formatCurrency } from '@/utils/workout';
import ProductSchema from '@/components/schema/ProductSchema';
import { GuestCheckoutButton } from '@/components/checkout/GuestCheckoutButton';

interface WorkoutDataFromDB {
  id: string;
  name: string;
  day_num: number;
  created_at: string;
  updated_at: string;
  is_purchasable: boolean;
  price: number;
  week_id: string;
  user_id: string;
  exercises: {
    id: string;
    name: string;
    notes: string;
    sets: any[];
  }[];
}

const WorkoutDetail = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initiateCheckout, loading: checkoutLoading } = useStripeCheckout();
  
  const id = workoutId ? parseProductUrl(`/workout/${workoutId}`) : null;
  
  const { data: hasPurchased, isLoading: isPurchaseLoading } = 
    useHasUserPurchasedWorkout(user?.id || '', id || '');
  
  useEffect(() => {
    if (!id) {
      setError('Invalid workout ID');
      setLoading(false);
      return;
    }
    
    const fetchWorkout = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select(`
            *,
            exercises:exercises(
              id, name, notes,
              sets:exercise_sets(*)
            )
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        const workoutData = data as unknown as WorkoutDataFromDB;
        
        const mappedWorkout: Workout = {
          id: workoutData.id,
          name: workoutData.name,
          day: workoutData.day_num,
          exercises: workoutData.exercises || [],
          circuits: [],
          savedAt: workoutData.created_at,
          lastModified: workoutData.updated_at,
          isPurchasable: workoutData.is_purchasable || false,
          price: workoutData.price || 0,
          creatorId: workoutData.user_id
        };
        
        setWorkout(mappedWorkout);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching workout:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchWorkout();
  }, [id]);
  
  const handlePurchase = () => {
    if (!workout || !workout.price) return;
    
    initiateCheckout({
      itemType: 'workout',
      itemId: workout.id,
      itemName: workout.name,
      price: parseFloat(workout.price.toString()),
      creatorId: workout.creatorId || ''
    });
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  const generateProductSchema = () => {
    if (!workout) return null;
    
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": workout.name,
      "description": `Day ${workout.day} workout with ${workout.exercises.length} exercises`,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "price": workout.price || 0,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    
    return JSON.stringify(schemaData);
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <MetaTags 
          title="Loading Workout..." 
          description="Loading workout details"
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
  
  if (error || !workout) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <MetaTags 
          title="Workout Not Found" 
          description="The workout you're looking for doesn't exist or has been removed."
          type="website"
        />
        <Card className="bg-dark-200 border-dark-300 text-center py-8">
          <CardContent>
            <h2 className="text-2xl font-semibold">Workout Not Found</h2>
            <p className="text-gray-400 mt-2">
              {error || "The workout you're looking for doesn't exist or has been removed."}
            </p>
            <Button 
              className="mt-6 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              onClick={() => navigate('/explore')}
            >
              Browse Workouts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalSets = workout.exercises.reduce((acc, exercise) => {
    return acc + (exercise.sets?.length || 0);
  }, 0);
  
  const canPurchase = workout.isPurchasable && workout.price && workout.price > 0;
  const hasAccessToWorkout = !workout.isPurchasable || (workout.isPurchasable && hasPurchased);
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <MetaTags 
        title={`${workout.name} - FitBloom Workout`}
        description={`Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`}
        type="product"
        url={`/workout/${workout.id}-${workout.name.toLowerCase().replace(/\s+/g, '-')}`}
        preload={[
          {
            href: `${window.location.origin}/api/og-image?title=${encodeURIComponent(workout.name)}`,
            as: 'image',
          }
        ]}
      />
      
      <ProductSchema 
        name={workout.name}
        description={`Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`}
        price={workout.price || 0}
        availability={workout.isPurchasable ? 'InStock' : 'OutOfStock'}
      />
      
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <ShareButton 
          url={`/workout/${workout.id}-${workout.name.toLowerCase().replace(/\s+/g, '-')}`}
          title={`Check out ${workout.name} workout on FitBloom`}
          description={`Day ${workout.day} workout with ${workout.exercises.length} exercises and ${totalSets} total sets`}
        />
      </div>
      
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{workout.name}</CardTitle>
              <CardDescription className="mt-2">
                Day {workout.day} workout with {workout.exercises.length} exercises
              </CardDescription>
            </div>
            
            {workout.isPurchasable && workout.price && workout.price > 0 && (
              <div className="text-xl font-semibold text-green-500">
                {formatCurrency(workout.price)}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Dumbbell className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>{workout.exercises.length} Exercises</span>
              </div>
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Clock className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>~{totalSets} Sets Total</span>
              </div>
              <div className="flex items-center p-3 bg-dark-300 rounded-md">
                <Tag className="h-5 w-5 mr-3 text-fitbloom-purple" />
                <span>Day {workout.day}</span>
              </div>
            </div>
            
            {hasAccessToWorkout ? (
              <div>
                <h3 className="text-lg font-medium mb-3">Exercises</h3>
                <div className="space-y-3">
                  {workout.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="p-3 border border-gray-700 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{index + 1}. {exercise.name}</span>
                        <span className="text-gray-400">{exercise.sets?.length || 0} sets</span>
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-gray-400 mt-1">{exercise.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                    onClick={() => navigate('/sheets')}
                  >
                    Start Workout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2 text-center">Premium Workout</h3>
                <p className="text-gray-400 mb-6 text-center">
                  Purchase this workout to see all exercises and start your training
                </p>
                
                <div className="space-y-4">
                  {isPurchaseLoading ? (
                    <Button disabled className="w-full">Loading...</Button>
                  ) : canPurchase ? (
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      {user ? (
                        <Button 
                          onClick={handlePurchase}
                          disabled={checkoutLoading}
                          className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                        >
                          {checkoutLoading ? 'Processing...' : `Purchase (${formatCurrency(workout.price || 0)})`}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => navigate('/auth')}
                          className="w-full"
                        >
                          Sign in to Purchase
                        </Button>
                      )}
                      
                      {!user && (
                        <GuestCheckoutButton
                          itemType="workout"
                          itemId={workout.id}
                          itemName={workout.name}
                          price={workout.price || 0}
                          creatorId={workout.creatorId || ''}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400">
                      This workout is currently unavailable for purchase.
                    </p>
                  )}
                </div>
              </div>
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
