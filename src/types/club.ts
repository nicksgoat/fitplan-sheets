
import { Profile } from './profile';
import { Workout } from './workout';

export type ClubType = 'fitness' | 'sports' | 'wellness' | 'nutrition' | 'other';
export type MembershipType = 'free' | 'premium' | 'vip';
export type MemberRole = 'admin' | 'moderator' | 'member';
export type MemberStatus = 'active' | 'pending' | 'inactive';
export type EventParticipationStatus = 'going' | 'maybe' | 'not_going';
export type ProductType = 'event' | 'coaching' | 'program' | 'other';
export type PurchaseStatus = 'pending' | 'completed' | 'refunded' | 'cancelled';
export type RefundStatus = 'requested' | 'approved' | 'rejected' | 'processed';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';

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
  premium_expires_at?: string;
  stripe_subscription_id?: string;
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

export interface ClubProduct {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  price_amount: number;
  price_currency: string;
  product_type: ProductType;
  max_participants?: number;
  date_time?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubProductPurchase {
  id: string;
  product_id: string;
  user_id: string;
  purchase_date: string;
  amount_paid: number;
  currency: string;
  stripe_session_id?: string;
  status: PurchaseStatus;
  created_at: string;
  updated_at: string;
  refund_status?: RefundStatus;
  refund_requested_at?: string;
  refund_processed_at?: string;
  refund_reason?: string;
  product?: ClubProduct;
}

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
