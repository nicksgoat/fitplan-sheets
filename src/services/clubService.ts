import { supabase } from '@/integrations/supabase/client';
import { 
  ClubProductPurchase, 
  ClubProduct, 
  ClubSubscription,
  PurchaseStatus,
  SubscriptionStatus,
  RefundStatus,
  ProductType,
  MemberRole,
  EventParticipationStatus,
  MemberStatus,
  MembershipType,
  ClubEvent,
  EventParticipant,
  ClubMember,
  Club,
  ClubPost,
  ClubPostComment,
  ClubMessage
} from '@/types/club';
import { Profile } from '@/types/profile';
import { safelyGetProfile } from '@/utils/profileUtils';
import { Workout } from '@/types/workout';

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
    if (!data) return [];

    // Cast the data to the correct type
    return data.map(purchase => ({
      ...purchase,
      status: purchase.status as PurchaseStatus,
      refund_status: purchase.refund_status as RefundStatus | undefined,
      product: purchase.product ? ({
        ...purchase.product,
        product_type: purchase.product.product_type as ProductType
      } as ClubProduct) : undefined
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
    console.log("Getting user subscriptions");
    // Use the edge function
    const { data, error } = await supabase.functions.invoke('get-subscription-rpcs', {
      body: {
        action: 'get_user_subscriptions'
      }
    });
    
    if (error) {
      console.error("Error invoking edge function:", error);
      throw error;
    }
    
    console.log("Edge function response:", data);
    
    if (!data || !Array.isArray(data)) return [];
    
    // Cast the data to the correct type with proper mapping
    return data.map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      club_id: sub.club_id,
      stripe_subscription_id: sub.stripe_subscription_id,
      status: sub.status as SubscriptionStatus,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at,
      plan_amount: sub.plan_amount,
      plan_currency: sub.plan_currency,
      plan_interval: sub.plan_interval
    }));
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
    // Use the edge function
    const { data, error } = await supabase.functions.invoke('get-subscription-rpcs', {
      body: {
        action: 'get_user_club_subscription',
        club_id: clubId
      }
    });

    if (error) throw error;
    
    // Handle empty response
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Cast the data to the correct type
    const subscription: ClubSubscription = {
      id: data[0].id,
      user_id: data[0].user_id,
      club_id: data[0].club_id,
      stripe_subscription_id: data[0].stripe_subscription_id,
      status: data[0].status as SubscriptionStatus,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
      current_period_start: data[0].current_period_start,
      current_period_end: data[0].current_period_end,
      cancel_at_period_end: data[0].cancel_at_period_end,
      canceled_at: data[0].canceled_at,
      plan_amount: data[0].plan_amount,
      plan_currency: data[0].plan_currency,
      plan_interval: data[0].plan_interval
    };

    return subscription;
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

// Club-related functions
export async function fetchClubs(): Promise<Club[]> {
  try {
    const { data, error } = await supabase.from('clubs').select('*');
    if (error) throw error;
    if (!data) return [];
    
    return data.map(club => ({
      ...club,
      club_type: club.club_type as ClubType,
      membership_type: club.membership_type as MembershipType
    })) as Club[];
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return [];
  }
}

export async function fetchClubById(id: string): Promise<Club | null> {
  try {
    const { data, error } = await supabase.from('clubs').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return null;
    
    return {
      ...data,
      club_type: data.club_type as ClubType,
      membership_type: data.membership_type as MembershipType
    } as Club;
  } catch (error) {
    console.error(`Error fetching club by id ${id}:`, error);
    return null;
  }
}

export async function createClub(clubData: { 
  name: string; 
  description?: string; 
  club_type?: ClubType; 
  membership_type?: MembershipType;
  premium_price?: number;
  creator_id: string;
  logo_url?: string;
  banner_url?: string;
}): Promise<Club> {
  try {
    // Start a Supabase transaction for creating both the club and adding the creator as an admin member
    const { data, error } = await supabase.from('clubs').insert({
      name: clubData.name,
      description: clubData.description,
      club_type: clubData.club_type,
      membership_type: clubData.membership_type,
      premium_price: clubData.premium_price,
      creator_id: clubData.creator_id,
      logo_url: clubData.logo_url,
      banner_url: clubData.banner_url
    }).select().single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after club creation');
    
    // Now add the creator as an admin member to the club
    const { error: memberError } = await supabase.from('club_members').insert({
      club_id: data.id,
      user_id: clubData.creator_id,
      role: 'admin' as MemberRole,
      status: 'active' as MemberStatus,
      membership_type: data.membership_type || 'free' as MembershipType
    });
    
    if (memberError) {
      console.error('Error adding creator as club member:', memberError);
      // If we fail to add the user as a member, we don't want to fail the whole operation
      // since the club was already created successfully
    }
    
    return {
      ...data,
      club_type: data.club_type as ClubType,
      membership_type: data.membership_type as MembershipType
    } as Club;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
}

export async function updateClub(id: string, updates: { 
  name?: string; 
  description?: string; 
  club_type?: ClubType; 
  membership_type?: MembershipType;
  premium_price?: number;
  logo_url?: string;
  banner_url?: string;
}): Promise<Club> {
  try {
    const { data, error } = await supabase.from('clubs').update({
      name: updates.name,
      description: updates.description,
      club_type: updates.club_type,
      membership_type: updates.membership_type,
      premium_price: updates.premium_price,
      logo_url: updates.logo_url,
      banner_url: updates.banner_url
    }).eq('id', id).select().single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after club update');
    
    return {
      ...data,
      club_type: data.club_type as ClubType,
      membership_type: data.membership_type as MembershipType
    } as Club;
  } catch (error) {
    console.error(`Error updating club ${id}:`, error);
    throw error;
  }
}

export async function deleteClub(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('clubs').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting club ${id}:`, error);
    throw error;
  }
}

export async function fetchClubMembers(clubId: string): Promise<ClubMember[]> {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .select('*, profile:profiles(*)')
      .eq('club_id', clubId);
    
    if (error) throw error;
    if (!data) return [];
    
    // Properly cast the roles and status and handle profile errors
    return data.map(member => ({
      ...member,
      role: member.role as MemberRole,
      status: member.status as MemberStatus,
      membership_type: member.membership_type as MembershipType,
      // Check if profile is valid or an error, if error return undefined
      profile: safelyGetProfile(member.profile, member.user_id)
    } as ClubMember));
  } catch (error) {
    console.error(`Error fetching club members for ${clubId}:`, error);
    return [];
  }
}

export async function joinClub(clubId: string, membershipType: MembershipType = 'free'): Promise<ClubMember> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('No authenticated user');
    
    // Use the edge function to bypass RLS policies
    const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
      body: {
        sqlName: 'join_club',
        params: {
          club_id: clubId,
          user_id: userData.user.id,
          membership_type: membershipType
        }
      }
    });
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after joining club');
    
    return {
      ...data,
      role: data.role as MemberRole,
      status: data.status as MemberStatus,
      membership_type: data.membership_type as MembershipType
    } as ClubMember;
  } catch (error) {
    console.error(`Error joining club ${clubId}:`, error);
    throw error;
  }
}

// Add a new function to check club membership that uses the edge function
export async function checkClubMembership(clubId: string): Promise<{ isMember: boolean, member?: ClubMember }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { isMember: false };
    }
    
    // Use the edge function to bypass RLS policies
    const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
      body: {
        sqlName: 'check_club_member',
        params: {
          club_id: clubId,
          user_id: userData.user.id
        }
      }
    });
    
    if (error) throw error;
    
    if (data?.is_member && data.member_data) {
      return { 
        isMember: true, 
        member: {
          ...data.member_data,
          role: data.member_data.role as MemberRole,
          status: data.member_data.status as MemberStatus,
          membership_type: data.member_data.membership_type as MembershipType
        } as ClubMember
      };
    }
    
    return { isMember: false };
  } catch (error) {
    console.error(`Error checking club membership for ${clubId}:`, error);
    return { isMember: false };
  }
}

export async function updateMemberRole(memberId: string, role: MemberRole): Promise<ClubMember> {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after role update');
    
    return {
      ...data,
      role: data.role as MemberRole,
      status: data.status as MemberStatus,
      membership_type: data.membership_type as MembershipType
    } as ClubMember;
  } catch (error) {
    console.error(`Error updating member role ${memberId}:`, error);
    throw error;
  }
}

export async function leaveClub(clubId: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('No authenticated user');
    
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userData.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error leaving club ${clubId}:`, error);
    throw error;
  }
}

export async function getUserClubs(): Promise<{ membership: ClubMember; club: Club }[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error('No authenticated user found in getUserClubs');
      throw new Error('No authenticated user');
    }
    
    console.log(`Getting clubs for user ${userData.user.id}`);
    
    // First get the club memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('club_members')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (membershipError) {
      console.error('Error fetching club memberships:', membershipError);
      throw membershipError;
    }
    
    if (!memberships || memberships.length === 0) {
      console.log('No club memberships found');
      return [];
    }
    
    console.log(`Found ${memberships.length} club memberships`);
    
    // Now get the club details for each membership
    const clubIds = memberships.map(m => m.club_id);
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .in('id', clubIds);
    
    if (clubsError) {
      console.error('Error fetching clubs:', clubsError);
      throw clubsError;
    }
    
    if (!clubs || clubs.length === 0) {
      console.log('No clubs found');
      return [];
    }
    
    console.log(`Found ${clubs.length} clubs`);
    
    // Join the data
    return memberships.map(membership => {
      const club = clubs.find(c => c.id === membership.club_id);
      if (!club) {
        console.error(`Club not found for membership ${membership.id}`);
        return null;
      }
      
      return {
        membership: {
          ...membership,
          role: membership.role as MemberRole,
          status: membership.status as MemberStatus,
          membership_type: membership.membership_type as MembershipType
        } as ClubMember,
        club: {
          ...club,
          club_type: club.club_type as ClubType,
          membership_type: club.membership_type as MembershipType
        } as Club
      };
    }).filter(Boolean) as { membership: ClubMember; club: Club }[];
  } catch (error) {
    console.error('Error getting user clubs:', error);
    return [];
  }
}

export async function fetchClubEvents(clubId: string): Promise<ClubEvent[]> {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .select('*')
      .eq('club_id', clubId);
    
    if (error) throw error;
    if (!data) return [];
    
    return data as ClubEvent[];
  } catch (error) {
    console.error(`Error fetching club events for ${clubId}:`, error);
    return [];
  }
}

export async function createEvent(event: { 
  club_id: string;
  name: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  image_url?: string;
  created_by: string;
}): Promise<ClubEvent> {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .insert({
        club_id: event.club_id,
        name: event.name,
        description: event.description,
        location: event.location,
        start_time: event.start_time,
        end_time: event.end_time,
        image_url: event.image_url,
        created_by: event.created_by
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after creating event');
    
    return data as ClubEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function updateEvent(id: string, updates: { 
  name?: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
}): Promise<ClubEvent> {
  try {
    const eventUpdates: Record<string, any> = {};
    
    // Only include fields that are actually being updated
    if (updates.name) eventUpdates.name = updates.name;
    if (updates.description !== undefined) eventUpdates.description = updates.description;
    if (updates.location !== undefined) eventUpdates.location = updates.location;
    if (updates.start_time) eventUpdates.start_time = updates.start_time;
    if (updates.end_time) eventUpdates.end_time = updates.end_time;
    if (updates.image_url !== undefined) eventUpdates.image_url = updates.image_url;

    const { data, error } = await supabase
      .from('club_events')
      .update(eventUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after updating event');
    
    return data as ClubEvent;
  } catch (error) {
    console.error(`Error updating event ${id}:`, error);
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
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

export async function respondToEvent(eventId: string, status: EventParticipationStatus): Promise<EventParticipant> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('No authenticated user');
    
    const { data, error } = await supabase
      .from('event_participants')
      .upsert({
        event_id: eventId,
        user_id: userData.user.id,
        status
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after responding to event');
    
    return {
      ...data,
      status: data.status as EventParticipationStatus
    } as EventParticipant;
  } catch (error) {
    console.error(`Error responding to event ${eventId}:`, error);
    throw error;
  }
}

export async function fetchEventParticipants(eventId: string): Promise<EventParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('event_participants')
      .select('*, profile:profiles(*)')
      .eq('event_id', eventId);
    
    if (error) throw error;
    if (!data) return [];
    
    return data.map(participant => ({
      ...participant,
      status: participant.status as EventParticipationStatus,
      profile: safelyGetProfile(participant.profile, participant.user_id)
    } as EventParticipant));
  } catch (error) {
    console.error(`Error fetching event participants for ${eventId}:`, error);
    return [];
  }
}

export async function fetchClubPosts(clubId: string): Promise<ClubPost[]> {
  try {
    const { data, error } = await supabase
      .from('club_posts')
      .select('*, profile:profiles(*), workout:workouts(*)')
      .eq('club_id', clubId);
    
    if (error) throw error;
    if (!data) return [];
    
    // Handle potentially missing profile/workout relationships
    return data.map(post => {
      // Safely handle profile data with the utility function
      const validProfile = safelyGetProfile(post.profile, post.user_id);
      
      // Only add workout if it's valid (not an error object)
      let workout: Workout | undefined = undefined;
      
      // Fixed type checking to handle null, undefined, and error cases
      if (post.workout && 
          typeof post.workout === 'object' && 
          post.workout !== null) {
        // Check if workout is an error object by safely checking for error property
        const workoutObj = post.workout as Record<string, unknown>;
        if (!('error' in workoutObj)) {
          workout = post.workout as Workout;
        }
      }
      
      return {
        ...post,
        profile: validProfile,
        workout,
        comments: [] // Initialize with empty comments array
      } as ClubPost;
    });
  } catch (error) {
    console.error(`Error fetching club posts for ${clubId}:`, error);
    return [];
  }
}

export async function createPost(post: {
  club_id: string;
  content: string;
  user_id: string;
  image_url?: string;
  workout_id?: string;
}): Promise<ClubPost> {
  try {
    const postData = {
      club_id: post.club_id,
      content: post.content,
      user_id: post.user_id,
      image_url: post.image_url,
      workout_id: post.workout_id
    };
    
    const { data, error } = await supabase
      .from('club_posts')
      .insert(postData)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after creating post');
    
    return {
      ...data,
      comments: []
    } as ClubPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function deletePost(id: string): Promise<boolean> {
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

export async function fetchPostComments(postId: string): Promise<ClubPostComment[]> {
  try {
    const { data, error } = await supabase
      .from('club_post_comments')
      .select('*, profile:profiles(*)')
      .eq('post_id', postId);
    
    if (error) throw error;
    if (!data) return [];
    
    // Handle potentially missing profile relationship
    return data.map(comment => ({
      ...comment,
      profile: safelyGetProfile(comment.profile, comment.user_id)
    } as ClubPostComment));
  } catch (error) {
    console.error(`Error fetching post comments for ${postId}:`, error);
    return [];
  }
}

export async function createComment(comment: {
  post_id: string;
  user_id: string;
  content: string;
}): Promise<ClubPostComment> {
  try {
    const commentData = {
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content
    };
    
    const { data, error } = await supabase
      .from('club_post_comments')
      .insert(commentData)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after creating comment');
    
    return data as ClubPostComment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function deleteComment(id: string): Promise<boolean> {
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

export async function fetchClubMessages(clubId: string): Promise<ClubMessage[]> {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .select('*, profile:profiles(*)')
      .eq('club_id', clubId);
    
    if (error) throw error;
    if (!data) return [];
    
    // Handle potentially missing profile relationship
    return data.map(message => ({
      ...message,
      profile: safelyGetProfile(message.profile, message.user_id)
    } as ClubMessage));
  } catch (error) {
    console.error(`Error fetching club messages for ${clubId}:`, error);
    return [];
  }
}

export async function sendMessage(message: {
  club_id: string;
  user_id: string;
  content: string;
  is_pinned?: boolean;
}): Promise<ClubMessage> {
  try {
    const messageData = {
      club_id: message.club_id,
      user_id: message.user_id,
      content: message.content,
      is_pinned: message.is_pinned !== undefined ? message.is_pinned : false
    };
    
    const { data, error } = await supabase
      .from('club_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after sending message');
    
    return data as ClubMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function pinMessage(id: string, isPinned: boolean): Promise<ClubMessage> {
  try {
    const { data, error } = await supabase
      .from('club_messages')
      .update({ is_pinned: isPinned })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after pinning/unpinning message');
    
    return data as ClubMessage;
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
    channel.unsubscribe();
  };
}

export async function updateMembership(clubId: string, membershipType: MembershipType): Promise<ClubMember> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('No authenticated user');
    
    const { data, error } = await supabase
      .from('club_members')
      .update({ membership_type: membershipType })
      .eq('club_id', clubId)
      .eq('user_id', userData.user.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned after updating membership');
    
    return {
      ...data,
      role: data.role as MemberRole,
      status: data.status as MemberStatus,
      membership_type: data.membership_type as MembershipType
    } as ClubMember;
  } catch (error) {
    console.error(`Error updating membership for club ${clubId}:`, error);
    throw error;
  }
}

export async function fetchClubProducts(clubId: string): Promise<ClubProduct[]> {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .select('*')
      .eq('club_id', clubId);
    
    if (error) throw error;
    if (!data) return [];
    
    return data.map(product => ({
      ...product,
      product_type: product.product_type as ProductType
    })) as ClubProduct[];
  } catch (error) {
    console.error(`Error fetching club products for ${clubId}:`, error);
    return [];
  }
}

export async function purchaseClubProduct(productId: string): Promise<ClubProductPurchase> {
  try {
    const { data
