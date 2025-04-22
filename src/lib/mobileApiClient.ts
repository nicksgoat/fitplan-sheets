
import { supabase } from '@/integrations/supabase/client';

// Base URL for the API - using a direct URL instead of process.env
// The Supabase URL is hardcoded here since we can't use process.env in the browser
const API_URL = 'https://cmzhdyiadvuuwypocxjv.supabase.co/functions/v1/api';

// Define return types for API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface Program {
  id: string;
  name: string;
  is_public?: boolean;
  weeks?: Week[];
}

export interface Week {
  id: string;
  name: string;
  program_id: string;
  order_num: number;
  workouts?: Workout[];
}

export interface Workout {
  id: string;
  name: string;
  week_id: string;
  day_num: number;
}

export interface UserProfile {
  id: string;
  display_name?: string;
  bio?: string;
  website?: string;
  social_links?: any[];
  avatar_url?: string;
}

export interface ClubInfo {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  member_count?: number;
}

export interface MediaUploadResult {
  url: string;
  path: string;
  type: 'workout' | 'profile' | 'exercise';
  related_id?: string;
}

/**
 * Client for interacting with the mobile API
 */
export class MobileApiClient {
  private token: string | null = null;

  /**
   * Initialize the client with the user's session
   */
  async initialize() {
    const { data } = await supabase.auth.getSession();
    this.token = data.session?.access_token || null;
    return !!this.token;
  }

  /**
   * Set the authentication token manually
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Make an authenticated request to the API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any
  ): Promise<ApiResponse<T>> {
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

    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    return data;
  }

  /**
   * Upload a file to the API
   */
  async uploadFile(file: File, type: 'workout' | 'profile' | 'exercise', relatedId?: string): Promise<ApiResponse<MediaUploadResult>> {
    if (!this.token) {
      throw new Error('Not authenticated. Call initialize() first.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (relatedId) formData.append('relatedId', relatedId);
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.token}`,
    };

    const options: RequestInit = {
      method: 'POST',
      headers,
      body: formData
    };

    const response = await fetch(`${API_URL}/media/upload`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    return data;
  }

  // Workout Methods
  async getWorkouts(limit = 10, offset = 0): Promise<ApiResponse<Workout[]>> {
    return this.request<Workout[]>('GET', `/workouts?limit=${limit}&offset=${offset}`);
  }

  async getWorkout(id: string): Promise<ApiResponse<Workout>> {
    return this.request<Workout>('GET', `/workouts/${id}`);
  }
  
  async createWorkout(data: { name: string, week_id: string, day_num?: number }): Promise<ApiResponse<Workout>> {
    return this.request<Workout>('POST', '/workouts', data);
  }
  
  async updateWorkout(id: string, data: { name?: string, day_num?: number }): Promise<ApiResponse<Workout>> {
    return this.request<Workout>('PUT', `/workouts/${id}`, data);
  }
  
  async deleteWorkout(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('DELETE', `/workouts/${id}`);
  }

  // Program Methods
  async getPrograms(limit = 10, offset = 0): Promise<ApiResponse<Program[]>> {
    return this.request<Program[]>('GET', `/programs?limit=${limit}&offset=${offset}`);
  }

  async getProgram(id: string): Promise<ApiResponse<Program>> {
    return this.request<Program>('GET', `/programs/${id}`);
  }
  
  async createProgram(data: { name: string, is_public?: boolean }): Promise<ApiResponse<Program>> {
    return this.request<Program>('POST', '/programs', data);
  }
  
  async updateProgram(id: string, data: { name?: string, is_public?: boolean }): Promise<ApiResponse<Program>> {
    return this.request<Program>('PUT', `/programs/${id}`, data);
  }
  
  async deleteProgram(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('DELETE', `/programs/${id}`);
  }

  // User Profile Methods
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('GET', `/user/profile`);
  }

  async updateUserProfile(updates: {
    display_name?: string;
    bio?: string;
    website?: string;
    social_links?: any[];
  }): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('POST', `/user/profile`, updates);
  }

  // Club Methods
  async getUserClubs(): Promise<ApiResponse<ClubInfo[]>> {
    return this.request<ClubInfo[]>('GET', `/clubs`);
  }

  async getClubDetails(id: string): Promise<ApiResponse<ClubInfo>> {
    return this.request<ClubInfo>('GET', `/clubs/${id}`);
  }
}

// Export a singleton instance
export const mobileApi = new MobileApiClient();
