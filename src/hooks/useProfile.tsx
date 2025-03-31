
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Profile, SocialLink } from '@/types/profile';

export const useProfile = (profileId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Determine which profile ID to use
  const targetProfileId = profileId || user?.id;
  
  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', targetProfileId],
    queryFn: async () => {
      if (!targetProfileId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetProfileId)
        .single();
      
      if (error) {
        toast.error('Failed to load profile');
        throw error;
      }
      
      // Parse social_links from JSON to SocialLink[] if it exists
      let socialLinks: SocialLink[] = [];
      if (data.social_links) {
        try {
          // Handle both string and array cases
          if (typeof data.social_links === 'string') {
            socialLinks = JSON.parse(data.social_links) as SocialLink[];
          } else if (Array.isArray(data.social_links)) {
            // Ensure each item has the required properties
            socialLinks = (data.social_links as any[]).map(link => ({
              platform: link.platform || '',
              url: link.url || '',
              icon: link.icon
            }));
          } else if (typeof data.social_links === 'object') {
            // Handle case where it might be a single object
            const link = data.social_links as any;
            if (link.platform && link.url) {
              socialLinks = [{ 
                platform: link.platform, 
                url: link.url,
                icon: link.icon
              }];
            }
          }
        } catch (e) {
          console.error('Error parsing social links:', e);
          socialLinks = [];
        }
      }
      
      return {
        ...data,
        social_links: socialLinks
      } as Profile;
    },
    enabled: !!targetProfileId,
  });
  
  // Update profile data
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      if (!targetProfileId) throw new Error('No profile ID provided');
      
      // Convert social_links to JSON for Supabase
      const profileData = { ...updatedProfile };
      
      // Convert SocialLink[] to a JSON-compatible format
      if (profileData.social_links) {
        const socialLinksJson = JSON.stringify(profileData.social_links);
        profileData.social_links = socialLinksJson as any;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', targetProfileId);
      
      if (error) {
        toast.error('Failed to update profile');
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile', targetProfileId] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  });
  
  // Add social link
  const addSocialLink = (newLink: SocialLink) => {
    if (!profile) return;
    
    const updatedLinks = [...(profile.social_links || []), newLink];
    updateProfile({ social_links: updatedLinks });
  };
  
  // Remove social link
  const removeSocialLink = (index: number) => {
    if (!profile?.social_links) return;
    
    const updatedLinks = [...profile.social_links];
    updatedLinks.splice(index, 1);
    updateProfile({ social_links: updatedLinks });
  };
  
  // Update social link
  const updateSocialLink = (index: number, updatedLink: SocialLink) => {
    if (!profile?.social_links) return;
    
    const updatedLinks = [...profile.social_links];
    updatedLinks[index] = updatedLink;
    updateProfile({ social_links: updatedLinks });
  };
  
  const isOwnProfile = user?.id === targetProfileId;
  
  return {
    profile,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    updateProfile,
    isUpdating,
    isOwnProfile,
    addSocialLink,
    removeSocialLink,
    updateSocialLink
  };
};
