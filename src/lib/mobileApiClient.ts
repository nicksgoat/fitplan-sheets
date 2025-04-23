
// This file contains the API client for mobile integration
import { toast } from 'sonner';

// Define the structure of our mobile API client
interface MobileApiClient {
  initialize: () => Promise<boolean>;
  getWorkouts: (limit: number, offset: number) => Promise<{ data: any[], total: number }>;
  getPrograms: (limit: number, offset: number) => Promise<{ data: any[], total: number }>;
  syncData: () => Promise<boolean>;
}

// Create the mobile API client with all required methods
const mobileApi: MobileApiClient = {
  // Initialize the mobile API connection
  initialize: async () => {
    try {
      console.log('[mobileApi] Initializing connection to mobile services');
      // In a real implementation, this would verify connectivity to mobile services
      // and potentially set up any required auth tokens
      
      // Simulate successful initialization
      return true;
    } catch (error) {
      console.error('[mobileApi] Failed to initialize mobile API:', error);
      return false;
    }
  },

  // Get workouts from the mobile API
  getWorkouts: async (limit: number = 10, offset: number = 0) => {
    try {
      console.log(`[mobileApi] Getting workouts (limit: ${limit}, offset: ${offset})`);
      
      const baseUrl = 'https://api.fitbloom-mobile.com/v1';
      console.log(`[mobileApi] Using base URL: ${baseUrl}`);
      
      // Simulate API response for development
      return {
        data: Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
          id: `workout-${i + offset + 1}`,
          name: `Sample Workout ${i + offset + 1}`,
          type: 'strength',
          exercises: Math.floor(Math.random() * 8) + 3
        })),
        total: 15 // Total count of available workouts
      };
    } catch (error) {
      console.error('[mobileApi] Error fetching workouts:', error);
      toast.error('Failed to load workouts from mobile');
      return { data: [], total: 0 };
    }
  },

  // Get programs from the mobile API
  getPrograms: async (limit: number = 10, offset: number = 0) => {
    try {
      console.log(`[mobileApi] Getting programs (limit: ${limit}, offset: ${offset})`);
      
      const baseUrl = 'https://api.fitbloom-mobile.com/v1';
      console.log(`[mobileApi] Using base URL: ${baseUrl}`);
      
      // Simulate API response for development
      return {
        data: Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
          id: `program-${i + offset + 1}`,
          name: `Sample Program ${i + offset + 1}`,
          weeks: Math.floor(Math.random() * 8) + 1,
          workoutsPerWeek: Math.floor(Math.random() * 3) + 3
        })),
        total: 8 // Total count of available programs
      };
    } catch (error) {
      console.error('[mobileApi] Error fetching programs:', error);
      toast.error('Failed to load programs from mobile');
      return { data: [], total: 0 };
    }
  },

  // Sync data with the mobile API
  syncData: async () => {
    try {
      console.log('[mobileApi] Syncing data with mobile services');
      
      // Simulate successful sync operation
      return true;
    } catch (error) {
      console.error('[mobileApi] Error syncing data:', error);
      return false;
    }
  }
};

export { mobileApi };
