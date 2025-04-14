
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Workout } from '@/types/workout';
import ContentGrid from '../ui/ContentGrid';
import { ItemType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const PurchasesTab = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<ItemType[]>([]);
  const [programs, setPrograms] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('workouts');
  
  useEffect(() => {
    if (user) {
      loadPurchases();
    }
  }, [user]);
  
  const loadPurchases = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load purchased workouts
      await loadPurchasedWorkouts();
      
      // Load purchased programs
      await loadPurchasedPrograms();
      
      // Load items from clubs user has access to
      await loadClubSharedContent();
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPurchasedWorkouts = async () => {
    const { data: purchasedWorkouts, error: purchasedWorkoutsError } = await supabase
      .from('workout_purchases')
      .select(`
        workout_id,
        workouts:workout_id(
          id,
          name,
          price,
          is_purchasable,
          week_id,
          weeks:week_id(
            program_id,
            programs:program_id(
              user_id,
              users:user_id(
                profiles:id(
                  display_name,
                  username
                )
              )
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed');
    
    if (purchasedWorkoutsError) {
      console.error('Error loading purchased workouts:', purchasedWorkoutsError);
      return;
    }
    
    // Transform the data for the UI
    const transformedWorkouts = purchasedWorkouts
      .filter(pw => pw.workouts) // Filter out any null workouts
      .map(pw => {
        const workout = pw.workouts as any;
        const creator = workout.weeks?.programs?.users?.profiles;
        
        return {
          id: workout.id,
          title: workout.name,
          type: 'workout' as const,
          description: `Purchased workout`,
          creator: creator?.display_name || creator?.username || 'Unknown Creator',
          creatorId: workout.weeks?.programs?.user_id,
          creatorUsername: creator?.username,
          difficulty: 'intermediate' as const,
          duration: '',
          price: workout.price,
          isPurchasable: workout.is_purchasable,
          purchased: true,
          tags: [],
          // Add required properties for ItemType
          imageUrl: '', // Default empty string
          isFavorite: false // Default false
        };
      });
    
    setWorkouts(transformedWorkouts);
  };
  
  const loadPurchasedPrograms = async () => {
    const { data: purchasedPrograms, error: purchasedProgramsError } = await supabase
      .from('program_purchases')
      .select(`
        program_id,
        programs:program_id(
          id,
          name,
          price,
          is_purchasable,
          user_id,
          users:user_id(
            profiles:id(
              display_name,
              username
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed');
    
    if (purchasedProgramsError) {
      console.error('Error loading purchased programs:', purchasedProgramsError);
      return;
    }
    
    // Transform the data for the UI
    const transformedPrograms = purchasedPrograms
      .filter(pp => pp.programs) // Filter out any null programs
      .map(pp => {
        const program = pp.programs as any;
        const creator = program.users?.profiles;
        
        return {
          id: program.id,
          title: program.name,
          type: 'program' as const,
          description: `Purchased program`,
          creator: creator?.display_name || creator?.username || 'Unknown Creator',
          creatorId: program.user_id,
          creatorUsername: creator?.username,
          difficulty: 'intermediate' as const,
          duration: '',
          price: program.price,
          isPurchasable: program.is_purchasable,
          purchased: true,
          tags: [],
          // Add required properties for ItemType
          imageUrl: '', // Default empty string
          isFavorite: false // Default false
        };
      });
    
    setPrograms(transformedPrograms);
  };
  
  const loadClubSharedContent = async () => {
    // Load clubs user is a member of
    const { data: memberClubs, error: memberClubsError } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', user.id)
      .eq('status', 'active');
      
    if (memberClubsError || !memberClubs.length) {
      console.log('No club memberships or error:', memberClubsError);
      return;
    }
    
    const clubIds = memberClubs.map(m => m.club_id);
    
    // Load shared workouts
    const { data: sharedWorkouts, error: sharedWorkoutsError } = await supabase
      .from('club_shared_workouts')
      .select(`
        workout_id,
        workouts:workout_id(
          id,
          name,
          price,
          is_purchasable,
          week_id,
          weeks:week_id(
            program_id,
            programs:program_id(
              user_id,
              users:user_id(
                profiles:id(
                  display_name,
                  username
                )
              )
            )
          )
        )
      `)
      .in('club_id', clubIds);
      
    if (!sharedWorkoutsError && sharedWorkouts.length) {
      const transformedSharedWorkouts = sharedWorkouts
        .filter(sw => sw.workouts)
        .map(sw => {
          const workout = sw.workouts as any;
          const creator = workout.weeks?.programs?.users?.profiles;
          
          return {
            id: workout.id,
            title: workout.name,
            type: 'workout' as const,
            description: `From club membership`,
            creator: creator?.display_name || creator?.username || 'Unknown Creator',
            creatorId: workout.weeks?.programs?.user_id,
            creatorUsername: creator?.username,
            difficulty: 'intermediate' as const,
            duration: '',
            price: workout.price,
            isPurchasable: workout.is_purchasable,
            viaClub: true,
            tags: [],
            // Add required properties for ItemType
            imageUrl: '', // Default empty string
            isFavorite: false // Default false
          };
        });
      
      // Add shared workouts to the existing workouts, avoiding duplicates
      setWorkouts(prev => {
        const existingIds = new Set(prev.map(w => w.id));
        const newWorkouts = transformedSharedWorkouts.filter(w => !existingIds.has(w.id));
        return [...prev, ...newWorkouts];
      });
    }
    
    // Load shared programs
    const { data: sharedPrograms, error: sharedProgramsError } = await supabase
      .from('club_shared_programs')
      .select(`
        program_id,
        programs:program_id(
          id,
          name,
          price,
          is_purchasable,
          user_id,
          users:user_id(
            profiles:id(
              display_name,
              username
            )
          )
        )
      `)
      .in('club_id', clubIds);
      
    if (!sharedProgramsError && sharedPrograms.length) {
      const transformedSharedPrograms = sharedPrograms
        .filter(sp => sp.programs)
        .map(sp => {
          const program = sp.programs as any;
          const creator = program.users?.profiles;
          
          return {
            id: program.id,
            title: program.name,
            type: 'program' as const,
            description: `From club membership`,
            creator: creator?.display_name || creator?.username || 'Unknown Creator',
            creatorId: program.user_id,
            creatorUsername: creator?.username,
            difficulty: 'intermediate' as const,
            duration: '',
            price: program.price,
            isPurchasable: program.is_purchasable,
            viaClub: true,
            tags: [],
            // Add required properties for ItemType
            imageUrl: '', // Default empty string
            isFavorite: false // Default false
          };
        });
      
      // Add shared programs to the existing programs, avoiding duplicates
      setPrograms(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPrograms = transformedSharedPrograms.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPrograms];
      });
    }
  };
  
  return (
    <div className="w-full">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="workouts">
            Workouts {workouts.length > 0 && `(${workouts.length})`}
          </TabsTrigger>
          <TabsTrigger value="programs">
            Programs {programs.length > 0 && `(${programs.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workouts" className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : workouts.length > 0 ? (
            <ContentGrid items={workouts} />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>You haven't purchased any workouts yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="programs" className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : programs.length > 0 ? (
            <ContentGrid items={programs} />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>You haven't purchased any programs yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchasesTab;
