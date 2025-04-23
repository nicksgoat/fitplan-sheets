import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Club,
  ClubEvent,
  ClubMember,
  ClubPost,
  ClubPostComment,
  ClubType,
  MembershipType,
  EventParticipant,
  EventParticipationStatus,
  ClubMessage,
  MemberRole,
  MemberStatus,
} from '@/types/club';

interface ClubContextType {
  currentClub: Club | null;
  setCurrentClub: (club: Club | null) => void;
  clubs: Club[];
  loadingClubs: boolean;
  refreshClubs: () => Promise<void>;
  createNewClub: (clubData: Partial<Club>) => Promise<Club>;
  joinClub: (clubId: string, membershipType?: MembershipType) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
  isMember: boolean;
  refreshMembership: () => Promise<void>;
  members: ClubMember[];
  loadingMembers: boolean;
  refreshMembers: () => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  events: ClubEvent[];
  loadingEvents: boolean;
  refreshEvents: () => Promise<void>;
  joinEvent: (eventId: string, status: EventParticipationStatus) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  isUserEventParticipant: (eventId: string) => boolean;
  posts: ClubPost[];
  loadingPosts: boolean;
  refreshPosts: () => Promise<void>;
  createPost: (postData: Partial<ClubPost>) => Promise<ClubPost>;
  deletePost: (postId: string) => Promise<void>;
  createComment: (postId: string, content: string) => Promise<ClubPostComment | null>;
  channels: any[];
  loadingChannels: boolean;
  refreshChannels: () => Promise<void>;
  createChannel: (channelData: any) => Promise<any>;
  messages: ClubMessage[];
  loadingMessages: boolean;
  refreshMessages: () => Promise<void>;
  sendNewMessage: (messageData: any) => Promise<void>;
  upgradeToMembership: (membershipType: MembershipType) => Promise<void>;
  createClubEvent: (eventData: Partial<ClubEvent>) => Promise<ClubEvent>;
  isUserClubMember: (clubId: string) => boolean;
  joinCurrentClub: () => Promise<void>;
  leaveCurrentClub: () => Promise<void>;
  createNewPost: (postData: Partial<ClubPost>) => Promise<ClubPost>;
  getUserClubRole: (clubId: string) => string;
  isUserClubAdmin: (clubId: string) => boolean;
  userClubs: Club[];
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (user) {
      refreshClubs();
    }
  }, [user]);

  useEffect(() => {
    if (user && currentClub) {
      refreshMembership();
      refreshMembers();
      refreshEvents();
      refreshPosts();
      refreshChannels();
      refreshMessages();
    } else {
      setIsMember(false);
      setMembers([]);
      setEvents([]);
      setPosts([]);
      setChannels([]);
      setMessages([]);
    }
  }, [user, currentClub]);

  const fetchUserClubs = async () => {
    if (!user) return;
    
    try {
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      if (membershipsData && membershipsData.length > 0) {
        const clubIds = membershipsData.map(item => item.club_id);
        
        const { data: userClubsData, error: clubsError } = await supabase
          .from('clubs')
          .select('*')
          .in('id', clubIds);

        if (clubsError) throw clubsError;
        
        if (userClubsData) {
          const typedUserClubs = userClubsData.map(club => ({
            ...club,
            creator_id: club.creator_id,
            club_type: club.club_type as ClubType,
            membership_type: club.membership_type as MembershipType
          }));
          
          setUserClubs(typedUserClubs);
        }
      } else {
        setUserClubs([]);
      }
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      setUserClubs([]);
    }
  };

  const refreshClubs = async () => {
    if (!user) return;

    setLoadingClubs(true);
    try {
      const { data: clubsData, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (clubsData) {
        const typedClubs = clubsData.map(club => ({
          ...club,
          creator_id: club.creator_id,
          club_type: club.club_type as ClubType,
          membership_type: club.membership_type as MembershipType
        }));
        setClubs(typedClubs);
      }
      
      await fetchUserClubs();
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const createNewClub = async (clubData: Partial<Club>): Promise<Club> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const insertData = {
        name: clubData.name || '',
        description: clubData.description || '',
        logo_url: clubData.logo_url,
        banner_url: clubData.banner_url,
        club_type: clubData.club_type || 'fitness',
        membership_type: clubData.membership_type || 'free',
        creator_id: user.id,
        premium_price: clubData.premium_price
      };
      
      const { data, error } = await supabase
        .from('clubs')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create club');

      await refreshClubs();
      return data as Club;
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  };

  const joinClub = async (clubId: string, membershipType: MembershipType = 'free'): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase.from('club_members').insert({
        club_id: clubId,
        user_id: user.id,
        role: 'member',
        status: 'active',
        membership_type: membershipType,
        joined_at: new Date().toISOString(),
      });

      if (error) throw error;
      await refreshClubs();
      setCurrentClub(clubs.find((club) => club.id === clubId) || null);
    } catch (error) {
      console.error('Error joining club:', error);
      throw error;
    }
  };

  const joinCurrentClub = async (): Promise<void> => {
    if (!currentClub || !user) {
      throw new Error('No current club selected or user not authenticated');
    }
    
    return joinClub(currentClub.id);
  };

  const leaveClub = async (clubId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshClubs();
      setCurrentClub(null);
    } catch (error) {
      console.error('Error leaving club:', error);
      throw error;
    }
  };

  const leaveCurrentClub = async (): Promise<void> => {
    if (!currentClub || !user) {
      throw new Error('No current club selected or user not authenticated');
    }
    
    return leaveClub(currentClub.id);
  };

  const isUserClubMember = (clubId: string): boolean => {
    if (!user) return false;
    return userClubs.some(club => club.id === clubId);
  };

  const isUserClubAdmin = (clubId: string): boolean => {
    if (!user) return false;
    const member = members.find(m => m.user_id === user.id && m.club_id === clubId);
    return member ? ['admin', 'moderator', 'owner'].includes(member.role) : false;
  };

  const getUserClubRole = (clubId: string): string => {
    if (!user) return 'member';
    const member = members.find(m => m.user_id === user.id && m.club_id === clubId);
    return member ? member.role : 'member';
  };

  const refreshMembership = async () => {
    if (!user || !currentClub) return;

    try {
      const { data, error } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', currentClub.id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setIsMember(false);
          return;
        }
        throw error;
      }

      setIsMember(!!data);
    } catch (error) {
      console.error('Error checking membership:', error);
      toast.error('Failed to check membership status');
      setIsMember(false);
    }
  };

  const refreshMembers = async () => {
    if (!currentClub) return;

    setLoadingMembers(true);
    try {
      const { data: membersData, error } = await supabase
        .from('club_members')
        .select(
          `
          *,
          profiles:profiles(*)
        `
        )
        .eq('club_id', currentClub.id);

      if (error) throw error;

      if (membersData) {
        const formattedMembers = membersData.map(member => {
          let formattedProfile = null;
          
          if (member.profile && typeof member.profile === 'object' && !('error' in member.profile)) {
            formattedProfile = {
              display_name: member.profile?.display_name || null,
              username: member.profile?.username || null,
              avatar_url: member.profile?.avatar_url || null
            };
          }
          
          return {
            ...member,
            profile: formattedProfile
          } as ClubMember;
        });
        setMembers(formattedMembers);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('club_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      await refreshMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const refreshEvents = async () => {
    if (!currentClub) return;

    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from('club_events')
        .select('*')
        .eq('club_id', currentClub.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (data) {
        setEvents(data as ClubEvent[]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const createEvent = async (eventData: Partial<ClubEvent>): Promise<ClubEvent> => {
    try {
      if (!user || !currentClub) throw new Error('User not authenticated or no club selected');
      
      const newEvent = {
        ...eventData,
        club_id: currentClub.id,
        created_by: user.id,
        name: eventData.name || 'New Event',
        start_time: eventData.start_time || new Date().toISOString(),
        end_time: eventData.end_time || new Date(Date.now() + 3600000).toISOString(),
      };
      
      const { data, error } = await supabase
        .from('club_events')
        .insert(newEvent)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create event');
      
      await refreshEvents();
      
      return data as ClubEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const joinEvent = async (eventId: string, status: EventParticipationStatus): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
  
    try {
      const { error } = await supabase
        .from('event_participants')
        .upsert(
          {
            event_id: eventId,
            user_id: user.id,
            status: status,
            joined_at: new Date().toISOString(),
          },
          { onConflict: 'event_id,user_id' }
        );
  
      if (error) throw error;
      await refreshEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  };

  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshEvents();
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  };

  const isUserEventParticipant = (eventId: string): boolean => {
    return events.some(event => event.id === eventId && 
      event.participants?.some(participant => participant.user_id === user?.id));
  };

  const refreshPosts = async () => {
    if (!currentClub) return;

    setLoadingPosts(true);
    try {
      const { data: postsData, error } = await supabase
        .from('club_posts')
        .select(
          `
          *,
          profiles:profiles(*),
          workout:workouts(*)
        `
        )
        .eq('club_id', currentClub.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = postsData.map(post => {
        let formattedProfile = null;
        
        if (post.profile && typeof post.profile === 'object' && !('error' in post.profile)) {
          formattedProfile = {
            display_name: post.profile?.display_name || null,
            username: post.profile?.username || null,
            avatar_url: post.profile?.avatar_url || null
          };
        }
        
        return {
          ...post,
          profile: formattedProfile
        } as ClubPost;
      });
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const createPost = async (postData: Partial<ClubPost>): Promise<ClubPost> => {
    if (!user || !currentClub) throw new Error('User not authenticated or no club selected');

    try {
      const { data, error } = await supabase
        .from('club_posts')
        .insert({
          ...postData,
          club_id: currentClub.id,
          user_id: user.id,
        })
        .select('*')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create post');

      await refreshPosts();
      return data as ClubPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      throw error;
    }
  };

  const createNewPost = createPost;

  const deletePost = async (postId: string): Promise<void> => {
    try {
      const { error } = await supabase.from('club_posts').delete().eq('id', postId);

      if (error) throw error;
      await refreshPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const createComment = async (postId: string, content: string): Promise<ClubPostComment | null> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('club_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content,
        })
        .select('*')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create comment');

      await refreshPosts();
      return data as ClubPostComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to create comment');
      return null;
    }
  };

  const refreshChannels = async () => {
    if (!currentClub) return;

    setLoadingChannels(true);
    try {
      const { data, error } = await supabase
        .from('club_channels')
        .select('*')
        .eq('club_id', currentClub.id);

      if (error) throw error;
      if (data) {
        setChannels(data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('Failed to load channels');
    } finally {
      setLoadingChannels(false);
    }
  };

  const createChannel = async (channelData: any) => {
    if (!currentClub) throw new Error('No club selected');

    try {
      const { data, error } = await supabase
        .from('club_channels')
        .insert({
          ...channelData,
          club_id: currentClub.id,
          created_by: user?.id,
        })
        .select('*')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create channel');

      await refreshChannels();
      return data;
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Failed to create channel');
      throw error;
    }
  };

  const refreshMessages = useCallback(async () => {
    if (!currentClub) return;

    setLoadingMessages(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('club_messages')
        .select(
          `
          *,
          profiles:profiles(*)
        `
        )
        .eq('club_id', currentClub.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = messagesData.map(message => {
        let formattedProfile = null;
        
        if (message.profile && typeof message.profile === 'object' && !('error' in message.profile)) {
          formattedProfile = {
            display_name: message.profile?.display_name || null,
            username: message.profile?.username || null,
            avatar_url: message.profile?.avatar_url || null
          };
        }
        
        return {
          ...message,
          profile: formattedProfile
        } as ClubMessage;
      });
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [currentClub]);

  const sendNewMessage = async (messageData: any) => {
    if (!user || !currentClub) throw new Error('User not authenticated or no club selected');

    try {
      const { error } = await supabase
        .from('club_messages')
        .insert({
          ...messageData,
          user_id: user.id,
        });

      if (error) throw error;
      await refreshMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const upgradeToMembership = async (membershipType: MembershipType) => {
    try {
      if (!user || !currentClub) {
        toast.error('User not authenticated or no club selected');
        return;
      }
      
      const { data: memberData, error: memberError } = await supabase
        .from('club_members')
        .select('*')
        .eq('club_id', currentClub.id)
        .eq('user_id', user.id)
        .single();
      
      if (memberError) throw memberError;
      
      if (!memberData) {
        toast.error('You are not a member of this club');
        return;
      }
      
      const membershipTypeValue = String(membershipType);
      
      const { error: updateError } = await supabase
        .from('club_members')
        .update({ membership_type: membershipTypeValue })
        .eq('id', memberData.id);
      
      if (updateError) throw updateError;
      
      await refreshMembers();
      toast.success(`Membership upgraded to ${membershipType}`);
    } catch (error: any) {
      console.error('Error upgrading membership:', error);
      toast.error(error.message || 'Failed to upgrade membership');
    }
  };

  const createClubEvent = async (eventData: Partial<ClubEvent>): Promise<ClubEvent> => {
    try {
      if (!user || !currentClub) throw new Error('User not authenticated or no club selected');
      
      if (!eventData.name || !eventData.start_time || !eventData.end_time) {
        throw new Error('Name, start time and end time are required');
      }
      
      const newEvent = {
        ...eventData,
        club_id: currentClub.id,
        created_by: user.id
      };
      
      const { data, error } = await supabase
        .from('club_events')
        .insert(newEvent)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create event');
      
      await refreshEvents();
      
      return data as ClubEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const contextValue: ClubContextType = {
    currentClub,
    setCurrentClub,
    clubs,
    loadingClubs,
    refreshClubs,
    createNewClub,
    joinClub,
    leaveClub,
    isMember,
    refreshMembership,
    members,
    loadingMembers,
    refreshMembers,
    updateMemberRole,
    events,
    loadingEvents,
    refreshEvents,
    joinEvent,
    leaveEvent,
    isUserEventParticipant,
    posts,
    loadingPosts,
    refreshPosts,
    createPost,
    deletePost,
    createComment,
    channels,
    loadingChannels,
    refreshChannels,
    createChannel,
    messages,
    loadingMessages,
    refreshMessages,
    sendNewMessage,
    upgradeToMembership,
    createClubEvent,
    isUserClubMember,
    joinCurrentClub,
    leaveCurrentClub,
    createNewPost,
    getUserClubRole,
    isUserClubAdmin,
    userClubs
  };

  return (
    <ClubContext.Provider value={contextValue}>{children}</ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
