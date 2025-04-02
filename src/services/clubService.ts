
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
  EventParticipationStatus 
} from '@/types/club';
import { Profile } from '@/types/profile';
import { Workout } from '@/types/workout';

// Clubs
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
  return data as Club;
}

export async function createClub(club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('clubs')
    .insert([club])
    .select()
    .single();
  
  if (error) throw error;
  return data as Club;
}

export async function updateClub(id: string, updates: Partial<Club>) {
  const { data, error } = await supabase
    .from('clubs')
    .update(updates)
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

// Club Members
export async function fetchClubMembers(clubId: string) {
  const { data, error } = await supabase
    .from('club_members')
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .eq('club_id', clubId);
  
  if (error) throw error;
  
  return data.map(member => ({
    id: member.id,
    clubId: member.club_id,
    userId: member.user_id,
    role: member.role,
    status: member.status,
    membershipType: member.membership_type,
    joinedAt: member.joined_at,
    expiresAt: member.expires_at,
    profile: member.profile as Profile
  })) as ClubMember[];
}

export async function joinClub(clubId: string, membershipType: MembershipType = 'free') {
  const user = supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('club_members')
    .insert([{
      club_id: clubId,
      user_id: (await user).data.user?.id,
      role: 'member',
      status: 'active',
      membership_type: membershipType
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clubId: data.club_id,
    userId: data.user_id,
    role: data.role,
    status: data.status,
    membershipType: data.membership_type,
    joinedAt: data.joined_at,
    expiresAt: data.expires_at
  } as ClubMember;
}

export async function updateMemberRole(memberId: string, role: MemberRole) {
  const { data, error } = await supabase
    .from('club_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clubId: data.club_id,
    userId: data.user_id,
    role: data.role,
    status: data.status,
    membershipType: data.membership_type,
    joinedAt: data.joined_at,
    expiresAt: data.expires_at
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
      club:club_id(*)
    `)
    .eq('user_id', (await user).data.user?.id);
  
  if (error) throw error;
  
  return data.map(membership => ({
    membership: {
      id: membership.id,
      clubId: membership.club_id,
      userId: membership.user_id,
      role: membership.role,
      status: membership.status,
      membershipType: membership.membership_type,
      joinedAt: membership.joined_at,
      expiresAt: membership.expires_at
    },
    club: membership.club as Club
  }));
}

// Club Events
export async function fetchClubEvents(clubId: string) {
  const { data, error } = await supabase
    .from('club_events')
    .select('*')
    .eq('club_id', clubId)
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  
  return data.map(event => ({
    id: event.id,
    clubId: event.club_id,
    name: event.name,
    description: event.description,
    location: event.location,
    startTime: event.start_time,
    endTime: event.end_time,
    imageUrl: event.image_url,
    createdBy: event.created_by,
    createdAt: event.created_at,
    updatedAt: event.updated_at
  })) as ClubEvent[];
}

export async function createEvent(event: Omit<ClubEvent, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('club_events')
    .insert([{
      club_id: event.clubId,
      name: event.name,
      description: event.description,
      location: event.location,
      start_time: event.startTime,
      end_time: event.endTime,
      image_url: event.imageUrl,
      created_by: event.createdBy
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clubId: data.club_id,
    name: data.name,
    description: data.description,
    location: data.location,
    startTime: data.start_time,
    endTime: data.end_time,
    imageUrl: data.image_url,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } as ClubEvent;
}

export async function updateEvent(id: string, updates: Partial<Omit<ClubEvent, 'id' | 'createdAt' | 'updatedAt'>>) {
  const mappedUpdates: any = {};
  
  if (updates.name) mappedUpdates.name = updates.name;
  if (updates.description) mappedUpdates.description = updates.description;
  if (updates.location) mappedUpdates.location = updates.location;
  if (updates.startTime) mappedUpdates.start_time = updates.startTime;
  if (updates.endTime) mappedUpdates.end_time = updates.endTime;
  if (updates.imageUrl) mappedUpdates.image_url = updates.imageUrl;
  
  const { data, error } = await supabase
    .from('club_events')
    .update(mappedUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clubId: data.club_id,
    name: data.name,
    description: data.description,
    location: data.location,
    startTime: data.start_time,
    endTime: data.end_time,
    imageUrl: data.image_url,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at
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
    .upsert([{
      event_id: eventId,
      user_id: (await user).data.user?.id,
      status
    }], { onConflict: 'event_id,user_id' })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    eventId: data.event_id,
    userId: data.user_id,
    status: data.status,
    joinedAt: data.joined_at
  } as EventParticipant;
}

export async function fetchEventParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .eq('event_id', eventId);
  
  if (error) throw error;
  
  return data.map(participant => ({
    id: participant.id,
    eventId: participant.event_id,
    userId: participant.user_id,
    status: participant.status,
    joinedAt: participant.joined_at,
    profile: participant.profile as Profile
  })) as EventParticipant[];
}

// Club Posts
export async function fetchClubPosts(clubId: string) {
  const { data, error } = await supabase
    .from('club_posts')
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(post => ({
    id: post.id,
    clubId: post.club_id,
    userId: post.user_id,
    content: post.content,
    workoutId: post.workout_id,
    imageUrl: post.image_url,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    profile: post.profile as Profile
  })) as ClubPost[];
}

export async function createPost(post: Omit<ClubPost, 'id' | 'createdAt' | 'updatedAt' | 'profile'>) {
  const { data, error } = await supabase
    .from('club_posts')
    .insert([{
      club_id: post.clubId,
      user_id: post.userId,
      content: post.content,
      workout_id: post.workoutId,
      image_url: post.imageUrl
    }])
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clubId: data.club_id,
    userId: data.user_id,
    content: data.content,
    workoutId: data.workout_id,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    profile: data.profile as Profile
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

// Club Post Comments
export async function fetchPostComments(postId: string) {
  const { data, error } = await supabase
    .from('club_post_comments')
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  return data.map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    userId: comment.user_id,
    content: comment.content,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    profile: comment.profile as Profile
  })) as ClubPostComment[];
}

export async function createComment(comment: Omit<ClubPostComment, 'id' | 'createdAt' | 'updatedAt' | 'profile'>) {
  const { data, error } = await supabase
    .from('club_post_comments')
    .insert([{
      post_id: comment.postId,
      user_id: comment.userId,
      content: comment.content
    }])
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    postId: data.post_id,
    userId: data.user_id,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    profile: data.profile as Profile
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

// Club Messages (Chat)
export async function fetchClubMessages(clubId: string) {
  const { data, error } = await supabase
    .from('club_messages')
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  
  return data.map(message => ({
    id: message.id,
    clubId: message.club_id,
    userId: message.user_id,
    content: message.content,
    createdAt: message.created_at,
    isPinned: message.is_pinned,
    profile: message.profile as Profile
  })) as ClubMessage[];
}

export async function sendMessage(message: Omit<ClubMessage, 'id' | 'createdAt' | 'isPinned' | 'profile'>) {
  const { data, error } = await supabase
    .from('club_messages')
    .insert([{
      club_id: message.clubId,
      user_id: message.userId,
      content: message.content
    }])
    .select(`
      *,
      profile:user_id(id, username, display_name, avatar_url)
    `)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    clubId: data.club_id,
    userId: data.user_id,
    content: data.content,
    createdAt: data.created_at,
    isPinned: data.is_pinned,
    profile: data.profile as Profile
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
    clubId: data.club_id,
    userId: data.user_id,
    content: data.content,
    createdAt: data.created_at,
    isPinned: data.is_pinned
  } as ClubMessage;
}

// Subscribe to real-time message updates
export function subscribeToClubMessages(clubId: string, callback: (message: ClubMessage) => void) {
  const channel = supabase
    .channel('public:club_messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'club_messages',
      filter: `club_id=eq.${clubId}`
    }, async (payload) => {
      // Fetch user profile for the message
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', payload.new.user_id)
        .single();
      
      const message: ClubMessage = {
        id: payload.new.id,
        clubId: payload.new.club_id,
        userId: payload.new.user_id,
        content: payload.new.content,
        createdAt: payload.new.created_at,
        isPinned: payload.new.is_pinned,
        profile: data as Profile
      };
      
      callback(message);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}
