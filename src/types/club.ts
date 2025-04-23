
// Club types
export interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  creator_id: string;
  club_type: ClubType;
  membership_type: MembershipType;
  premium_price?: number;
  created_at: string;
  updated_at: string;
}

// Club type enum
export type ClubType = 'fitness' | 'sports' | 'wellness' | 'nutrition' | 'outdoor' | 'other';

// Membership type enum
export type MembershipType = 'free' | 'premium' | 'invite_only';

// Club member types
export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  membership_type: MembershipType;
  joined_at: string;
  expires_at?: string;
  premium_expires_at?: string;
  stripe_subscription_id?: string;
  profile?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
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
    display_name?: string;
    avatar_url?: string;
  };
  image_url?: string;
  workout_id?: string;
  workout?: {
    id: string;
    name: string;
    description?: string;
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
    display_name?: string;
    avatar_url?: string;
  };
}

// Channel related types
export interface ClubChannel {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  type: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  event_id?: string;
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

// Event related types
export interface ClubEvent {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
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
  profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export type EventParticipationStatus = 'going' | 'interested' | 'not_going';

// Product related types
export interface ClubProduct {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  price_amount: number;
  price_currency: string;
  product_type: ProductType;
  date_time?: string;
  location?: string;
  max_participants?: number;
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
  refund_reason?: string;
  refund_requested_at?: string;
  refund_processed_at?: string;
  stripe_session_id?: string;
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
  stripe_subscription_id?: string;
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

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

// Shared content types
export interface SharedWorkout {
  workout_id: string;
  workouts?: {
    id: string;
    name: string;
    description?: string;
  } | null;
}
