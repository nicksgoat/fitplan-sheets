import { supabase } from '@/integrations/supabase/client';
import { 
  Club, 
  ClubMember, 
  ClubEvent, 
  EventParticipant,
  ClubPost,
  ClubPostComment,
  ClubMessage,
  ClubType,
  MembershipType,
  MemberRole,
  MemberStatus,
  EventParticipationStatus,
  ProductType,
  ClubProduct,
  ClubProductPurchase,
  PurchaseStatus
} from '@/types/club';
import { Profile, SocialLink } from '@/types/profile';
import { Workout } from '@/types/workout';
import { Json } from '@/integrations/supabase/types';

const safeProfileConversion = (profileData: any): Profile | undefined => {
  if (!profileData || typeof profileData === 'string' || profileData.error) {
    return undefined;
  }
  return profileData as Profile;
};

export async function fetchClubs() {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data as Club[];
}

export async function fetchClubById(id: string) {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return data as Club | null;
}

export async function createClub(club: Omit<Club, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: club.name,
        description: club.description,
        logo_url: club.logo_url,
        banner_url: club.banner_url,
        club_type: club.club_type,
        creator_id: club.creator_id,
        membership_type: club.membership_type,
        premium_price: club.premium_price
      })
      .select()
      .single();
    
    if (clubError) throw clubError;
    
    const { error: memberError } = await supabase
      .from('club_members')
      .insert({
        club_id: clubData.id,
        user_id: club.creator_id,
        role: 'admin' as MemberRole,
        status: 'active' as MemberStatus,
        membership_type: club.membership_type as MembershipType
      });
    
    if (memberError) {
      console.error("Failed to add creator as club admin:", memberError);
    }
    
    return clubData as Club;
  } catch (error) {
    console.error("Error in createClub:", error);
    throw error;
  }
}

export async function updateClub(id: string, updates: Partial<Club>) {
  const { data, error } = await supabase
    .from('clubs')
    .update({
      name: updates.name,
      description: updates.description,
      logo_url: updates.logo_url,
      banner_url: updates.banner_url,
      club_type: updates.club_type,
      membership_type: updates.membership_type,
      premium_price: updates.premium_price
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data as Club;
}

export async function deleteClub(id: string) {
  const { error } = await supabase
    .from('clubs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function fetchClubMembers(clubId: string) {
  const { data, error } = await supabase
    .from('club_members')
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .eq('club_id', clubId);
  
  if (error) throw error;
  
  return data.map(member => ({
    id: member.id,
    club_id: member.club_id,
    user_id: member.user_id,
    role: member.role as MemberRole,
    status: member.status as MemberStatus,
    membership_type: member.membership_type as MembershipType,
    joined_at: member.joined_at,
    expires_at: member.expires_at,
    premium_expires_at: member.premium_expires_at,
    profile: safeProfileConversion(member.profile)
  })) as ClubMember[];
}

export async function joinClub(clubId: string, membershipType: MembershipType = 'free') {
  const user = supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('club_members')
    .insert({
      club_id: clubId,
      user_id: (await user).data.user?.id,
      role: 'member' as MemberRole,
      status: 'active' as MemberStatus,
      membership_type: membershipType as MembershipType
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    club_id: data.club_id,
    user_id: data.user_id,
    role: data.role as MemberRole,
    status: data.status as MemberStatus,
    membership_type: data.membership_type as MembershipType,
    joined_at: data.joined_at,
    expires_at: data.expires_at,
    premium_expires_at: data.premium_expires_at
  } as ClubMember;
}

export async function updateMemberRole(memberId: string, role: MemberRole) {
  const { data, error } = await supabase
    .from('club_members')
    .update({ role: role })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    club_id: data.club_id,
    user_id: data.user_id,
    role: data.role as MemberRole,
    status: data.status as MemberStatus,
    membership_type: data.membership_type as MembershipType,
    joined_at: data.joined_at,
    expires_at: data.expires_at,
    premium_expires_at: data.premium_expires_at
  } as ClubMember;
}

export async function leaveClub(clubId: string) {
  const user = supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', (await user).data.user?.id);
  
  if (error) throw error;
  return true;
}

export async function getUserClubs() {
  const user = supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('club_members')
    .select(`
      *,
      club:clubs(*)
    `)
    .eq('user_id', (await user).data.user?.id);
  
  if (error) throw error;
  
  return data.map(membership => ({
    membership: {
      id: membership.id,
      club_id: membership.club_id,
      user_id: membership.user_id,
      role: membership.role as MemberRole,
      status: membership.status as MemberStatus,
      membership_type: membership.membership_type as MembershipType,
      joined_at: membership.joined_at,
      expires_at: membership.expires_at,
      premium_expires_at: membership.premium_expires_at
    },
    club: membership.club as Club
  }));
}

export async function fetchClubEvents(clubId: string) {
  const { data, error } = await supabase
    .from('club_events')
    .select('*')
    .eq('club_id', clubId)
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  
  return data.map(event => ({
    id: event.id,
    club_id: event.club_id,
    name: event.name,
    description: event.description,
    location: event.location,
    start_time: event.start_time,
    end_time: event.end_time,
    image_url: event.image_url,
    created_by: event.created_by,
    created_at: event.created_at,
    updated_at: event.updated_at
  })) as ClubEvent[];
}

export async function createEvent(event: Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>) {
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
  
  return {
    id: data.id,
    club_id: data.club_id,
    name: data.name,
    description: data.description,
    location: data.location,
    start_time: data.start_time,
    end_time: data.end_time,
    image_url: data.image_url,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at
  } as ClubEvent;
}

export async function updateEvent(id: string, updates: Partial<Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>>) {
  const mappedUpdates: any = {};
  
  if (updates.name) mappedUpdates.name = updates.name;
  if (updates.description) mappedUpdates.description = updates.description;
  if (updates.location) mappedUpdates.location = updates.location;
  if (updates.start_time) mappedUpdates.start_time = updates.start_time;
  if (updates.end_time) mappedUpdates.end_time = updates.end_time;
  if (updates.image_url) mappedUpdates.image_url = updates.image_url;
  
  const { data, error } = await supabase
    .from('club_events')
    .update(mappedUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    club_id: data.club_id,
    name: data.name,
    description: data.description,
    location: data.location,
    start_time: data.start_time,
    end_time: data.end_time,
    image_url: data.image_url,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at
  } as ClubEvent;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('club_events')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function respondToEvent(eventId: string, status: EventParticipationStatus) {
  const user = supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('event_participants')
    .upsert({
      event_id: eventId,
      user_id: (await user).data.user?.id,
      status: status
    }, { onConflict: 'event_id,user_id' })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    event_id: data.event_id,
    user_id: data.user_id,
    status: data.status as EventParticipationStatus,
    joined_at: data.joined_at
  } as EventParticipant;
}

export async function fetchEventParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .eq('event_id', eventId);
  
  if (error) throw error;
  
  return data.map(participant => ({
    id: participant.id,
    event_id: participant.event_id,
    user_id: participant.user_id,
    status: participant.status as EventParticipationStatus,
    joined_at: participant.joined_at,
    profile: safeProfileConversion(participant.profile)
  })) as EventParticipant[];
}

export async function fetchClubPosts(clubId: string) {
  const { data, error } = await supabase
    .from('club_posts')
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(post => ({
    id: post.id,
    club_id: post.club_id,
    user_id: post.user_id,
    content: post.content,
    workout_id: post.workout_id,
    image_url: post.image_url,
    created_at: post.created_at,
    updated_at: post.updated_at,
    profile: safeProfileConversion(post.profile)
  })) as ClubPost[];
}

export async function createPost(post: Omit<ClubPost, 'id' | 'created_at' | 'updated_at' | 'profile'>) {
  const { data, error } = await supabase
    .from('club_posts')
    .insert({
      club_id: post.club_id,
      user_id: post.user_id,
      content: post.content,
      workout_id: post.workout_id,
      image_url: post.image_url
    })
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    club_id: data.club_id,
    user_id: data.user_id,
    content: data.content,
    workout_id: data.workout_id,
    image_url: data.image_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    profile: safeProfileConversion(data.profile)
  } as ClubPost;
}

export async function deletePost(id: string) {
  const { error } = await supabase
    .from('club_posts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function fetchPostComments(postId: string) {
  const { data, error } = await supabase
    .from('club_post_comments')
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  return data.map(comment => ({
    id: comment.id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    content: comment.content,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    profile: safeProfileConversion(comment.profile)
  })) as ClubPostComment[];
}

export async function createComment(comment: Omit<ClubPostComment, 'id' | 'created_at' | 'updated_at' | 'profile'>) {
  const { data, error } = await supabase
    .from('club_post_comments')
    .insert({
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content
    })
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    post_id: data.post_id,
    user_id: data.user_id,
    content: data.content,
    created_at: data.created_at,
    updated_at: data.updated_at,
    profile: safeProfileConversion(data.profile)
  } as ClubPostComment;
}

export async function deleteComment(id: string) {
  const { error } = await supabase
    .from('club_post_comments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function fetchClubMessages(clubId: string) {
  const { data, error } = await supabase
    .from('club_messages')
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  
  return data.map(message => ({
    id: message.id,
    club_id: message.club_id,
    user_id: message.user_id,
    content: message.content,
    created_at: message.created_at,
    is_pinned: message.is_pinned,
    profile: safeProfileConversion(message.profile)
  })) as ClubMessage[];
}

export async function sendMessage(message: Omit<ClubMessage, 'id' | 'created_at' | 'is_pinned' | 'profile'>) {
  const { data, error } = await supabase
    .from('club_messages')
    .insert({
      club_id: message.club_id,
      user_id: message.user_id,
      content: message.content
    })
    .select(`
      *,
      profile:profiles(id, username, display_name, avatar_url)
    `)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    club_id: data.club_id,
    user_id: data.user_id,
    content: data.content,
    created_at: data.created_at,
    is_pinned: data.is_pinned,
    profile: safeProfileConversion(data.profile)
  } as ClubMessage;
}

export async function pinMessage(id: string, isPinned: boolean) {
  const { data, error } = await supabase
    .from('club_messages')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    club_id: data.club_id,
    user_id: data.user_id,
    content: data.content,
    created_at: data.created_at,
    is_pinned: data.is_pinned
  } as ClubMessage;
}

export function subscribeToClubMessages(clubId: string, callback: (message: ClubMessage) => void) {
  const channel = supabase
    .channel('public:club_messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'club_messages',
      filter: `club_id=eq.${clubId}`
    }, async (payload) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', payload.new.user_id)
        .single();
      
      let profile: Profile | undefined;
      if (data) {
        let socialLinks: SocialLink[] = [];
        if (data.social_links) {
          try {
            if (typeof data.social_links === 'string') {
              socialLinks = JSON.parse(data.social_links) as SocialLink[];
            } else if (Array.isArray(data.social_links)) {
              socialLinks = (data.social_links as any[]).map(link => ({
                platform: link.platform || '',
                url: link.url || '',
                icon: link.icon
              }));
            } else if (typeof data.social_links === 'object') {
              const link = data.social_links as any;
              if (link.platform && link.url) {
                socialLinks = [{ 
                  platform: link.platform, 
                  url: link.url,
                  icon: link.icon
                }];
              }
            }
          } catch (e) {
            console.error('Error parsing social links:', e);
            socialLinks = [];
          }
        }

        profile = {
          id: data.id,
          username: data.username,
          display_name: data.display_name,
          bio: data.bio,
          avatar_url: data.avatar_url,
          website: data.website,
          social_links: socialLinks,
          created_at: data.created_at,
          updated_at: data.updated_at
        } as Profile;
      }
      
      const message: ClubMessage = {
        id: payload.new.id,
        club_id: payload.new.club_id,
        user_id: payload.new.user_id,
        content: payload.new.content,
        created_at: payload.new.created_at,
        is_pinned: payload.new.is_pinned,
        profile: profile
      };
      
      callback(message);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function updateMembership(clubId: string, membershipType: MembershipType) {
  const user = supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const userId = (await user).data.user?.id;
  if (!userId) throw new Error('User ID not available');
  
  const { data: existingMembership, error: findError } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .single();
  
  if (findError && findError.code !== 'PGRST116') throw findError;
  
  let expiresAt = null;
  let premiumExpiresAt = null;
  
  if (membershipType === 'premium') {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    premiumExpiresAt = date.toISOString();
  }
  
  if (existingMembership) {
    const { data, error } = await supabase
      .from('club_members')
      .update({ 
        membership_type: membershipType as MembershipType,
        premium_expires_at: premiumExpiresAt
      })
      .eq('id', existingMembership.id)
      .select(`
        *,
        profile:profiles(id, username, display_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      club_id: data.club_id,
      user_id: data.user_id,
      role: data.role as MemberRole,
      status: data.status as MemberStatus,
      membership_type: data.membership_type as MembershipType,
      joined_at: data.joined_at,
      expires_at: data.expires_at,
      premium_expires_at: data.premium_expires_at,
      profile: safeProfileConversion(data.profile)
    } as ClubMember;
  } else {
    const { data, error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: userId,
        role: 'member' as MemberRole,
        status: 'active' as MemberStatus,
        membership_type: membershipType as MembershipType,
        premium_expires_at: premiumExpiresAt
      })
      .select(`
        *,
        profile:profiles(id, username, display_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      club_id: data.club_id,
      user_id: data.user_id,
      role: data.role as MemberRole,
      status: data.status as MemberStatus,
      membership_type: data.membership_type as MembershipType,
      joined_at: data.joined_at,
      expires_at: data.expires_at,
      premium_expires_at: data.premium_expires_at,
      profile: safeProfileConversion(data.profile)
    } as ClubMember;
  }
}

// New functions for club products and purchases

export async function fetchClubProducts(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(product => ({
      id: product.id,
      club_id: product.club_id,
      name: product.name,
      description: product.description,
      price_amount: product.price_amount,
      price_currency: product.price_currency,
      product_type: product.product_type as ProductType,
      max_participants: product.max_participants,
      date_time: product.date_time,
      location: product.location,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at
    })) as ClubProduct[];
  } catch (error) {
    console.error("Error fetching club products:", error);
    return [];
  }
}

export async function createClubProduct(product: Omit<ClubProduct, 'id' | 'created_at' | 'updated_at' | 'is_active'>) {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .insert({
        club_id: product.club_id,
        name: product.name,
        description: product.description,
        price_amount: product.price_amount,
        price_currency: product.price_currency || 'usd',
        product_type: product.product_type || 'event',
        max_participants: product.max_participants,
        date_time: product.date_time,
        location: product.location
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      club_id: data.club_id,
      name: data.name,
      description: data.description,
      price_amount: data.price_amount,
      price_currency: data.price_currency,
      product_type: data.product_type as ProductType,
      max_participants: data.max_participants,
      date_time: data.date_time,
      location: data.location,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as ClubProduct;
  } catch (error) {
    console.error("Error creating club product:", error);
    throw error;
  }
}

export async function purchaseClubProduct(productId: string) {
  try {
    const user = supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data: product, error: productError } = await supabase
      .from('club_products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (productError) throw productError;
    
    const { data, error } = await supabase
      .from('club_product_purchases')
      .insert({
        product_id: productId,
        user_id: (await user).data.user?.id,
        amount_paid: product.price_amount,
        currency: product.price_currency,
        status: 'completed' as PurchaseStatus
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      product_id: data.product_id,
      user_id: data.user_id,
      purchase_date: data.purchase_date,
      amount_paid: data.amount_paid,
      currency: data.currency,
      stripe_session_id: data.stripe_session_id,
      status: data.status as PurchaseStatus,
      created_at: data.created_at,
      updated_at: data.updated_at,
      product: product as ClubProduct
    } as ClubProductPurchase;
  } catch (error) {
    console.error("Error purchasing club product:", error);
    throw error;
  }
}

export async function getUserPurchases() {
  try {
    const user = supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('club_product_purchases')
      .select(`
        *,
        product:club_products(*)
      `)
      .eq('user_id', (await user).data.user?.id)
      .order('purchase_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(purchase => ({
      id: purchase.id,
      product_id: purchase.product_id,
      user_id: purchase.user_id,
      purchase_date: purchase.purchase_date,
      amount_paid: purchase.amount_paid,
      currency: purchase.currency,
      stripe_session_id: purchase.stripe_session_id,
      status: purchase.status as PurchaseStatus,
      created_at: purchase.created_at,
      updated_at: purchase.updated_at,
      product: purchase.product as ClubProduct
    })) as ClubProductPurchase[];
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    return [];
  }
}
