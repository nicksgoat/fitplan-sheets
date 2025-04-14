
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

  // Workout Methods
  async getWorkouts(limit = 10, offset = 0) {
    return this.request('GET', `/workouts?limit=${limit}&offset=${offset}`);
  }

  async getWorkout(id: string) {
    return this.request('GET', `/workouts/${id}`);
  }

  // Program Methods
  async getPrograms(limit = 10, offset = 0) {
    return this.request('GET', `/programs?limit=${limit}&offset=${offset}`);
  }

  async getProgram(id: string) {
    return this.request('GET', `/programs/${id}`);
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
