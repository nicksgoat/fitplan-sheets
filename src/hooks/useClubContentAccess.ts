
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to check if the user has access to content through club sharing
 */
export function useClubContentAccess(contentId: string, contentType: 'workout' | 'program') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['club-content-access', contentId, contentType, user?.id],
    queryFn: async () => {
      if (!user || !contentId) {
        return { hasAccess: false };
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-club-content-access', {
          body: {
            userId: user.id,
            contentId,
            contentType
          }
        });

        if (error) {
          console.error('Error checking club access:', error);
          return { hasAccess: false };
        }

        return { 
          hasAccess: data.hasAccess,
          sharedWithClubs: data.sharedWithClubs || []
        };
      } catch (error) {
        console.error('Error invoking check-club-content-access function:', error);
        return { hasAccess: false };
      }
    },
    enabled: !!user && !!contentId
  });
}
