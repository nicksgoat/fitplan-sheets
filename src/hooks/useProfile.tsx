
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Profile, SocialLink } from '@/types/profile';
import { Json } from '@/integrations/supabase/types';

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
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetProfileId)
          .single();
        
        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }
        
        if (!data) {
          console.log('No profile found, creating default profile');
          // Return a default profile to avoid UI errors
          return {
            id: targetProfileId,
            username: user?.email || user?.phone || 'user',
            display_name: null,
            bio: null,
            avatar_url: null,
            website: null,
            social_links: [],
            created_at: new Date().toISOString(),
            updated_at: null
          } as Profile;
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
      } catch (error) {
        console.error('Error in profile query:', error);
        toast.error('Failed to load profile');
        
        // Return fallback profile to prevent UI errors
        return {
          id: targetProfileId,
          username: user?.email || user?.phone || 'user',
          display_name: null,
          bio: null,
          avatar_url: null,
          website: null,
          social_links: [],
          created_at: new Date().toISOString(),
          updated_at: null
        } as Profile;
      }
    },
    enabled: !!targetProfileId,
  });
  
  // Update profile data
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      if (!targetProfileId) throw new Error('No profile ID provided');
      
      // Prepare a copy of the profile for submission
      const profileData: Record<string, any> = { ...updatedProfile };
      
      // Convert SocialLink[] to JSON string for Supabase
      if (profileData.social_links) {
        // Convert the SocialLink[] to a stringified JSON for storage
        profileData.social_links = JSON.stringify(profileData.social_links);
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', targetProfileId);
      
      if (error) {
        console.error('Error updating profile:', error);
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
