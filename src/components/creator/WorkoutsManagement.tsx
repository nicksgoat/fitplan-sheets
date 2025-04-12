
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';

interface DbWorkout {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
  is_public: boolean;
  is_purchasable: boolean;
  price: number;
  thumbnail_url: string | null;
}

const WorkoutsManagement = () => {
  const { user } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState<DbWorkout | null>(null);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);

  // Fetch workouts created by the current user
  const { data: workouts, isLoading, error } = useQuery({
    queryKey: ['creatorWorkouts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('creator_id', user.id);
        
      if (error) throw error;
      return data as DbWorkout[];
    },
    enabled: !!user
  });

  // Update workout price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async ({ workoutId, price, isPurchasable }: { workoutId: string; price: number; isPurchasable: boolean }) => {
      const { error } = await supabase
        .from('workouts')
        .update({ price, is_purchasable: isPurchasable })
        .eq('id', workoutId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Workout pricing updated successfully');
      setPriceDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update workout pricing');
      console.error('Error updating workout:', error);
    }
  });

  // Update workout visibility mutation
  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ workoutId, isPublic }: { workoutId: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('workouts')
        .update({ is_public: isPublic })
        .eq('id', workoutId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Workout visibility updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update workout visibility');
      console.error('Error updating workout visibility:', error);
    }
  });

  const handleUpdatePrice = async (price: number) => {
    if (!selectedWorkout) return;
    
    updatePriceMutation.mutate({
      workoutId: selectedWorkout.id,
      price,
      isPurchasable: price > 0
    });
  };

  const handleToggleVisibility = async (workout: DbWorkout) => {
    updateVisibilityMutation.mutate({
      workoutId: workout.id,
      isPublic: !workout.is_public
    });
  };

  if (error) {
    console.error('Error fetching workouts:', error);
    toast.error('Failed to load workouts');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Workouts</h2>
        <Button variant="outline" onClick={() => {}}>Create Workout</Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : workouts?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">You haven't created any workouts yet.</p>
            <Button className="mt-4" onClick={() => {}}>Create Your First Workout</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workouts?.map((workout) => (
            <Card key={workout.id}>
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${workout.thumbnail_url || '/placeholder.svg'})` }} 
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant={workout.is_public ? 'default' : 'outline'}>
                      {workout.is_public ? 'Public' : 'Private'}
                    </Badge>
                    {workout.is_purchasable && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        ${workout.price}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {workout.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Created {format(new Date(workout.created_at), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleVisibility(workout)}
                      disabled={updateVisibilityMutation.isPending}
                    >
                      {workout.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedWorkout(workout);
                        setPriceDialogOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Price
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedWorkout && (
        <PriceSettingsDialog
          open={priceDialogOpen}
          onOpenChange={setPriceDialogOpen}
          currentPrice={selectedWorkout.price}
          isPurchasable={selectedWorkout.is_purchasable}
          onSubmit={handleUpdatePrice}
          title={`Update ${selectedWorkout.name} Pricing`}
          description="Set the price for this workout."
        />
      )}
    </div>
  );
};

export default WorkoutsManagement;
