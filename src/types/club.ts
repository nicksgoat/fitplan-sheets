
import { User } from '@supabase/supabase-js';
import { Profile } from './profile';
import { Workout } from './workout';

export type ClubType = 'fitness' | 'sports' | 'wellness' | 'nutrition' | 'other';
export type MembershipType = 'free' | 'premium';
export type MemberRole = 'admin' | 'moderator' | 'member';
export type MemberStatus = 'active' | 'pending' | 'inactive';
export type EventParticipationStatus = 'going' | 'maybe' | 'not_going';

export interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  club_type: ClubType;
  creator_id: string;
  membership_type: MembershipType;
  premium_price?: number;
  created_at: string;
  updated_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  membership_type: MembershipType;
  joined_at: string;
  expires_at?: string;
  profile?: Profile;
}

export interface ClubEvent {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: EventParticipationStatus;
  joined_at: string;
  profile?: Profile;
}

export interface ClubPost {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  workout_id?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  workout?: Workout;
  comments?: ClubPostComment[];
}

export interface ClubPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  profile?: Profile;
}
