
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Workout, WorkoutProgram } from "@/types/workout";
import { ItemType } from "@/lib/types";
import ContentGrid from "@/components/ui/ContentGrid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PurchasesTab: React.FC = () => {
  const { user } = useAuth();
  const [workoutPurchases, setWorkoutPurchases] = useState<ItemType[]>([]);
  const [programPurchases, setProgramPurchases] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('workouts');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const fetchPurchasedItems = async () => {
      try {
        // Fetch purchased workouts
        const { data: workoutData, error: workoutError } = await supabase
          .from('workout_purchases')
          .select(`
            workout_id,
            purchase_date,
            workouts (
              id,
              name,
              day_num,
              price,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed');
          
        if (workoutError) {
          throw workoutError;
        }
        
        // Fetch purchased programs
        const { data: programData, error: programError } = await supabase
          .from('program_purchases')
          .select(`
            program_id,
            purchase_date,
            programs (
              id,
              name,
              price,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed');
          
        if (programError) {
          throw programError;
        }
        
        // Transform data to ItemType format
        const workoutItems: ItemType[] = workoutData
          .filter(purchase => purchase.workouts)
          .map(purchase => ({
            id: purchase.workouts.id,
            title: purchase.workouts.name,
            type: 'workout' as const,
            creator: 'Purchased',
            imageUrl: 'https://placehold.co/600x400?text=Workout',
            tags: ['Purchased', 'Workout'],
            duration: `Day ${purchase.workouts.day_num} workout`,
            difficulty: 'intermediate' as const,
            isFavorite: false,
            description: `Purchased workout`,
            isCustom: false,
            price: purchase.workouts.price,
            isPurchasable: false,
            savedAt: purchase.purchase_date,
            lastModified: purchase.workouts.updated_at
          }));
          
        const programItems: ItemType[] = programData
          .filter(purchase => purchase.programs)
          .map(purchase => ({
            id: purchase.programs.id,
            title: purchase.programs.name,
            type: 'program' as const,
            creator: 'Purchased',
            imageUrl: 'https://placehold.co/600x400?text=Program',
            tags: ['Purchased', 'Program'],
            duration: 'Full program',
            difficulty: 'intermediate' as const,
            isFavorite: false,
            description: `Purchased program`,
            isCustom: false,
            price: purchase.programs.price,
            isPurchasable: false,
            savedAt: purchase.purchase_date,
            lastModified: purchase.programs.updated_at
          }));
        
        setWorkoutPurchases(workoutItems);
        setProgramPurchases(programItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        toast.error("Failed to load purchases");
        setIsLoading(false);
      }
    };
    
    fetchPurchasedItems();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 mb-4">You need to be logged in to view your purchases.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 mb-4">Loading purchases...</p>
      </div>
    );
  }
  
  const hasWorkoutPurchases = workoutPurchases.length > 0;
  const hasProgramPurchases = programPurchases.length > 0;
  const hasPurchases = hasWorkoutPurchases || hasProgramPurchases;
  
  if (!hasPurchases) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 mb-4">You haven't purchased any workouts or programs yet.</p>
        <Button 
          className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90 text-sm"
          onClick={() => window.location.href = "/explore"}
        >
          Explore Available Content
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeSubTab}
        onValueChange={setActiveSubTab}
      >
        <TabsList>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workouts" className="mt-4">
          {!hasWorkoutPurchases ? (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-4">You haven't purchased any workouts yet.</p>
            </div>
          ) : (
            <ContentGrid items={workoutPurchases} />
          )}
        </TabsContent>
        
        <TabsContent value="programs" className="mt-4">
          {!hasProgramPurchases ? (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-4">You haven't purchased any programs yet.</p>
            </div>
          ) : (
            <ContentGrid items={programPurchases} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchasesTab;
