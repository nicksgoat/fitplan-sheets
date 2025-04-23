
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ShareData {
  workoutId?: string;
  programId?: string;
  clubId: string;
}

export function useClubSharing() {
  const { user } = useAuth();
  
  const shareToClub = useMutation({
    mutationFn: async (data: ShareData) => {
      if (!user?.id) throw new Error("User not authenticated");
      if (!data.clubId) throw new Error("Club ID is required");
      
      if (data.workoutId) {
        const { error } = await supabase
          .from('club_shared_workouts')
          .insert({ 
            club_id: data.clubId, 
            workout_id: data.workoutId,
            shared_by: user.id 
          });
          
        if (error) throw error;
      }
      
      if (data.programId) {
        const { error } = await supabase
          .from('club_shared_programs')
          .insert({ 
            club_id: data.clubId, 
            program_id: data.programId,
            shared_by: user.id
          });
          
        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Successfully shared with club!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to share: ${error.message}`);
    }
  });

  return {
    shareToClub
  };
}

// Re-export the useShareWithClubs hook
export { useShareWithClubs } from './useShareWithClubs';
