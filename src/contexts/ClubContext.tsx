
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Club,
  ClubEvent,
  ClubMember,
  ClubPost,
  ClubMessage,
  MemberRole,
  EventParticipationStatus,
  EventParticipant,
  ClubProduct,
  MembershipType,
  MemberStatus,
  ProductType,
  ClubChannel
} from '@/types/club';
import { toast } from 'sonner';

interface ClubContextType {
  clubs: Club[];
  currentClub: Club | null;
  loadingClubs: boolean;
  loadingMembers: boolean;
  loadingEvents: boolean;
  loadingPosts: boolean;
  loadingChannels: boolean;
  members: ClubMember[];
  events: ClubEvent[];
  posts: ClubPost[];
  messages: ClubMessage[];
  channels: ClubChannel[];
  setCurrentClub: (club: Club) => void;
  createClub: (name: string, description: string, type: string) => Promise<Club>;
  updateClub: (clubId: string, data: Partial<Club>) => Promise<Club>;
  joinCurrentClub: () => Promise<void>;
  leaveCurrentClub: () => Promise<void>;
  updateMember: (memberId: string, data: Partial<ClubMember>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  createEvent: (eventData: Partial<ClubEvent>) => Promise<ClubEvent>;
  updateEvent: (eventId: string, eventData: Partial<ClubEvent>) => Promise<void>;
  joinEvent: (eventId: string, status: EventParticipationStatus) => Promise<void>;
  createNewPost: (postData: { club_id: string; content: string; workout_id?: string | null; image_url?: string | null }) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
  refreshClubs: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  getUserClubRole: (clubId: string) => MemberRole | null;
  isUserClubMember: (clubId: string) => boolean;
}

interface ClubProviderProps {
  children: ReactNode;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<ClubProviderProps> = ({ children }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [channels, setChannels] = useState<ClubChannel[]>([]);
  
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(true);
  
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchUserClubs();
    }
  }, [user]);
  
  const fetchUserClubs = async () => {
    try {
      setLoadingClubs(true);
      
      const { data: memberData, error: memberError } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user?.id);
      
      if (memberError) throw memberError;
      
      if (memberData && memberData.length > 0) {
        const clubIds = memberData.map(member => member.club_id);
        
        const { data: clubsData, error: clubsError } = await supabase
          .from('clubs')
          .select('*')
          .in('id', clubIds);
        
        if (clubsError) throw clubsError;
        
        if (clubsData) {
          setClubs(clubsData.map(club => ({
            ...club,
            creator_id: club.creator_id,
            club_type: club.club_type as any,
            membership_type: club.membership_type as any
          })));
        }
      } else {
        setClubs([]);
      }
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };
  
  const refreshClubs = async (): Promise<void> => {
    if (user) {
      await fetchUserClubs();
    }
  };
  
  const refreshMembers = async (): Promise<void> => {
    if (currentClub?.id) {
      await fetchClubMembers(currentClub.id);
    }
  };
  
  const refreshEvents = async (): Promise<void> => {
    if (currentClub?.id) {
      await fetchClubEvents(currentClub.id);
    }
  };
  
  const refreshPosts = async (): Promise<void> => {
    if (currentClub?.id) {
      await fetchClubPosts(currentClub.id);
    }
  };
  
  const createClub = async (name: string, description: string, type: string): Promise<Club> => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const newClub = {
        name,
        description,
        club_type: type as any,
        membership_type: 'free' as MembershipType,
        creator_id: user.id
      };
      
      const { data, error } = await supabase
        .from('clubs')
        .insert(newClub)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create club');
      
      // Refresh the clubs list
      await refreshClubs();
      
      return data as Club;
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  };
  
  const updateClub = async (clubId: string, data: Partial<Club>): Promise<Club> => {
    try {
      const { data: updatedClub, error } = await supabase
        .from('clubs')
        .update(data)
        .eq('id', clubId)
        .select()
        .single();
      
      if (error) throw error;
      if (!updatedClub) throw new Error('Failed to update club');
      
      if (currentClub && currentClub.id === clubId) {
        setCurrentClub({
          ...currentClub,
          ...updatedClub
        });
      }
      
      // Refresh the clubs list
      await refreshClubs();
      
      return updatedClub as Club;
    } catch (error) {
      console.error('Error updating club:', error);
      throw error;
    }
  };
  
  const fetchClubMembers = async (clubId: string) => {
    try {
      setLoadingMembers(true);
      
      const { data: membersData, error: membersError } = await supabase
        .from('club_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('club_id', clubId);
      
      if (membersError) throw membersError;
      
      if (membersData) {
        // Map over the members and format any profile data
        const formattedMembers = membersData.map(member => {
          // Handle potential null profile or error in profile fetch
          let formattedProfile = null;
          
          if (member.profile && typeof member.profile === 'object' && !('error' in member.profile)) {
            formattedProfile = {
              display_name: member.profile.display_name || null,
              username: member.profile.username || null,
              avatar_url: member.profile.avatar_url || null
            };
          }
          
          return {
            ...member,
            profile: formattedProfile
          } as ClubMember;
        });
        
        setMembers(formattedMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching club members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };
  
  const fetchClubEvents = async (clubId: string) => {
    try {
      setLoadingEvents(true);
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('club_events')
        .select('*')
        .eq('club_id', clubId)
        .order('start_time', { ascending: true });
      
      if (eventsError) throw eventsError;
      
      if (eventsData) {
        setEvents(eventsData as ClubEvent[]);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching club events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };
  
  const fetchClubPosts = async (clubId: string) => {
    try {
      setLoadingPosts(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('club_posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      if (postsData) {
        // Map over the posts and format any profile data
        const formattedPosts = postsData.map(post => {
          // Handle potential null profile or error in profile fetch
          let formattedProfile = null;
          
          if (post.profile && typeof post.profile === 'object' && !('error' in post.profile)) {
            formattedProfile = {
              display_name: post.profile.display_name || null,
              username: post.profile.username || null,
              avatar_url: post.profile.avatar_url || null
            };
          }
          
          return {
            ...post,
            profile: formattedProfile
          } as ClubPost;
        });
        
        setPosts(formattedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching club posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const fetchClubMessages = async (clubId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('club_messages')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });
      
      if (messagesError) throw messagesError;
      
      if (messagesData) {
        // Map over the messages and format any profile data
        const formattedMessages = messagesData.map(message => {
          // Handle potential null profile or error in profile fetch
          let formattedProfile = null;
          
          if (message.profile && typeof message.profile === 'object' && !('error' in message.profile)) {
            formattedProfile = {
              display_name: message.profile.display_name || null,
              username: message.profile.username || null,
              avatar_url: message.profile.avatar_url || null
            };
          }
          
          return {
            ...message,
            profile: formattedProfile
          } as ClubMessage;
        });
        
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching club messages:', error);
      toast.error('Failed to load messages');
    }
  };
  
  const joinCurrentClub = async () => {
    if (!currentClub || !user) {
      toast.error('Unable to join club');
      return;
    }
    
    try {
      const newMember = {
        club_id: currentClub.id,
        user_id: user.id,
        role: 'member' as MemberRole,
        status: 'active' as MemberStatus,
        membership_type: currentClub.membership_type,
      };
      
      const { error } = await supabase
        .from('club_members')
        .insert(newMember);
      
      if (error) throw error;
      
      await refreshClubs();
      await refreshMembers();
      
      toast.success('Successfully joined the club!');
    } catch (error: any) {
      console.error('Error joining club:', error);
      toast.error(error.message || 'Failed to join club');
    }
  };
  
  const leaveCurrentClub = async () => {
    if (!currentClub || !user) {
      toast.error('Unable to leave club');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', currentClub.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await refreshClubs();
      await refreshMembers();
      
      toast.success('Successfully left the club');
    } catch (error: any) {
      console.error('Error leaving club:', error);
      toast.error(error.message || 'Failed to leave club');
    }
  };
  
  const updateMember = async (memberId: string, data: Partial<ClubMember>) => {
    try {
      const { error } = await supabase
        .from('club_members')
        .update(data)
        .eq('id', memberId);
      
      if (error) throw error;
      
      await refreshMembers();
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast.error(error.message || 'Failed to update member');
    }
  };
  
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      await refreshMembers();
      toast.success('Member removed successfully');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
    }
  };
  
  const createEvent = async (eventData: Partial<ClubEvent>): Promise<ClubEvent> => {
    try {
      if (!user || !currentClub) throw new Error('User not authenticated or no club selected');
      
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
  
  const updateEvent = async (eventId: string, eventData: Partial<ClubEvent>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('club_events')
        .update(eventData)
        .eq('id', eventId);
      
      if (error) throw error;
      
      await refreshEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };
  
  const joinEvent = async (eventId: string, status: EventParticipationStatus): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Check if user is already a participant
      const { data: existingParticipant, error: checkError } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
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
        // Create new participation record
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status,
            joined_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      // Refresh events list
      await refreshEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  };
  
  const createNewPost = async (postData: { club_id: string; content: string; workout_id?: string | null; image_url?: string | null }) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const newPost = {
        ...postData,
        user_id: user.id,
      };
      
      const { error } = await supabase
        .from('club_posts')
        .insert(newPost);
      
      if (error) throw error;
      
      await refreshPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw error;
    }
  };
  
  const removePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('club_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      // Update the posts list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error(error.message || 'Failed to delete post');
    }
  };
  
  useEffect(() => {
    if (currentClub?.id) {
      fetchClubMembers(currentClub.id);
      fetchClubEvents(currentClub.id);
      fetchClubPosts(currentClub.id);
      fetchClubMessages(currentClub.id);
    }
  }, [currentClub]);
  
  const getUserClubRole = (clubId: string): MemberRole | null => {
    if (!user) return null;
    
    const member = members.find(m => m.club_id === clubId && m.user_id === user.id);
    return member ? member.role : null;
  };
  
  const isUserClubMember = (clubId: string): boolean => {
    if (!user) return false;
    return members.some(member => member.club_id === clubId && member.user_id === user.id);
  };
  
  const contextValue: ClubContextType = {
    clubs,
    currentClub,
    loadingClubs,
    loadingMembers,
    loadingEvents,
    loadingPosts,
    loadingChannels,
    members,
    events,
    posts,
    messages,
    channels,
    setCurrentClub,
    createClub,
    updateClub,
    joinCurrentClub,
    leaveCurrentClub,
    updateMember,
    removeMember,
    createEvent,
    updateEvent,
    joinEvent,
    createNewPost,
    removePost,
    refreshClubs,
    refreshMembers,
    refreshEvents,
    refreshPosts,
    getUserClubRole,
    isUserClubMember
  };
  
  return (
    <ClubContext.Provider value={contextValue}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
