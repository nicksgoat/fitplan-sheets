
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

// Club-related functions that are imported in ClubContext.tsx
export async function fetchClubs() {
  try {
    const { data, error } = await supabase.from('clubs').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return [];
  }
}

export async function fetchClubById(id: string) {
  try {
    const { data, error } = await supabase.from('clubs').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching club by id ${id}:`, error);
    return null;
  }
}

export async function createClub(club: any) {
  try {
    const { data, error } = await supabase.from('clubs').insert(club).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
}

export async function updateClub(id: string, updates: any) {
  try {
    const { data, error } = await supabase.from('clubs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating club ${id}:`, error);
    throw error;
  }
}

export async function deleteClub(id: string) {
  try {
    const { error } = await supabase.from('clubs').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting club ${id}:`, error);
    throw error;
  }
}

export async function fetchClubMembers(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .select('*, profile:profiles(*)')
      .eq('club_id', clubId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching club members for ${clubId}:`, error);
    return [];
  }
}

export async function joinClub(clubId: string, membershipType: string) {
  try {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: user.data.user?.id,
        membership_type: membershipType as "free" | "premium" | "vip",
        role: 'member',
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error joining club ${clubId}:`, error);
    throw error;
  }
}

export async function updateMemberRole(memberId: string, role: string) {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating member role ${memberId}:`, error);
    throw error;
  }
}

export async function leaveClub(clubId: string) {
  try {
    const user = await supabase.auth.getUser();
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', user.data.user?.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error leaving club ${clubId}:`, error);
    throw error;
  }
}

export async function getUserClubs() {
  try {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('club_members')
      .select('*, club:clubs(*)')
      .eq('user_id', user.data.user?.id);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user clubs:', error);
    return [];
  }
}

export async function fetchClubEvents(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .select('*')
      .eq('club_id', clubId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching club events for ${clubId}:`, error);
    return [];
  }
}

export async function createEvent(event: any) {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function updateEvent(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating event ${id}:`, error);
    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    const { error } = await supabase
      .from('club_events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting event ${id}:`, error);
    throw error;
  }
}

export async function respondToEvent(eventId: string, status: string) {
  try {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('event_participants')
      .upsert({
        event_id: eventId,
        user_id: user.data.user?.id,
        status
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error responding to event ${eventId}:`, error);
    throw error;
  }
}

export async function fetchEventParticipants(eventId: string) {
  try {
    const { data, error } = await supabase
      .from('event_participants')
      .select('*, profile:profiles(*)')
      .eq('event_id', eventId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching event participants for ${eventId}:`, error);
    return [];
  }
}

export async function fetchClubPosts(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_posts')
      .select('*, profile:profiles(*), workout:workouts(*)')
      .eq('club_id', clubId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching club posts for ${clubId}:`, error);
    return [];
  }
}

export async function createPost(post: any) {
  try {
    const { data, error } = await supabase
      .from('club_posts')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function deletePost(id: string) {
  try {
    const { error } = await supabase
      .from('club_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw error;
  }
}

export async function fetchPostComments(postId: string) {
  try {
    const { data, error } = await supabase
      .from('club_post_comments')
      .select('*, profile:profiles(*)')
      .eq('post_id', postId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching post comments for ${postId}:`, error);
    return [];
  }
}

export async function createComment(comment: any) {
  try {
    const { data, error } = await supabase
      .from('club_post_comments')
      .insert(comment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function deleteComment(id: string) {
  try {
    const { error } = await supabase
      .from('club_post_comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting comment ${id}:`, error);
    throw error;
  }
}

export async function fetchClubMessages(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .select('*, profile:profiles(*)')
      .eq('club_id', clubId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching club messages for ${clubId}:`, error);
    return [];
  }
}

export async function sendMessage(message: any) {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function pinMessage(id: string, isPinned: boolean) {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .update({ is_pinned: isPinned })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error pinning/unpinning message ${id}:`, error);
    throw error;
  }
}

export function subscribeToClubMessages(clubId: string, callback: (message: any) => void) {
  const channel = supabase.channel(`club-${clubId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'club_messages',
      filter: `club_id=eq.${clubId}` 
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function updateMembership(clubId: string, membershipType: "free" | "premium" | "vip") {
  try {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('club_members')
      .update({ membership_type: membershipType })
      .eq('club_id', clubId)
      .eq('user_id', user.data.user?.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating membership for club ${clubId}:`, error);
    throw error;
  }
}

export async function fetchClubProducts(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .select('*')
      .eq('club_id', clubId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching club products for ${clubId}:`, error);
    return [];
  }
}

export async function purchaseClubProduct(productId: string) {
  try {
    const user = await supabase.auth.getUser();
    const { data: product } = await supabase
      .from('club_products')
      .select('*')
      .eq('id', productId)
      .single();

    const { data, error } = await supabase
      .from('club_product_purchases')
      .insert({
        product_id: productId,
        user_id: user.data.user?.id,
        amount_paid: product.price_amount,
        currency: product.price_currency,
        status: 'completed' as PurchaseStatus
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error purchasing product ${productId}:`, error);
    throw error;
  }
}
