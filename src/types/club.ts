
export interface Club {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  banner_url?: string;
  logo_url?: string;
  club_type: ClubType;
  membership_type: MembershipType;
  premium_price?: number;
  creator_id?: string; // Added for compatibility
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
  attendee_count: number;
  category?: string;
  participants?: EventParticipant[];
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  profile?: any;
  membership_type: MembershipType;
  premium_expires_at?: string;
  stripe_subscription_id?: string;
  expires_at?: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: EventParticipationStatus;
  created_at: string;
  updated_at?: string;
  profile?: any | null; // Make sure profile is optional
  joined_at?: string; // Added for compatibility
}

export type EventParticipationStatus = 'going' | 'maybe' | 'not_going';
export type MemberRole = 'admin' | 'moderator' | 'member' | 'owner';
export type MemberStatus = 'pending' | 'active' | 'banned';
export type MembershipType = 'free' | 'premium' | 'vip';
export type ClubType = 'fitness' | 'sports' | 'wellness' | 'nutrition' | 'other';

export interface ClubPost {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  profile?: any;
  image_url?: string;
  workout_id?: string;
  workout?: any;
  comments?: ClubPostComment[];
}

export interface ClubPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  profile?: any;
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  profile?: any;
}

// Add ClubChannel interface
export interface ClubChannel {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  type: string;
  created_at: string;
  created_by: string;
  is_default?: boolean;
  event_id?: string;
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
  is_active?: boolean;
}

export type ProductType = 'event' | 'coaching' | 'program' | 'other';

export interface ClubProductPurchase {
  id: string;
  product_id: string;
  user_id: string;
  amount_paid: number;
  currency: string;
  status: PurchaseStatus;
  purchase_date: string;
  created_at: string;
  updated_at?: string;
  stripe_session_id?: string;
  refund_status?: RefundStatus;
  refund_requested_at?: string;
  refund_processed_at?: string;
  refund_reason?: string;
  product?: ClubProduct;
}

export type PurchaseStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type RefundStatus = 'requested' | 'processing' | 'processed' | 'rejected';

export interface ClubSubscription {
  id: string;
  user_id: string;
  club_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
  plan_amount?: number;
  plan_currency?: string;
  plan_interval?: string;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired';
