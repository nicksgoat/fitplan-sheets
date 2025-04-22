
import { supabase } from '@/integrations/supabase/client';

// Base URL for the API
const API_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmzhdyiadvuuwypocxjv.supabase.co'}/functions/v1/api`;

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
  async uploadFile(file: File, type: 'workout' | 'profile' | 'exercise', relatedId?: string) {
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
  async getWorkouts(limit = 10, offset = 0) {
    return this.request('GET', `/workouts?limit=${limit}&offset=${offset}`);
  }

  async getWorkout(id: string) {
    return this.request('GET', `/workouts/${id}`);
  }
  
  async createWorkout(data: { name: string, week_id: string, day_num?: number }) {
    return this.request('POST', '/workouts', data);
  }
  
  async updateWorkout(id: string, data: { name?: string, day_num?: number }) {
    return this.request('PUT', `/workouts/${id}`, data);
  }
  
  async deleteWorkout(id: string) {
    return this.request('DELETE', `/workouts/${id}`);
  }

  // Program Methods
  async getPrograms(limit = 10, offset = 0) {
    return this.request('GET', `/programs?limit=${limit}&offset=${offset}`);
  }

  async getProgram(id: string) {
    return this.request('GET', `/programs/${id}`);
  }
  
  async createProgram(data: { name: string, is_public?: boolean }) {
    return this.request('POST', '/programs', data);
  }
  
  async updateProgram(id: string, data: { name?: string, is_public?: boolean }) {
    return this.request('PUT', `/programs/${id}`, data);
  }
  
  async deleteProgram(id: string) {
    return this.request('DELETE', `/programs/${id}`);
  }

  // User Profile Methods
  async getUserProfile() {
    return this.request('GET', `/user/profile`);
  }

  async updateUserProfile(updates: {
    display_name?: string;
    bio?: string;
    website?: string;
    social_links?: any[];
  }) {
    return this.request('POST', `/user/profile`, updates);
  }

  // Club Methods
  async getUserClubs() {
    return this.request('GET', `/clubs`);
  }

  async getClubDetails(id: string) {
    return this.request('GET', `/clubs/${id}`);
  }
}

// Export a singleton instance
export const mobileApi = new MobileApiClient();
