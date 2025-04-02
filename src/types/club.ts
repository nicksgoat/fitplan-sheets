
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
  logoUrl?: string;
  bannerUrl?: string;
  clubType: ClubType;
  creatorId: string;
  membershipType: MembershipType;
  premiumPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  membershipType: MembershipType;
  joinedAt: string;
  expiresAt?: string;
  profile?: Profile;
}

export interface ClubEvent {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants?: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: EventParticipationStatus;
  joinedAt: string;
  profile?: Profile;
}

export interface ClubPost {
  id: string;
  clubId: string;
  userId: string;
  content: string;
  workoutId?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
  workout?: Workout;
  comments?: ClubPostComment[];
}

export interface ClubPostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface ClubMessage {
  id: string;
  clubId: string;
  userId: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
  profile?: Profile;
}
