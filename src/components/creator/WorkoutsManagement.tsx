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
import { Share2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ClubSharingManagement } from './ClubSharingManagement';

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
  const [isSharingDialogOpen, setIsSharingDialogOpen] = useState(false);
  
  const updateWorkoutPrice = useUpdateWorkoutPrice();
  
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['creator-workouts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: userPrograms } = await supabase
        .from('programs')
        .select('id')
        .eq('user_id', user.id);
      
      const programIds = userPrograms?.map(p => p.id) || [];
      if (programIds.length === 0) return [];
      
      const { data: weeks } = await supabase
        .from('weeks')
        .select('id')
        .in('program_id', programIds);
      
      const weekIds = weeks?.map(w => w.id) || [];
      if (weekIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .in('week_id', weekIds);
      
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
      
      queryClient.invalidateQueries({ queryKey: ['creator-workouts', user?.id] });
    } catch (error) {
      console.error("Error updating workout price:", error);
      toast.error("Failed to update workout pricing");
    }
  };
  
  const { data: sharedCountsMap, isLoading: isLoadingSharedCounts } = useQuery({
    queryKey: ['workout-shared-counts', workouts?.map(w => w.id).join(',')],
    queryFn: async () => {
      if (!workouts || workouts.length === 0) return {};
      
      const workoutIds = workouts.map(w => w.id);
      const { data, error } = await supabase
        .from('club_shared_workouts')
        .select('workout_id, club_id')
        .in('workout_id', workoutIds);
      
      if (error) {
        console.error('Error fetching shared workout counts:', error);
        return {};
      }
      
      const counts: Record<string, number> = {};
      data.forEach(share => {
        if (!counts[share.workout_id]) {
          counts[share.workout_id] = 0;
        }
        counts[share.workout_id]++;
      });
      
      return counts;
    },
    enabled: !!workouts && workouts.length > 0
  });
  
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
                <TableHead>Club Sharing</TableHead>
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
                  <TableCell>
                    {sharedCountsMap && sharedCountsMap[workout.id] ? (
                      <span className="text-green-400">{sharedCountsMap[workout.id]} club{sharedCountsMap[workout.id] !== 1 ? 's' : ''}</span>
                    ) : (
                      <span className="text-gray-400">Not shared</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(workout.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedWorkout(workout);
                          setIsSharingDialogOpen(true);
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
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
        <>
          <PriceSettingsDialog
            open={isPriceDialogOpen}
            onOpenChange={setIsPriceDialogOpen}
            title={`Set pricing for ${selectedWorkout.name}`}
            currentPrice={selectedWorkout.price || 0}
            isPurchasable={selectedWorkout.is_purchasable || false}
            onSave={handleSavePrice}
            isSaving={updateWorkoutPrice.isPending}
          />
          
          <Dialog open={isSharingDialogOpen} onOpenChange={setIsSharingDialogOpen}>
            <DialogContent className="sm:max-w-[500px] bg-dark-200 border-dark-300">
              <ClubSharingManagement
                contentId={selectedWorkout.id}
                contentType="workout"
                contentName={selectedWorkout.name}
                onClose={() => setIsSharingDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
