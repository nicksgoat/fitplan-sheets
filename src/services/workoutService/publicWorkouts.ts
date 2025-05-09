import { supabase } from "@/integrations/supabase/client";
import { ItemType } from "@/lib/types";

export async function fetchPublicWorkouts() {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        weeks!inner(
          *,
          programs!inner(
            *,
            user_id,
            name
          )
        ),
        exercises(*)
      `)
      .eq('is_purchasable', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const creatorIds = data
      ? [...new Set(data.map(workout => workout.weeks.programs.user_id))]
      : [];

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', creatorIds);

    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    const workouts = data?.map(workout => {
      const creatorProfile = profilesMap.get(workout.weeks.programs.user_id);
      
      return {
        id: workout.id,
        title: workout.name,
        type: 'workout' as const,
        creator: workout.weeks.programs.name,
        imageUrl: 'https://placehold.co/600x400?text=Workout',
        tags: ['Workout', 'Premium'],
        duration: `${workout.exercises.length} exercises`,
        difficulty: 'intermediate' as const,
        isFavorite: false,
        description: `Day ${workout.day_num} workout with ${workout.exercises.length} exercises`,
        isCustom: false,
        price: workout.price || 0,
        isPurchasable: workout.is_purchasable,
        creatorId: workout.weeks.programs.user_id,
        creatorUsername: creatorProfile?.username || null,
        slug: workout.slug || workout.id,
        savedAt: workout.created_at,
        lastModified: workout.updated_at
      };
    }) || [];
    
    return workouts;
  } catch (error) {
    console.error("Error fetching public workouts:", error);
    throw error;
  }
}

export async function fetchPublicPrograms() {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        weeks(*)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const creatorIds = data ? [...new Set(data.map(program => program.user_id))] : [];

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', creatorIds);

    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    const programs = data?.map(program => {
      const creatorProfile = profilesMap.get(program.user_id);
      const creatorName = creatorProfile?.display_name || creatorProfile?.username || 'FitBloom Creator';
      
      return {
        id: program.id,
        title: program.name,
        type: 'program' as const,
        creator: creatorName,
        imageUrl: 'https://placehold.co/600x400?text=Program',
        tags: ['Program', 'Premium'],
        duration: `${program.weeks?.length || 0} weeks`,
        difficulty: 'intermediate' as const,
        isFavorite: false,
        description: `Program with ${program.weeks?.length || 0} weeks`,
        isCustom: false,
        price: program.price || 0,
        isPurchasable: program.is_purchasable,
        creatorId: program.user_id,
        creatorUsername: creatorProfile?.username || null,
        slug: program.slug || program.id,
        savedAt: program.created_at,
        lastModified: program.updated_at
      };
    }) || [];
    
    return programs;
  } catch (error) {
    console.error("Error fetching public programs:", error);
    throw error;
  }
}

export async function fetchCreatorProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        username,
        avatar_url
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching creator profile:", error);
    return null;
  }
}
