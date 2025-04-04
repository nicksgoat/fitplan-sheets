
import { Profile } from '@/types/profile';

// Type guard to check if object is a valid profile
export function isValidProfile(profile: any): profile is Profile {
  return profile && 
         typeof profile === 'object' && 
         !('error' in profile) &&
         'id' in profile;
}

/**
 * Safely get profile data, handling error objects returned from Supabase
 * when relations can't be established
 */
export function safelyGetProfile(profile: any, userId?: string): Profile | undefined {
  if (isValidProfile(profile)) {
    return profile as Profile;
  }
  
  // Return undefined if profile data is not valid
  return undefined;
}
