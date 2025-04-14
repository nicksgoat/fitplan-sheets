
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/hooks/useAuth';
import { useHasUserPurchasedWorkout } from '@/hooks/useWorkoutData';
import { Workout } from '@/types/workout';
import { formatCurrency } from '@/utils/workout';
import { ClubAccessBadge } from './workout/ClubAccessBadge';
import { useNavigate } from 'react-router-dom';

interface WorkoutPurchaseCardProps {
  workout: Workout;
  creatorId: string;
  onPreview?: () => void;
}

export function WorkoutPurchaseCard({ workout, creatorId, onPreview }: WorkoutPurchaseCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initiateCheckout, loading } = useStripeCheckout();
  const { data, isLoading: isPurchaseLoading } = useHasUserPurchasedWorkout(user?.id || '', workout.id);
  
  const isPurchased = data?.isPurchased || false;
  const isClubShared = data?.isClubShared || false;
  const sharedWithClubs = data?.sharedWithClubs || [];
  
  console.log('[WorkoutPurchaseCard]', {
    workoutId: workout.id,
    isPurchasable: workout.isPurchasable,
    price: workout.price,
    isPurchased,
    isClubShared,
    isPurchaseLoading,
    userId: user?.id,
  });
  
  const handlePurchase = () => {
    if (!workout.price) return;
    
    initiateCheckout({
      itemType: 'workout',
      itemId: workout.id,
      itemName: workout.name,
      price: parseFloat(workout.price.toString()),
      creatorId: creatorId
    });
  };
  
  return (
    <Card className="w-full bg-dark-100 border border-dark-300 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{workout.name}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400">
            {workout.exercises?.length || 0} exercises
          </div>
          
          {workout.price && workout.isPurchasable && (
            <div className="mt-2">
              <span className="text-xl font-semibold text-fitbloom-purple">{formatCurrency(workout.price)}</span>
            </div>
          )}
          
          {isClubShared && (
            <ClubAccessBadge isClubShared={isClubShared} clubs={sharedWithClubs} />
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between gap-2">
        {onPreview && (
          <Button 
            variant="outline"
            onClick={onPreview}
            className="flex-1"
          >
            Preview
          </Button>
        )}
        
        {workout.isPurchasable && workout.price && workout.price > 0 && (
          <>
            {isPurchaseLoading ? (
              <Button disabled className="flex-1">Loading...</Button>
            ) : isPurchased || isClubShared ? (
              <Button 
                className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                onClick={() => navigate('/sheets')}
              >
                Start Training
              </Button>
            ) : (
              <Button 
                onClick={handlePurchase}
                disabled={loading || !user}
                className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              >
                {loading ? 'Processing...' : formatCurrency(workout.price)}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
