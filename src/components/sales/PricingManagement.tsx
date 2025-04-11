
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DollarSign, Pencil, Tag } from 'lucide-react';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';
import { Workout, WorkoutProgram } from '@/types/workout';

export default function PricingManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("workouts");
  const [selectedItem, setSelectedItem] = useState<{id: string, type: 'workout' | 'program', name: string, currentPrice: number, isPurchasable: boolean} | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Get workout and program data
  const { data: programs, isLoading: programsLoading } = useWorkoutData.usePrograms();
  const { 
    updateWorkoutPrice, 
    updateProgramPrice 
  } = useWorkoutData;
  
  const userPrograms = programs?.filter(program => program.userId === user?.id) || [];
  
  // Get workout data from programs
  const workouts = React.useMemo(() => {
    if (!programs) return [];
    
    const allWorkouts: Workout[] = [];
    
    programs.forEach(program => {
      if (program.userId === user?.id && program.workouts) {
        allWorkouts.push(...program.workouts);
      }
    });
    
    return allWorkouts;
  }, [programs, user?.id]);
  
  // Mutation hooks
  const workoutPriceMutation = updateWorkoutPrice();
  const programPriceMutation = updateProgramPrice();
  
  const handleSavePricing = (price: number, isPurchasable: boolean) => {
    if (!selectedItem) return;

    if (selectedItem.type === 'workout') {
      workoutPriceMutation.mutate({
        workoutId: selectedItem.id,
        price,
        isPurchasable
      });
    } else if (selectedItem.type === 'program') {
      programPriceMutation.mutate({
        programId: selectedItem.id,
        price,
        isPurchasable
      });
    }
    
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleEditPrice = (
    id: string, 
    type: 'workout' | 'program', 
    name: string, 
    currentPrice: number,
    isPurchasable: boolean
  ) => {
    setSelectedItem({ id, type, name, currentPrice, isPurchasable });
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="bg-dark-100 border-dark-300">
        <CardHeader>
          <CardTitle className="text-xl">Pricing Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-dark-200 border border-dark-300 mb-4">
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workouts" className="space-y-4">
              {workouts.length === 0 ? (
                <div className="text-center p-6 text-gray-400">
                  <Tag className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <h3 className="text-lg font-medium">No Workouts Found</h3>
                  <p className="mt-2">You haven't created any workouts yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid grid-cols-12 gap-4 py-2 px-4 font-medium text-sm text-gray-400">
                    <div className="col-span-5">Workout Name</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Price</div>
                    <div className="col-span-2"></div>
                  </div>
                  
                  {workouts.map(workout => (
                    <div 
                      key={workout.id} 
                      className="grid grid-cols-12 gap-4 items-center p-4 rounded-md bg-dark-200 border border-dark-300"
                    >
                      <div className="col-span-5 font-medium">{workout.name}</div>
                      <div className="col-span-2">
                        {workout.isPurchasable ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            For Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Not For Sale
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 flex items-center">
                        {workout.isPurchasable ? (
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">
                              {typeof workout.price === 'number' ? workout.price.toFixed(2) : '0.00'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleEditPrice(
                            workout.id, 
                            'workout', 
                            workout.name, 
                            workout.price || 0,
                            workout.isPurchasable || false
                          )}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="programs" className="space-y-4">
              {userPrograms.length === 0 ? (
                <div className="text-center p-6 text-gray-400">
                  <Tag className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <h3 className="text-lg font-medium">No Programs Found</h3>
                  <p className="mt-2">You haven't created any programs yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid grid-cols-12 gap-4 py-2 px-4 font-medium text-sm text-gray-400">
                    <div className="col-span-5">Program Name</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Price</div>
                    <div className="col-span-2"></div>
                  </div>
                  
                  {userPrograms.map((program: WorkoutProgram) => (
                    <div 
                      key={program.id} 
                      className="grid grid-cols-12 gap-4 items-center p-4 rounded-md bg-dark-200 border border-dark-300"
                    >
                      <div className="col-span-5 font-medium">{program.name}</div>
                      <div className="col-span-2">
                        {program.isPurchasable ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            For Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Not For Sale
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 flex items-center">
                        {program.isPurchasable ? (
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">
                              {typeof program.price === 'number' ? program.price.toFixed(2) : '0.00'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleEditPrice(
                            program.id, 
                            'program', 
                            program.name, 
                            program.price || 0,
                            program.isPurchasable || false
                          )}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {selectedItem && (
        <PriceSettingsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={`Set Price for ${selectedItem.name}`}
          currentPrice={selectedItem.currentPrice}
          isPurchasable={selectedItem.isPurchasable}
          onSave={handleSavePricing}
          isSaving={workoutPriceMutation.isPending || programPriceMutation.isPending}
        />
      )}
    </>
  );
}
