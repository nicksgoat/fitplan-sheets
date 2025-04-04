
import { supabase } from '@/integrations/supabase/client';
import { 
  ClubProductPurchase, 
  ClubProduct, 
  ClubSubscription,
  PurchaseStatus,
  SubscriptionStatus,
  RefundStatus
} from '@/types/club';

/**
 * Get user's purchases
 */
export async function getUserPurchases(): Promise<ClubProductPurchase[]> {
  try {
    const { data, error } = await supabase
      .from('club_product_purchases')
      .select(`
        *,
        product:club_products(*)
      `)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    // Cast the data to the correct type
    return data.map(purchase => ({
      ...purchase,
      status: purchase.status as PurchaseStatus,
      refund_status: purchase.refund_status as RefundStatus | undefined,
      product: purchase.product as ClubProduct
    })) as ClubProductPurchase[];
  } catch (error) {
    console.error('Error getting user purchases:', error);
    return [];
  }
}

/**
 * Get user's subscriptions
 */
export async function getUserSubscriptions(): Promise<ClubSubscription[]> {
  try {
    // Use an RPC function to get subscriptions with proper typing
    const { data, error } = await supabase.rpc('get_user_subscriptions');
    
    if (error) throw error;
    
    // Cast the data to the correct type
    return (data || []).map(sub => ({
      ...sub,
      status: sub.status as SubscriptionStatus
    })) as ClubSubscription[];
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return [];
  }
}

/**
 * Get user's subscription for a club
 */
export async function getUserClubSubscription(
  userId: string, 
  clubId: string
): Promise<ClubSubscription | null> {
  try {
    // Use an RPC function to get a specific subscription with proper typing
    const { data, error } = await supabase.rpc('get_user_club_subscription', {
      user_id_param: userId,
      club_id_param: clubId
    });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return null;
    }

    // Cast the data to the correct type
    return {
      ...data[0],
      status: data[0].status as SubscriptionStatus
    } as ClubSubscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Request a refund for a product purchase
 */
export async function requestRefund(
  purchaseId: string,
  reason: string
): Promise<{ success: boolean; data?: ClubProductPurchase; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('refund-request', {
      body: { purchaseId, reason }
    });

    if (error) throw error;
    
    if (!data.success) {
      return { success: false, error: data.error || 'Unknown error requesting refund' };
    }

    return { 
      success: true, 
      data: {
        ...data.purchase,
        status: data.purchase.status as PurchaseStatus,
        refund_status: data.purchase.refund_status as RefundStatus
      } as ClubProductPurchase 
    };
  } catch (error) {
    console.error('Error requesting refund:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error requesting refund'
    };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<{ success: boolean; data?: ClubSubscription; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId, atPeriodEnd }
    });

    if (error) throw error;
    
    if (!data.success) {
      return { success: false, error: data.error || 'Unknown error canceling subscription' };
    }

    return { 
      success: true, 
      data: {
        ...data.subscription,
        status: data.subscription.status as SubscriptionStatus
      } as ClubSubscription
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error canceling subscription'
    };
  }
}

// Re-export all club-related functions that are imported in ClubContext.tsx
// This ensures that all the functions imported in ClubContext.tsx exist

export function fetchClubs() {
  return supabase.from('clubs').select('*');
}

export function fetchClubById(id: string) {
  return supabase.from('clubs').select('*').eq('id', id).single();
}

export function createClub(club: any) {
  return supabase.from('clubs').insert(club).select().single();
}

export function updateClub(id: string, updates: any) {
  return supabase.from('clubs').update(updates).eq('id', id).select().single();
}

export function deleteClub(id: string) {
  return supabase.from('clubs').delete().eq('id', id);
}

export function fetchClubMembers(clubId: string) {
  return supabase.from('club_members').select('*, profile:profiles(*)').eq('club_id', clubId);
}

export function joinClub(clubId: string, membershipType: string) {
  return supabase.from('club_members').insert({
    club_id: clubId,
    membership_type: membershipType
  }).select().single();
}

export function updateMemberRole(memberId: string, role: string) {
  return supabase.from('club_members').update({ role }).eq('id', memberId).select().single();
}

export function leaveClub(clubId: string) {
  return supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', supabase.auth.getUser());
}

export function getUserClubs() {
  return supabase.from('club_members').select('*, club:clubs(*)').eq('user_id', supabase.auth.getUser());
}

export function fetchClubEvents(clubId: string) {
  return supabase.from('club_events').select('*').eq('club_id', clubId);
}

export function createEvent(event: any) {
  return supabase.from('club_events').insert(event).select().single();
}

export function updateEvent(id: string, updates: any) {
  return supabase.from('club_events').update(updates).eq('id', id).select().single();
}

export function deleteEvent(id: string) {
  return supabase.from('club_events').delete().eq('id', id);
}

export function respondToEvent(eventId: string, status: string) {
  return supabase.from('event_participants').upsert({
    event_id: eventId,
    status
  }).select().single();
}

export function fetchEventParticipants(eventId: string) {
  return supabase.from('event_participants').select('*, profile:profiles(*)').eq('event_id', eventId);
}

export function fetchClubPosts(clubId: string) {
  return supabase.from('club_posts').select('*, profile:profiles(*), workout:workouts(*)').eq('club_id', clubId);
}

export function createPost(post: any) {
  return supabase.from('club_posts').insert(post).select().single();
}

export function deletePost(id: string) {
  return supabase.from('club_posts').delete().eq('id', id);
}

export function fetchPostComments(postId: string) {
  return supabase.from('club_post_comments').select('*, profile:profiles(*)').eq('post_id', postId);
}

export function createComment(comment: any) {
  return supabase.from('club_post_comments').insert(comment).select().single();
}

export function deleteComment(id: string) {
  return supabase.from('club_post_comments').delete().eq('id', id);
}

export function fetchClubMessages(clubId: string) {
  return supabase.from('club_messages').select('*, profile:profiles(*)').eq('club_id', clubId);
}

export function sendMessage(message: any) {
  return supabase.from('club_messages').insert(message).select().single();
}

export function pinMessage(id: string, isPinned: boolean) {
  return supabase.from('club_messages').update({ is_pinned: isPinned }).eq('id', id).select().single();
}

export function subscribeToClubMessages(clubId: string, callback: (message: any) => void) {
  return supabase.channel(`club-${clubId}`).subscribe(callback);
}

export function updateMembership(clubId: string, membershipType: string) {
  return supabase.from('club_members').update({ membership_type: membershipType })
    .eq('club_id', clubId).eq('user_id', supabase.auth.getUser())
    .select().single();
}

export function fetchClubProducts(clubId: string) {
  return supabase.from('club_products').select('*').eq('club_id', clubId);
}

export function purchaseClubProduct(productId: string) {
  // This is a placeholder, actual purchase will likely use Stripe
  return supabase.from('club_product_purchases').insert({
    product_id: productId
  }).select().single();
}
