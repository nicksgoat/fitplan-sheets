
import { Profile } from '@/types/profile';

/**
 * Helper function to safely check if profile data is valid
 * and not a Supabase SelectQueryError
 */
export const isValidProfile = (profile: any): profile is Profile => {
  return profile && typeof profile === 'object' && 'id' in profile;
};

/**
 * Create a default profile object when none exists or there's an error
 */
export const createDefaultProfile = (userId: string): Profile => {
  return {
    id: userId,
    created_at: new Date().toISOString(),
    social_links: []
  };
};

/**
 * Safely handle profile from Supabase responses
 */
export const safelyGetProfile = (profileData: any, userId?: string): Profile | undefined => {
  if (!profileData) return undefined;
  
  // Check if it's an error object (from Supabase's error response)
  if ('error' in profileData) {
    return userId ? createDefaultProfile(userId) : undefined;
  }
  
  // Check if it's a valid profile object
  if (isValidProfile(profileData)) {
    return profileData;
  }
  
  return undefined;
};
