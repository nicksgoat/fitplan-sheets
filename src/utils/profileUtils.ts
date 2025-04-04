
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
  
  // Handle case where profile might be null but we have userId
  if (!profile && userId) {
    // Return minimal profile with just ID to avoid UI errors
    return {
      id: userId,
      created_at: new Date().toISOString()
    } as Profile;
  }
  
  // Return undefined if profile data is not valid and no userId provided
  return undefined;
}
