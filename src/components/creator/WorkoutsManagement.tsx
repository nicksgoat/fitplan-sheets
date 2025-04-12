
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateWorkoutPrice } from '@/hooks/useWorkoutData';
import { formatCurrency } from '@/utils/workout';

type Workout = {
  id: string;
  name: string;
  price: number | null;
  is_purchasable: boolean;
  week_id: string;
  day_num: number;
  created_at: string;
  updated_at: string;
};

export const WorkoutsManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  
  const updateWorkoutPrice = useUpdateWorkoutPrice();
  
  // Fetch user's workouts
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['creator-workouts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*, week_id')
        .in('week_id', 
          supabase
            .from('weeks')
            .select('id')
            .in('program_id',
              supabase
                .from('programs')
                .select('id')
                .eq('user_id', user.id)
            )
        );
      
      if (error) {
        throw error;
      }
      
      return data as Workout[];
    },
    enabled: !!user
  });
  
  const handleSavePrice = async (price: number, isPurchasable: boolean) => {
    if (!selectedWorkout) return;
    
    try {
      await updateWorkoutPrice.mutateAsync({
        workoutId: selectedWorkout.id,
        price,
        isPurchasable
      });
      
      toast.success("Workout pricing updated successfully");
      setIsPriceDialogOpen(false);
      
      // Update local state
      queryClient.invalidateQueries({ queryKey: ['creator-workouts', user?.id] });
    } catch (error) {
      console.error("Error updating workout price:", error);
      toast.error("Failed to update workout pricing");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Workouts</h2>
      </div>
      
      <div className="border rounded-md border-dark-300 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading workouts...</div>
        ) : workouts && workouts.length > 0 ? (
          <Table>
            <TableHeader className="bg-dark-300">
              <TableRow>
                <TableHead>Workout Name</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.id} className="border-dark-300">
                  <TableCell>{workout.name}</TableCell>
                  <TableCell>Day {workout.day_num}</TableCell>
                  <TableCell>{workout.is_purchasable ? formatCurrency(workout.price || 0) : 'Not for sale'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${workout.is_purchasable ? 'bg-green-900/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                      {workout.is_purchasable ? 'Purchasable' : 'Not for sale'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(workout.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedWorkout(workout);
                        setIsPriceDialogOpen(true);
                      }}
                    >
                      Set Price
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <p className="mb-4 text-gray-400">You haven't created any workouts yet.</p>
            <Button className="bg-fitbloom-purple hover:bg-fitbloom-purple/90" asChild>
              <a href="/sheets">Create a Workout</a>
            </Button>
          </div>
        )}
      </div>
      
      {selectedWorkout && (
        <PriceSettingsDialog
          open={isPriceDialogOpen}
          onOpenChange={setIsPriceDialogOpen}
          title={`Set pricing for ${selectedWorkout.name}`}
          currentPrice={selectedWorkout.price || 0}
          isPurchasable={selectedWorkout.is_purchasable || false}
          onSave={handleSavePrice}
          isSaving={updateWorkoutPrice.isPending}
        />
      )}
    </div>
  );
};
