
export interface Club {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  banner_url?: string;
  logo_url?: string;
  club_type: string;
  membership_type: 'free' | 'premium';
  premium_price?: number;
}

export interface ClubEvent {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_at: string;
  created_by: string;
  image_url?: string;
  attendee_count: number; // Added for EventCard
  category?: string; // Added for EventCard and EventsList
  participants?: EventParticipant[]; // Optional array of participants
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: MemberRole;
  status: 'pending' | 'active' | 'banned';
  joined_at: string;
  profile?: any; // User profile information
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: EventParticipationStatus;
  created_at: string;
  updated_at?: string;
  profile?: any; // User profile information
}

export type EventParticipationStatus = 'going' | 'maybe' | 'not_going';
export type MemberRole = 'admin' | 'moderator' | 'member';

export interface ClubPost {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  profile?: any; // User profile information
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  profile?: any; // User profile information
}

export interface ClubProduct {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  price_amount: number;
  price_currency: string;
  product_type: ProductType;
  created_at: string;
  updated_at?: string;
  max_participants?: number;
  date_time?: string;
  location?: string;
  image_url?: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
}

export type ProductType = 'event' | 'coaching' | 'program' | 'other';
