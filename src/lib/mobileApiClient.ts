
import { supabase } from '@/integrations/supabase/client';

// Base URL for the API - hardcoded to avoid process.env reference which causes errors
const API_URL = 'https://cmzhdyiadvuuwypocxjv.supabase.co/functions/v1/api';

/**
 * Response types for API endpoints
 */
export interface WorkoutResponse {
  id: string;
  name: string;
  exercises: any[];
  circuits: any[];
  [key: string]: any;
}

export interface ProgramResponse {
  id: string;
  name: string;
  weeks: any[];
  [key: string]: any;
}

export interface UserProfileResponse {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  website: string;
  social_links: any[];
  [key: string]: any;
}

export interface ClubResponse {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  members: any[];
  [key: string]: any;
}

/**
 * Client for interacting with the mobile API
 */
export class MobileApiClient {
  private token: string | null = null;
  private isInitialized = false;

  /**
   * Initialize the client with the user's session
   */
  async initialize(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      this.token = data.session?.access_token || null;
      this.isInitialized = !!this.token;
      console.log(`[MobileApiClient] Initialized: ${this.isInitialized}`);
      return this.isInitialized;
    } catch (error) {
      console.error('[MobileApiClient] Initialization error:', error);
      return false;
    }
  }

  /**
   * Set the authentication token manually
   */
  setToken(token: string): void {
    this.token = token;
    this.isInitialized = true;
  }

  /**
   * Get initialization status
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Make an authenticated request to the API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any
  ): Promise<T> {
    if (!this.token) {
      throw new Error('Not authenticated. Call initialize() first.');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      console.log(`[MobileApiClient] ${method} request to ${path}`);
      const response = await fetch(`${API_URL}${path}`, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[MobileApiClient] Request error for ${path}:`, error);
      throw error;
    }
  }

  // Workout Methods
  async getWorkouts(limit = 10, offset = 0): Promise<{ data: WorkoutResponse[] }> {
    return this.request<{ data: WorkoutResponse[] }>('GET', `/workouts?limit=${limit}&offset=${offset}`);
  }

  async getWorkout(id: string): Promise<{ data: WorkoutResponse }> {
    return this.request<{ data: WorkoutResponse }>('GET', `/workouts/${id}`);
  }

  async createWorkout(data: any): Promise<{ data: WorkoutResponse }> {
    return this.request<{ data: WorkoutResponse }>('POST', '/workouts', data);
  }

  async updateWorkout(id: string, updates: any): Promise<{ data: WorkoutResponse }> {
    return this.request<{ data: WorkoutResponse }>('PUT', `/workouts/${id}`, updates);
  }

  // Program Methods
  async getPrograms(limit = 10, offset = 0): Promise<{ data: ProgramResponse[] }> {
    return this.request<{ data: ProgramResponse[] }>('GET', `/programs?limit=${limit}&offset=${offset}`);
  }

  async getProgram(id: string): Promise<{ data: ProgramResponse }> {
    return this.request<{ data: ProgramResponse }>('GET', `/programs/${id}`);
  }

  async createProgram(data: any): Promise<{ data: ProgramResponse }> {
    return this.request<{ data: ProgramResponse }>('POST', '/programs', data);
  }

  async updateProgram(id: string, updates: any): Promise<{ data: ProgramResponse }> {
    return this.request<{ data: ProgramResponse }>('PUT', `/programs/${id}`, updates);
  }

  // User Profile Methods
  async getUserProfile(): Promise<{ data: UserProfileResponse }> {
    return this.request<{ data: UserProfileResponse }>('GET', `/user/profile`);
  }

  async updateUserProfile(updates: {
    display_name?: string;
    bio?: string;
    website?: string;
    social_links?: any[];
  }): Promise<{ data: UserProfileResponse }> {
    return this.request<{ data: UserProfileResponse }>('POST', `/user/profile`, updates);
  }

  // Club Methods
  async getUserClubs(): Promise<{ data: ClubResponse[] }> {
    return this.request<{ data: ClubResponse[] }>('GET', `/clubs`);
  }

  async getClubDetails(id: string): Promise<{ data: ClubResponse }> {
    return this.request<{ data: ClubResponse }>('GET', `/clubs/${id}`);
  }
  
  // Analytics Methods
  async getUserWorkoutStatistics(): Promise<{ data: any }> {
    return this.request<{ data: any }>('GET', '/analytics/workouts');
  }

  // Event Methods
  async getClubEvents(clubId: string): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('GET', `/clubs/${clubId}/events`);
  }

  // Content Sync Methods
  async syncUserContent(lastSyncTimestamp?: string): Promise<{ data: any }> {
    const queryParams = lastSyncTimestamp ? `?since=${lastSyncTimestamp}` : '';
    return this.request<{ data: any }>('GET', `/sync${queryParams}`);
  }
}

// Export a singleton instance
export const mobileApi = new MobileApiClient();
