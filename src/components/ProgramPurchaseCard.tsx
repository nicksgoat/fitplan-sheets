
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/hooks/useAuth';
import { useHasUserPurchasedProgram } from '@/hooks/useWorkoutData';
import { WorkoutProgram } from '@/types/workout';
import { formatCurrency } from '@/utils/workout';

interface ProgramPurchaseCardProps {
  program: WorkoutProgram;
  onPreview?: () => void;
}

export function ProgramPurchaseCard({ program, onPreview }: ProgramPurchaseCardProps) {
  const { user } = useAuth();
  const { initiateCheckout, loading } = useStripeCheckout();
  const { data: hasPurchased, isLoading: isPurchaseLoading, isClubShared } = 
    useHasUserPurchasedProgram(user?.id || '', program.id);
  
  const handlePurchase = () => {
    if (!program.price) return;
    
    initiateCheckout({
      itemType: 'program',
      itemId: program.id,
      itemName: program.name,
      price: parseFloat(program.price.toString()),
      creatorId: program.creatorId || ''
    });
  };
  
  return (
    <Card className="w-full bg-dark-100 border border-dark-300 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{program.name}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400">
            {program.weeks?.length || 0} weeks • {program.workouts?.length || 0} workouts
          </div>
          
          {program.price && program.isPurchasable && (
            <div className="mt-2">
              <span className="text-xl font-semibold text-fitbloom-purple">{formatCurrency(program.price)}</span>
            </div>
          )}
          
          {isClubShared && (
            <div className="mt-1">
              <span className="text-sm text-green-400">Available via Club Membership</span>
            </div>
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
        
        {program.isPurchasable && program.price && program.price > 0 && (
          <>
            {isPurchaseLoading ? (
              <Button disabled className="flex-1">Loading...</Button>
            ) : hasPurchased || isClubShared ? (
              <Button variant="outline" disabled className="flex-1 bg-green-800/20 text-green-400 border-green-800">
                {isClubShared ? 'Via Club' : 'Purchased'}
              </Button>
            ) : (
              <Button 
                onClick={handlePurchase}
                disabled={loading || !user}
                className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              >
                {loading ? 'Processing...' : formatCurrency(program.price)}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
