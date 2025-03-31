
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile, SocialLink } from '@/types/profile';
import { toast } from 'sonner';

export function useProfile(profileId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  // Determine which profile ID to use
  const targetProfileId = profileId || user?.id;

  useEffect(() => {
    if (!targetProfileId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetProfileId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile');
        } else {
          // Parse JSON social links if they exist
          let profileData = { ...data };
          if (profileData.social_links) {
            try {
              // Handle both string JSON and already parsed objects
              if (typeof profileData.social_links === 'string') {
                profileData.social_links = JSON.parse(profileData.social_links);
              }
              
              // Ensure it's an array of SocialLink objects
              if (!Array.isArray(profileData.social_links)) {
                profileData.social_links = Object.entries(profileData.social_links).map(
                  ([platform, url]) => ({ platform, url })
                );
              }
            } catch (e) {
              console.error('Error parsing social links:', e);
              profileData.social_links = [];
            }
          } else {
            profileData.social_links = [];
          }
          
          setProfile(profileData);
          setIsCurrentUser(user?.id === targetProfileId);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetProfileId, user?.id]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !isCurrentUser) {
      toast.error('You can only update your own profile');
      return { success: false };
    }

    try {
      setLoading(true);
      
      // Prepare social links for storage if they exist in updates
      let updatesToApply = { ...updates };
      if (updatesToApply.social_links) {
        updatesToApply.social_links = updatesToApply.social_links as unknown as object;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updatesToApply)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return { success: false, error };
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err) {
      console.error('Unexpected error updating profile:', err);
      toast.error('An unexpected error occurred');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    isCurrentUser,
    updateProfile
  };
}
