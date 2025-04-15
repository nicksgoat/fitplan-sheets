
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Define a simple return type to avoid circular references
interface ClubContentAccessResult {
  hasAccess: boolean;
  sharedWithClubs: string[];
}

export function useClubContentAccess(contentId: string, contentType: 'workout' | 'program') {
  const { user } = useAuth();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['club-content-access', contentId, contentType, userId],
    queryFn: async (): Promise<ClubContentAccessResult> => {
      if (!contentId) {
        console.log(`[useClubContentAccess] No contentId provided`, { contentId });
        return { hasAccess: false, sharedWithClubs: [] };
      }
      
      if (!userId) {
        console.log(`[useClubContentAccess] User not authenticated`, { userId });
        return { hasAccess: false, sharedWithClubs: [] };
      }
      
      try {
        console.log(`[useClubContentAccess] Checking club access for ${contentType} ${contentId} by user ${userId}`);
        
        // First check if content is shared with any clubs
        const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
        const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
        
        const { data: sharedData, error: sharedError } = await supabase
          .from(tableName)
          .select('club_id')
          .eq(idField, contentId);
          
        if (sharedError) {
          console.error(`[useClubContentAccess] Error checking shared ${contentType}:`, sharedError);
          return { hasAccess: false, sharedWithClubs: [] };
        }
        
        if (!sharedData || sharedData.length === 0) {
          console.log(`[useClubContentAccess] ${contentType} ${contentId} is not shared with any clubs`);
          return { hasAccess: false, sharedWithClubs: [] };
        }
        
        // Get the club IDs the content is shared with
        const sharedClubIds = sharedData.map(item => item.club_id);
        console.log(`[useClubContentAccess] ${contentType} ${contentId} is shared with clubs:`, sharedClubIds);
        
        // Check if the user is a member of any of these clubs
        const { data: memberData, error: memberError } = await supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .in('club_id', sharedClubIds);
          
        if (memberError) {
          console.error("[useClubContentAccess] Error checking club membership:", memberError);
          return { hasAccess: false, sharedWithClubs: [] };
        }
        
        // Determine if the user has access through club membership
        const hasAccess = memberData && memberData.length > 0;
        
        console.log(`[useClubContentAccess] User ${userId} has club access: ${hasAccess}`, { 
          memberClubs: memberData?.map(m => m.club_id) || [],
          sharedWithClubs: sharedClubIds
        });
        
        return { 
          hasAccess, 
          sharedWithClubs: sharedClubIds 
        };
        
      } catch (error: any) {
        console.error("[useClubContentAccess] Error checking club access:", error);
        return { hasAccess: false, sharedWithClubs: [] };
      }
    },
    enabled: !!contentId && !!userId,
    staleTime: 60000, // 1 minute
  });
}
