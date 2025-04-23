
// Club types
export type ClubType = 'fitness' | 'sports' | 'wellness' | 'nutrition' | 'outdoor' | 'other';

// Membership type enum
export type MembershipType = 'free' | 'premium' | 'invite_only' | 'vip';

// Club member types
export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  membership_type: MembershipType;
  joined_at: string;
  expires_at?: string | null;
  premium_expires_at?: string | null;
  stripe_subscription_id?: string | null;
  profile?: {
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type MemberStatus = 'active' | 'pending' | 'inactive' | 'banned';

// Post related types
export interface ClubPost {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  profile?: {
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
  image_url?: string | null;
  workout_id?: string | null;
  workout?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  comments?: ClubPostComment[];
}

export interface ClubPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

// Channel related types
export interface ClubChannel {
  id: string;
  club_id: string;
  name: string;
  description?: string | null;
  type: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  event_id?: string | null;
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  profile?: {
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

// Event related types
export interface ClubEvent {
  id: string;
  club_id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  created_by: string;
  attendee_count?: number;
  category?: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: EventParticipationStatus;
  joined_at: string;
  created_at?: string;
  updated_at?: string;
  profile?: {
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

export type EventParticipationStatus = 'going' | 'interested' | 'not_going';

// Product related types
export interface ClubProduct {
  id: string;
  club_id: string;
  name: string;
  description?: string | null;
  price_amount: number;
  price_currency: string;
  product_type: ProductType;
  date_time?: string | null;
  location?: string | null;
  max_participants?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductType = 'event' | 'membership' | 'class' | 'merchandise' | 'other';

// Purchase related types
export interface ClubProductPurchase {
  id: string;
  product_id: string;
  user_id: string;
  amount_paid: number;
  currency: string;
  purchase_date: string;
  status: PurchaseStatus;
  refund_status?: RefundStatus;
  refund_reason?: string | null;
  refund_requested_at?: string | null;
  refund_processed_at?: string | null;
  stripe_session_id?: string | null;
  created_at: string;
  updated_at: string;
  product?: ClubProduct;
}

export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RefundStatus = 'requested' | 'processing' | 'completed' | 'denied';

// Subscription related types
export interface ClubSubscription {
  id: string;
  user_id: string;
  club_id: string;
  stripe_subscription_id?: string | null;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  plan_amount?: number | null;
  plan_currency?: string | null;
  plan_interval?: string | null;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

// Shared content types
export interface SharedWorkout {
  workout_id: string;
  workouts?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
}

// Add Club interface definition here to match the database exactly
export interface Club {
  id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  creator_id: string;
  club_type: ClubType;
  membership_type: MembershipType;
  premium_price?: number | null;
  created_at: string;
  updated_at: string;
  created_by?: string; // Adding this for compatibility with API responses
}
