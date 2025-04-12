
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  useUpdateWorkoutPrice,
  useHasUserPurchasedWorkout 
} from '@/hooks/useWorkoutData';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import {
  CircleDollarSign,
  Edit,
  MoreHorizontal,
  Loader2,
  PlusCircle,
  ArrowUpDown,
  Link
} from 'lucide-react';
import { toast } from 'sonner';
import { Link as RouterLink } from 'react-router-dom';

interface Workout {
  id: string;
  name: string;
  price: number;
  is_purchasable: boolean;
  created_at: string;
  updated_at: string;
  week_id: string;
}

const WorkoutsManagement = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateWorkoutPrice, isLoading: isUpdatingPrice } = useUpdateWorkoutPrice();
  
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  React.useEffect(() => {
    if (!user) return;

    const fetchWorkouts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          throw error;
        }
        
        setWorkouts(data || []);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        toast.error('Failed to load workouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  // Sort workouts based on current sort settings
  const sortedWorkouts = [...workouts].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'price') {
      return sortOrder === 'asc' 
        ? a.price - b.price 
        : b.price - a.price;
    } else {
      return sortOrder === 'asc' 
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() 
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleToggleSort = (column: 'name' | 'price' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePriceUpdate = async (price: number, isPurchasable: boolean) => {
    if (!selectedWorkout) return;

    try {
      await updateWorkoutPrice(
        selectedWorkout.id, 
        price, 
        isPurchasable
      );
      
      // Update local state after successful API call
      setWorkouts(workouts.map(workout => {
        if (workout.id === selectedWorkout.id) {
          return {
            ...workout,
            price,
            is_purchasable: isPurchasable
          };
        }
        return workout;
      }));
      
      toast.success(`Price updated for ${selectedWorkout.name}`);
      setIsPriceDialogOpen(false);
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workouts.length) {
    return (
      <div className="text-center py-12">
        <h3 className="font-medium text-lg mb-2">No workouts available</h3>
        <p className="text-muted-foreground mb-6">
          Create workouts to start selling individual sessions.
        </p>
        <Button asChild>
          <RouterLink to="/workouts/create">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Workout
          </RouterLink>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Workouts Management</h2>
        <Button asChild className="mt-2 sm:mt-0">
          <RouterLink to="/workouts/create">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Workout
          </RouterLink>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('name')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Workout Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('price')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Price
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Program</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('date')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Created
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedWorkouts.map((workout) => (
              <TableRow key={workout.id}>
                <TableCell className="font-medium">{workout.name}</TableCell>
                <TableCell>
                  {workout.is_purchasable ? (
                    <span className="font-medium">${workout.price.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted-foreground">Not for sale</span>
                  )}
                </TableCell>
                <TableCell>
                  {workout.week_id ? (
                    <span className="text-muted-foreground">Part of program</span>
                  ) : (
                    <span className="text-muted-foreground">Standalone</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(workout.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWorkout(workout);
                          setIsPriceDialogOpen(true);
                        }}
                      >
                        <CircleDollarSign className="h-4 w-4 mr-2" />
                        Update Price
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <RouterLink to={`/workouts/edit/${workout.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Workout
                        </RouterLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedWorkout && (
        <PriceSettingsDialog
          open={isPriceDialogOpen}
          onOpenChange={setIsPriceDialogOpen}
          title={`Update Price: ${selectedWorkout.name}`}
          currentPrice={selectedWorkout.price}
          isPurchasable={selectedWorkout.is_purchasable}
          onSave={handlePriceUpdate}
          isSaving={isUpdatingPrice}
        />
      )}
    </div>
  );
};

export default WorkoutsManagement;
