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
  ClubMessage, 
  ClubType 
} from '@/types/club';

interface CreateClubParams {
  name: string;
  description?: string;
  clubType: ClubType;
  membershipType?: MembershipType;
  logoUrl?: string;
  bannerUrl?: string;
  premiumPrice?: number;
}

interface CreateChannelParams {
  clubId: string;
  name: string;
  description?: string;
  type?: string;
  isDefault?: boolean;
}

interface CreateEventParams {
  clubId: string;
  name: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  category?: string;
}

interface CreateProductParams {
  clubId: string;
  name: string;
  description?: string;
  price: number;
  productType: ProductType;
  dateTime?: string;
  location?: string;
  maxParticipants?: number;
}

interface CreatePostParams {
  clubId: string;
  content: string;
  imageUrl?: string;
  workoutId?: string;
}

interface JoinEventParams {
  eventId: string;
  status?: EventParticipationStatus;
}

interface UpdateEventParams {
  id: string;
  name?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
  category?: string;
}

/**
 * Create a new club
 */
export const createClub = async (userId: string, params: CreateClubParams): Promise<Club> => {
  try {
    const {
      name,
      description,
      clubType,
      membershipType = 'free',
      logoUrl,
      bannerUrl,
      premiumPrice,
    } = params;

    const clubTypeStr = String(clubType);
    const membershipTypeStr = String(membershipType);

    const { data, error } = await supabase
      .from('clubs')
      .insert({
        name,
        description,
        club_type: clubTypeStr,
        membership_type: membershipTypeStr,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        premium_price: premiumPrice,
        creator_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create club');

    return data as Club;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};

/**
 * Get a club by ID
 */
export const getClubById = async (clubId: string): Promise<Club | null> => {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return data as Club;
  } catch (error) {
    console.error('Error getting club by ID:', error);
    throw error;
  }
};

/**
 * Get clubs where the user is a member
 */
export const getUserClubs = async (userId: string): Promise<Club[]> => {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;
    if (!memberData || memberData.length === 0) return [];

    const clubIds = memberData.map((member) => member.club_id);

    const { data: clubsData, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .in('id', clubIds);

    if (clubsError) throw clubsError;
    if (!clubsData) return [];

    return clubsData as Club[];
  } catch (error) {
    console.error('Error getting user clubs:', error);
    throw error;
  }
};

/**
 * Join a club
 */
export const joinClub = async (userId: string, clubId: string, membershipType: MembershipType = 'free'): Promise<void> => {
  try {
    const membershipTypeStr = String(membershipType);
    
    const { error } = await supabase.from('club_members').insert({
      club_id: clubId,
      user_id: userId,
      role: 'member',
      status: 'active',
      membership_type: membershipTypeStr,
      joined_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error joining club:', error);
    throw error;
  }
};

/**
 * Leave a club
 */
export const leaveClub = async (userId: string, clubId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error leaving club:', error);
    throw error;
  }
};

/**
 * Check if user is a member of the club
 */
export const isClubMember = async (userId: string, clubId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // No rows error
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking club membership:', error);
    throw error;
  }
};

/**
 * Get list of club members
 */
export const getClubMembers = async (clubId: string): Promise<ClubMember[]> => {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .select(`
        *,
        profiles:profiles(*)
      `)
      .eq('club_id', clubId);

    if (error) throw error;
    if (!data) return [];

    // Handle profile data
    const members = data.map((member) => {
      let profile = null;
      
      if (member.profiles && typeof member.profiles === 'object' && !('error' in member.profiles)) {
        profile = {
          display_name: member.profiles.display_name,
          username: member.profiles.username,
          avatar_url: member.profiles.avatar_url,
        };
      }

      return {
        ...member,
        profile,
      } as unknown as ClubMember;
    });

    return members;
  } catch (error) {
    console.error('Error getting club members:', error);
    throw error;
  }
};

/**
 * Update a club member's role or status
 */
export const updateClubMember = async (
  memberId: string,
  updates: { role?: MemberRole; status?: MemberStatus; membershipType?: MembershipType }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('club_members')
      .update({
        role: updates.role,
        status: updates.status,
        membership_type: updates.membershipType,
      })
      .eq('id', memberId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating club member:', error);
    throw error;
  }
};

/**
 * Create a new club event
 */
export const createClubEvent = async (userId: string, params: CreateEventParams): Promise<ClubEvent> => {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .insert({
        club_id: params.clubId,
        name: params.name,
        description: params.description,
        location: params.location,
        start_time: params.startTime,
        end_time: params.endTime,
        image_url: params.imageUrl,
        created_by: userId,
        category: params.category,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create event');

    return data as ClubEvent;
  } catch (error) {
    console.error('Error creating club event:', error);
    throw error;
  }
};

/**
 * Update a club event
 */
export const updateClubEvent = async (params: UpdateEventParams): Promise<ClubEvent> => {
  try {
    const updates: any = {};
    if (params.name) updates.name = params.name;
    if (params.description !== undefined) updates.description = params.description;
    if (params.location !== undefined) updates.location = params.location;
    if (params.startTime) updates.start_time = params.startTime;
    if (params.endTime) updates.end_time = params.endTime;
    if (params.imageUrl !== undefined) updates.image_url = params.imageUrl;
    if (params.category !== undefined) updates.category = params.category;

    const { data, error } = await supabase
      .from('club_events')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update event');

    return data as ClubEvent;
  } catch (error) {
    console.error('Error updating club event:', error);
    throw error;
  }
};

/**
 * Get club events
 */
export const getClubEvents = async (clubId: string): Promise<ClubEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .select('*')
      .eq('club_id', clubId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data as ClubEvent[];
  } catch (error) {
    console.error('Error getting club events:', error);
    throw error;
  }
};

/**
 * Join or update status for an event
 */
export const joinEvent = async (userId: string, { eventId, status = 'going' }: JoinEventParams): Promise<void> => {
  try {
    // Check if already a participant
    const { data: existingParticipant, error: checkError } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "no rows returned"
      throw checkError;
    }

    if (existingParticipant) {
      // Update existing participation
      const { error } = await supabase
        .from('event_participants')
        .update({ status })
        .eq('id', existingParticipant.id);

      if (error) throw error;
    } else {
      // Create new participation
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          status,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
};

/**
 * Create a new club product
 */
export const createClubProduct = async (params: CreateProductParams): Promise<ClubProduct> => {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .insert({
        club_id: params.clubId,
        name: params.name,
        description: params.description,
        price_amount: params.price,
        price_currency: 'usd',
        product_type: params.productType,
        date_time: params.dateTime,
        location: params.location,
        max_participants: params.maxParticipants,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create product');

    return data as ClubProduct;
  } catch (error) {
    console.error('Error creating club product:', error);
    throw error;
  }
};

/**
 * Create a new club post
 */
export const createClubPost = async (
  userId: string,
  { clubId, content, imageUrl, workoutId }: CreatePostParams
): Promise<ClubPost> => {
  try {
    const { data, error } = await supabase
      .from('club_posts')
      .insert({
        club_id: clubId,
        user_id: userId,
        content,
        image_url: imageUrl,
        workout_id: workoutId,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create post');

    return data as ClubPost;
  } catch (error) {
    console.error('Error creating club post:', error);
    throw error;
  }
};

/**
 * Delete a club post
 */
export const deleteClubPost = async (postId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('club_posts').delete().eq('id', postId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting club post:', error);
    throw error;
  }
};

/**
 * Utility function to map a database record to a typed club object
 */
export const mapDbRecordToClub = (record: any): Club => {
  return {
    id: record.id,
    name: record.name,
    description: record.description || null,
    logo_url: record.logo_url || null,
    banner_url: record.banner_url || null,
    creator_id: record.creator_id || record.created_by,
    club_type: record.club_type,
    membership_type: record.membership_type,
    premium_price: record.premium_price || null,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
};

/**
 * Check if a user has admin privileges in a club
 */
export const isClubAdmin = async (userId: string, clubId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // No rows error
      throw error;
    }

    const role = data?.role as MembershipType;
    return role === 'owner' || role === 'admin' || role === 'moderator';
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw error;
  }
};

// ClubService export to make imports cleaner
export default {
  createClub,
  getClubById,
  getUserClubs,
  joinClub,
  leaveClub,
  isClubMember,
  getClubMembers,
  updateClubMember,
  createClubEvent,
  updateClubEvent,
  getClubEvents,
  joinEvent,
  createClubProduct,
  createClubPost,
  deleteClubPost,
  mapDbRecordToClub,
  isClubAdmin,
};
