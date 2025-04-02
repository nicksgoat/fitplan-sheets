
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

  // Client-side aliases for convenience
  get logoUrl(): string | undefined { return this.logo_url; }
  get bannerUrl(): string | undefined { return this.banner_url; }
  get clubType(): ClubType { return this.club_type; }
  get creatorId(): string { return this.creator_id; }
  get membershipType(): MembershipType { return this.membership_type; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
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

  // Client-side aliases
  get clubId(): string { return this.club_id; }
  get userId(): string { return this.user_id; }
  get membershipType(): MembershipType { return this.membership_type; }
  get joinedAt(): string { return this.joined_at; }
  get expiresAt(): string | undefined { return this.expires_at; }
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

  // Client-side aliases
  get clubId(): string { return this.club_id; }
  get startTime(): string { return this.start_time; }
  get endTime(): string { return this.end_time; }
  get imageUrl(): string | undefined { return this.image_url; }
  get createdBy(): string { return this.created_by; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: EventParticipationStatus;
  joined_at: string;
  profile?: Profile;

  // Client-side aliases
  get eventId(): string { return this.event_id; }
  get userId(): string { return this.user_id; }
  get joinedAt(): string { return this.joined_at; }
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

  // Client-side aliases
  get clubId(): string { return this.club_id; }
  get userId(): string { return this.user_id; }
  get workoutId(): string | undefined { return this.workout_id; }
  get imageUrl(): string | undefined { return this.image_url; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
}

export interface ClubPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;

  // Client-side aliases
  get postId(): string { return this.post_id; }
  get userId(): string { return this.user_id; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  profile?: Profile;

  // Client-side aliases
  get clubId(): string { return this.club_id; }
  get userId(): string { return this.user_id; }
  get createdAt(): string { return this.created_at; }
  get isPinned(): boolean { return this.is_pinned; }
}
