import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface ClubContextType {
  clubs: Club[];
  userClubs: Club[];
  clubEvents: ClubEvent[];
  events: ClubEvent[];
  members: ClubMember[];
  posts: ClubPost[];
  messages: ClubMessage[];
  channels: ClubChannel[];
  products: ClubProduct[];
  currentClub: Club | null;
  currentEvent: ClubEvent | null;
  currentEventParticipants: EventParticipant[];
  loadingClubs: boolean;
  loadingClubEvents: boolean;
  loadingEvents: boolean;
  loadingMembers: boolean;
  loadingPosts: boolean;
  loadingMessages: boolean;
  loadingChannels: boolean;
  setCurrentClub: (club: Club | null) => void;
  refreshClubs: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshChannels: () => Promise<void>;
  loadClubEvents: (clubId: string) => Promise<void>;
  loadEvent: (eventId: string) => Promise<void>;
  loadEventParticipants: (eventId: string) => Promise<void>;
  createClubEvent: (eventData: any) => Promise<ClubEvent | null>;
  isUserClubMember: (clubId: string) => boolean;
  isUserClubAdmin: (clubId: string) => boolean;
  isUserClubCreator: (clubId: string) => boolean;
  isUserEventParticipant: (eventId: string) => boolean;
  joinCurrentClub: () => Promise<ClubMember>;
  leaveCurrentClub: () => Promise<void>;
  joinEvent: (eventId: string, status: EventParticipationStatus) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  createNewClub: (clubData: any) => Promise<Club>;
  createNewEvent: (eventData: any) => Promise<ClubEvent>;
  updateExistingEvent: (eventId: string, eventData: any) => Promise<ClubEvent>;
  removeEvent: (eventId: string) => Promise<void>;
  respondToClubEvent: (eventId: string, status: EventParticipationStatus) => Promise<EventParticipant>;
  createNewPost: (postData: any) => Promise<ClubPost>;
  removePost: (postId: string) => Promise<void>;
  sendNewMessage: (messageData: any) => Promise<ClubMessage>;
  togglePinMessage: (messageId: string, isPinned: boolean) => Promise<void>;
  getUserClubRole: (clubId: string, userId?: string) => MemberRole | null;
  upgradeToMembership: (membershipId: string) => Promise<any>;
  purchaseProduct: (productId: string) => Promise<any>;
  updateMemberRole: (memberId: string, role: MemberRole) => Promise<ClubMember>;
}

const ClubContext = createContext<ClubContextType>({
  clubs: [],
  userClubs: [],
  clubEvents: [],
  events: [],
  members: [],
  posts: [],
  messages: [],
  channels: [],
  products: [],
  currentClub: null,
  currentEvent: null,
  currentEventParticipants: [],
  loadingClubs: true,
  loadingClubEvents: true,
  loadingEvents: true,
  loadingMembers: true,
  loadingPosts: true,
  loadingMessages: true,
  loadingChannels: true,
  setCurrentClub: () => {},
  refreshClubs: async () => {},
  refreshMembers: async () => {},
  refreshProducts: async () => {},
  refreshPosts: async () => {},
  refreshMessages: async () => {},
  refreshEvents: async () => {},
  refreshChannels: async () => {},
  loadClubEvents: async () => {},
  loadEvent: async () => {},
  loadEventParticipants: async () => {},
  createClubEvent: async () => null,
  isUserClubMember: () => false,
  isUserClubAdmin: () => false,
  isUserClubCreator: () => false,
  isUserEventParticipant: () => false,
  joinCurrentClub: async () => ({ id: '', club_id: '', user_id: '', role: 'member', status: 'active', joined_at: '', profile: null, membership_type: 'free' }),
  leaveCurrentClub: async () => {},
  joinEvent: async () => {},
  leaveEvent: async () => {},
  createNewClub: async () => ({ id: '', name: '', description: '', created_at: '', created_by: '', updated_at: '', club_type: 'fitness', membership_type: 'free' }),
  createNewEvent: async () => ({ id: '', club_id: '', name: '', description: '', start_time: '', end_time: '', created_at: '', created_by: '', attendee_count: 0, category: 'Event' }),
  updateExistingEvent: async () => ({ id: '', club_id: '', name: '', description: '', start_time: '', end_time: '', created_at: '', created_by: '', attendee_count: 0, category: 'Event' }),
  removeEvent: async () => {},
  respondToClubEvent: async () => ({ id: '', event_id: '', user_id: '', status: 'going', created_at: '', updated_at: '', profile: null }),
  createNewPost: async () => ({ id: '', club_id: '', user_id: '', content: '', created_at: '', updated_at: '', profile: null }),
  removePost: async () => {},
  sendNewMessage: async () => ({ id: '', club_id: '', user_id: '', content: '', created_at: '', is_pinned: false, profile: null }),
  togglePinMessage: async () => {},
  getUserClubRole: () => null,
  upgradeToMembership: async () => ({}),
  purchaseProduct: async () => ({}),
  updateMemberRole: async () => ({ id: '', club_id: '', user_id: '', role: 'member', status: 'active', joined_at: '', profile: null, membership_type: 'free' }),
});

export const useClub = () => useContext(ClubContext);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [channels, setChannels] = useState<ClubChannel[]>([]);
  const [products, setProducts] = useState<ClubProduct[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [currentEvent, setCurrentEvent] = useState<ClubEvent | null>(null);
  const [currentEventParticipants, setCurrentEventParticipants] = useState<EventParticipant[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingClubEvents, setLoadingClubEvents] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(true);

  const { user } = useAuth();

  const refreshClubs = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingClubs(true);
      
      const { data: allClubs, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (clubsError) throw clubsError;
      
      const typedClubs: Club[] = (allClubs || []).map(club => ({
        ...club,
        club_type: club.club_type as any,
        membership_type: club.membership_type as any,
        created_by: club.creator_id || '',
      }));
      
      setClubs(typedClubs);
      
      const { data: membershipData, error: membershipError } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'active');
        
      if (membershipError) throw membershipError;
      
      if (membershipData && membershipData.length > 0) {
        const clubIds = membershipData.map(membership => membership.club_id);
        
        const { data: userClubsData, error: userClubsError } = await supabase
          .from('clubs')
          .select('*')
          .in('id', clubIds);
          
        if (userClubsError) throw userClubsError;
        
        const typedUserClubs: Club[] = (userClubsData || []).map(club => ({
          ...club,
          club_type: club.club_type as any,
          membership_type: club.membership_type as any,
          created_by: club.creator_id || '',
        }));
        
        setUserClubs(typedUserClubs);
      } else {
        setUserClubs([]);
      }
      
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoadingClubs(false);
    }
  }, [user]);

  const loadClubEvents = useCallback(async (clubId: string) => {
    if (!clubId) return;
    
    try {
      setLoadingClubEvents(true);
      
      const { data: events, error } = await supabase
        .from('club_events')
        .select('*')
        .eq('club_id', clubId)
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      setClubEvents(events || []);
    } catch (error) {
      console.error('Error loading club events:', error);
      setClubEvents([]);
    } finally {
      setLoadingClubEvents(false);
    }
  }, []);

  const loadEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('club_events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      setCurrentEvent(data as ClubEvent);
      
      if (data) {
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', data.club_id)
          .single();
          
        if (!clubError && clubData) {
          setCurrentClub({
            ...clubData,
            club_type: clubData.club_type as any,
            membership_type: clubData.membership_type as any,
            created_by: clubData.creator_id || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setCurrentEvent(null);
    }
  }, []);

  const loadEventParticipants = useCallback(async (eventId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*, profile:user_id(*)')
        .eq('event_id', eventId);
      
      if (error) throw error;
      
      const typedParticipants = (data || []).map(participant => ({
        ...participant,
        created_at: participant.joined_at || new Date().toISOString(),
        updated_at: participant.joined_at ? new Date().toISOString() : undefined,
        status: participant.status as EventParticipationStatus,
        profile: participant.profile || null
      } as EventParticipant));
      
      setCurrentEventParticipants(typedParticipants);
    } catch (error) {
      console.error('Error loading event participants:', error);
      setCurrentEventParticipants([]);
    }
  }, []);

  const isUserEventParticipant = useCallback((eventId: string): boolean => {
    if (!user) return false;
    return currentEventParticipants.some(
      participant => participant.user_id === user.id && participant.event_id === eventId
    );
  }, [user, currentEventParticipants]);

  const respondToClubEvent = useCallback(async (eventId: string, status: EventParticipationStatus): Promise<EventParticipant> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data: existingResponse } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();
      
      if (existingResponse) {
        const { data, error } = await supabase
          .from('event_participants')
          .update({ status })
          .eq('id', existingResponse.id)
          .select()
          .single();
          
        if (error) throw error;
        
        const participant: EventParticipant = {
          ...data,
          id: data.id,
          event_id: data.event_id,
          user_id: data.user_id,
          status: data.status as EventParticipationStatus,
          created_at: data.joined_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: null
        };
        
        return participant;
      } else {
        const { data, error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status
          })
          .select()
          .single();
          
        if (error) throw error;
        
        const participant: EventParticipant = {
          ...data,
          id: data.id,
          event_id: data.event_id,
          user_id: data.user_id,
          status: data.status as EventParticipationStatus,
          created_at: data.joined_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: null
        };
        
        return participant;
      }
    } catch (error) {
      console.error('Error responding to event:', error);
      throw error;
    }
  }, [user]);

  const joinEvent = useCallback(async (eventId: string, status: EventParticipationStatus): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await respondToClubEvent(eventId, status);
      
      await loadEventParticipants(eventId);
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  }, [user, respondToClubEvent, loadEventParticipants]);

  const leaveEvent = useCallback(async (eventId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      await loadEventParticipants(eventId);
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  }, [user, loadEventParticipants]);

  const refreshChannels = useCallback(async () => {
    if (!currentClub) return;
    
    try {
      setLoadingChannels(true);
      
      const { data, error } = await supabase
        .from('club_channels')
        .select('*')
        .eq('club_id', currentClub.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoadingChannels(false);
    }
  }, [currentClub]);

  const isUserClubMember = useCallback((clubId: string) => {
    if (!user) return false;
    return userClubs.some(club => club.id === clubId);
  }, [user, userClubs]);

  const isUserClubAdmin = useCallback((clubId: string) => {
    if (!user) return false;
    return userClubs.some(club => club.id === clubId && club.created_by === user.id);
  }, [user, userClubs]);

  const isUserClubCreator = useCallback((clubId: string) => {
    if (!user || !currentClub) return false;
    return currentClub.created_by === user.id;
  }, [user, currentClub]);

  const joinCurrentClub = useCallback(async () => {
    if (!user || !currentClub) {
      throw new Error('User or club not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('club_members')
        .insert({
          club_id: currentClub.id,
          user_id: user.id,
          role: 'member',
          status: 'active',
          membership_type: 'free' as MembershipType
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        role: data.role as MemberRole,
        status: data.status as MemberStatus,
        membership_type: data.membership_type as MembershipType
      } as ClubMember;
    } catch (error) {
      console.error('Error joining club:', error);
      throw error;
    }
  }, [user, currentClub]);

  const leaveCurrentClub = useCallback(async () => {
    if (!user || !currentClub) {
      throw new Error('User or club not available');
    }
    
    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', currentClub.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error leaving club:', error);
      throw error;
    }
  }, [user, currentClub]);

  const createClubEvent = useCallback(async (eventData: any): Promise<ClubEvent | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('club_events')
        .insert({
          ...eventData,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating club event:', error);
      return null;
    }
  }, [user]);

  const createNewEvent = useCallback(async (eventData: any): Promise<ClubEvent> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('club_events')
        .insert({
          ...eventData,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }, [user]);

  const updateExistingEvent = useCallback(async (eventId: string, eventData: any): Promise<ClubEvent> => {
    try {
      const { data, error } = await supabase
        .from('club_events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }, []);

  const removeEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('club_events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }, []);

  const createNewPost = useCallback(async (postData: any): Promise<ClubPost> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('club_posts')
        .insert({
          ...postData,
          user_id: postData.user_id || user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }, [user]);

  const removePost = useCallback(async (postId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('club_posts')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }, []);

  const sendNewMessage = useCallback(async (messageData: any): Promise<ClubMessage> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('club_messages')
        .insert({
          ...messageData,
          user_id: messageData.user_id || user.id,
          is_pinned: false
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user]);

  const togglePinMessage = useCallback(async (messageId: string, isPinned: boolean): Promise<void> => {
    try {
      const { error } = await supabase
        .from('club_messages')
        .update({ is_pinned: isPinned })
        .eq('id', messageId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling message pin:', error);
      throw error;
    }
  }, []);

  const getUserClubRole = useCallback((clubId: string, userId?: string): MemberRole | null => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;
    
    const member = members.find(m => m.club_id === clubId && m.user_id === targetUserId);
    return member ? member.role : null;
  }, [user, members]);

  const upgradeToMembership = useCallback(async (membershipId: string): Promise<any> => {
    return {};
  }, []);

  const purchaseProduct = useCallback(async (productId: string): Promise<any> => {
    return {};
  }, []);

  const updateMemberRole = useCallback(async (memberId: string, role: MemberRole): Promise<ClubMember> => {
    try {
      const { data, error } = await supabase
        .from('club_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        role: data.role as MemberRole,
        status: data.status as MemberStatus,
        membership_type: data.membership_type as MembershipType
      } as ClubMember;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }, []);

  const refreshMembers = useCallback(async () => {
    if (!currentClub) return;
    
    try {
      setLoadingMembers(true);
      
      const { data, error } = await supabase
        .from('club_members')
        .select('*, profile:user_id(*)')
        .eq('club_id', currentClub.id);
      
      if (error) throw error;
      
      const typedMembers = (data || []).map(member => ({
        ...member,
        role: member.role as MemberRole,
        status: member.status as MemberStatus,
        membership_type: member.membership_type as MembershipType
      }));
      
      setMembers(typedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  }, [currentClub]);

  const refreshPosts = useCallback(async () => {
    if (!currentClub) return;
    
    try {
      setLoadingPosts(true);
      
      const { data, error } = await supabase
        .from('club_posts')
        .select('*, profile:user_id(*)')
        .eq('club_id', currentClub.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, [currentClub]);

  const refreshMessages = useCallback(async () => {
    if (!currentClub) return;
    
    try {
      setLoadingMessages(true);
      
      const { data, error } = await supabase
        .from('club_messages')
        .select('*, profile:user_id(*)')
        .eq('club_id', currentClub.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentClub]);

  const refreshEvents = useCallback(async () => {
    if (!currentClub) return;
    
    try {
      setLoadingEvents(true);
      
      const { data, error } = await supabase
        .from('club_events')
        .select('*')
        .eq('club_id', currentClub.id)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoadingEvents(false);
    }
  }, [currentClub]);
  
  const refreshProducts = useCallback(async () => {
    if (!currentClub) return;
    
    try {
      const { data, error } = await supabase
        .from('club_products')
        .select('*')
        .eq('club_id', currentClub.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const typedProducts = (data || []).map(product => ({
        ...product,
        product_type: product.product_type as ProductType
      }));
      
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [currentClub]);
  
  const createNewClub = useCallback(async (clubData: any): Promise<Club> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          name: clubData.name,
          description: clubData.description,
          club_type: clubData.club_type || 'fitness',
          membership_type: clubData.membership_type || 'free',
          premium_price: clubData.premium_price,
          creator_id: user.id,
          logo_url: clubData.logo_url,
          banner_url: clubData.banner_url
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const typedClub: Club = {
        ...data,
        created_by: data.creator_id,
        club_type: data.club_type as any,
        membership_type: data.membership_type as any
      };
      
      return typedClub;
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshClubs();
    } else {
      setClubs([]);
      setUserClubs([]);
      setCurrentClub(null);
    }
  }, [user, refreshClubs]);

  return (
    <ClubContext.Provider
      value={{
        clubs,
        userClubs,
        clubEvents,
        events,
        members,
        posts,
        messages,
        channels,
        products,
        currentClub,
        currentEvent,
        currentEventParticipants,
        loadingClubs,
        loadingClubEvents,
        loadingEvents,
        loadingMembers,
        loadingPosts,
        loadingMessages,
        loadingChannels,
        setCurrentClub,
        refreshClubs,
        refreshMembers,
        refreshProducts,
        refreshPosts,
        refreshMessages,
        refreshEvents,
        refreshChannels,
        loadClubEvents,
        loadEvent,
        loadEventParticipants,
        createClubEvent,
        isUserClubMember,
        isUserClubAdmin,
        isUserClubCreator,
        isUserEventParticipant,
        joinCurrentClub,
        leaveCurrentClub,
        joinEvent,
        leaveEvent,
        createNewClub,
        createNewEvent,
        updateExistingEvent,
        removeEvent,
        respondToClubEvent,
        createNewPost,
        removePost,
        sendNewMessage,
        togglePinMessage,
        getUserClubRole,
        upgradeToMembership,
        purchaseProduct,
        updateMemberRole
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export default ClubProvider;
