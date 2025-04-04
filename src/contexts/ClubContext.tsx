import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Club, 
  ClubMember, 
  ClubEvent, 
  EventParticipant,
  ClubPost,
  ClubPostComment,
  ClubMessage,
  MembershipType,
  MemberRole,
  MemberStatus,
  EventParticipationStatus,
  ClubProduct,
  ClubProductPurchase
} from '@/types/club';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  fetchClubs,
  fetchClubById, 
  createClub, 
  updateClub, 
  deleteClub,
  fetchClubMembers,
  joinClub,
  updateMemberRole as updateMemberRoleService,
  leaveClub,
  getUserClubs,
  fetchClubEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  respondToEvent,
  fetchEventParticipants,
  fetchClubPosts,
  createPost,
  deletePost,
  fetchPostComments,
  createComment,
  deleteComment,
  fetchClubMessages,
  sendMessage,
  pinMessage,
  subscribeToClubMessages,
  updateMembership,
  fetchClubProducts,
  purchaseClubProduct
} from '@/services/clubService';
import { safelyGetProfile } from '@/utils/profileUtils';
import { supabase } from '@/integrations/supabase/client';

interface ClubContextType {
  // Clubs
  clubs: Club[];
  userClubs: { membership: ClubMember; club: Club }[];
  loadingClubs: boolean;
  currentClub: Club | null;
  setCurrentClub: (club: Club | null) => void;
  refreshClubs: () => Promise<void>;
  createNewClub: (club: Omit<Club, 'id' | 'created_at' | 'updated_at'>) => Promise<Club>;
  updateExistingClub: (id: string, updates: Partial<Club>) => Promise<Club>;
  removeClub: (id: string) => Promise<boolean>;
  
  // Members
  members: ClubMember[];
  loadingMembers: boolean;
  refreshMembers: () => Promise<void>;
  joinCurrentClub: (membershipType?: MembershipType) => Promise<ClubMember>;
  leaveCurrentClub: () => Promise<boolean>;
  updateMemberRole: (memberId: string, role: MemberRole) => Promise<ClubMember>;
  upgradeToMembership: (clubId: string, membershipType: MembershipType) => Promise<ClubMember | null>;
  
  // Events
  events: ClubEvent[];
  loadingEvents: boolean;
  refreshEvents: () => Promise<void>;
  createNewEvent: (event: Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<ClubEvent>;
  updateExistingEvent: (id: string, updates: Partial<Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>>) => Promise<ClubEvent>;
  removeEvent: (id: string) => Promise<boolean>;
  respondToClubEvent: (eventId: string, status: EventParticipationStatus) => Promise<EventParticipant>;
  
  // Products
  products: ClubProduct[];
  loadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<ClubProductPurchase>;
  
  // Posts
  posts: ClubPost[];
  loadingPosts: boolean;
  refreshPosts: () => Promise<void>;
  createNewPost: (post: Omit<ClubPost, 'id' | 'created_at' | 'updated_at' | 'profile'>) => Promise<ClubPost>;
  removePost: (id: string) => Promise<boolean>;
  
  // Comments
  loadComments: (postId: string) => Promise<ClubPostComment[]>;
  createNewComment: (comment: Omit<ClubPostComment, 'id' | 'created_at' | 'updated_at' | 'profile'>) => Promise<ClubPostComment>;
  removeComment: (id: string) => Promise<boolean>;
  
  // Messages
  messages: ClubMessage[];
  loadingMessages: boolean;
  refreshMessages: () => Promise<void>;
  sendNewMessage: (content: string) => Promise<ClubMessage>;
  togglePinMessage: (id: string, isPinned: boolean) => Promise<ClubMessage>;
  
  // Utility
  isUserClubMember: (clubId: string) => boolean;
  getUserClubRole: (clubId: string) => MemberRole | null;
  isUserClubAdmin: (clubId: string) => boolean;
  isUserClubCreator: (clubId: string) => boolean;
}

const ClubContext = createContext<ClubContextType>({} as ClubContextType);

export const ClubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<{ membership: ClubMember; club: Club }[]>([]);
  const [loadingClubs, setLoadingClubs] = useState<boolean>(true);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  
  const [products, setProducts] = useState<ClubProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  useEffect(() => {
    refreshClubs();
  }, [user]);
  
  useEffect(() => {
    if (currentClub) {
      refreshMembers();
      refreshEvents();
      refreshProducts();
      refreshPosts();
      refreshMessages();
      
      const unsubscribe = subscribeToClubMessages(currentClub.id, (newMessage) => {
        setMessages(prev => [newMessage, ...prev]);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [currentClub]);
  
  const refreshClubs = async () => {
    try {
      setLoadingClubs(true);
      const clubData = await fetchClubs();
      setClubs(clubData);
      
      if (user) {
        try {
          console.log("Fetching user clubs for user:", user.id);
          const userClubData = await getUserClubs();
          console.log("User club data:", userClubData);
          setUserClubs(userClubData);
        } catch (error) {
          console.error('Error fetching user clubs:', error);
          setUserClubs([]);
        }
      } else {
        setUserClubs([]);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };
  
  const createNewClub = async (clubData: Omit<Club, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newClub = await createClub(clubData);
      setClubs(prev => [newClub, ...prev]);
      return newClub;
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error('Failed to create club');
      throw error;
    }
  };
  
  const updateExistingClub = async (id: string, updates: Partial<Club>) => {
    try {
      const updatedClub = await updateClub(id, updates);
      setClubs(prev => prev.map(club => club.id === id ? updatedClub : club));
      
      if (currentClub?.id === id) {
        setCurrentClub(updatedClub);
      }
      
      return updatedClub;
    } catch (error) {
      console.error('Error updating club:', error);
      toast.error('Failed to update club');
      throw error;
    }
  };
  
  const removeClub = async (id: string) => {
    try {
      await deleteClub(id);
      setClubs(prev => prev.filter(club => club.id !== id));
      
      if (currentClub?.id === id) {
        setCurrentClub(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting club:', error);
      toast.error('Failed to delete club');
      throw error;
    }
  };
  
  const refreshMembers = async () => {
    if (!currentClub) return;
    
    try {
      setLoadingMembers(true);
      console.log("Fetching members for club:", currentClub.id);
      const memberData = await fetchClubMembers(currentClub.id);
      console.log("Club members data:", memberData);
      setMembers(memberData);
    } catch (error) {
      console.error('Error fetching club members:', error);
      toast.error('Failed to load club members');
    } finally {
      setLoadingMembers(false);
    }
  };
  
  const joinCurrentClub = async (membershipType: MembershipType = 'free') => {
    if (!currentClub || !user) {
      console.log(`[ClubContext] joinCurrentClub: No club or user`, { 
        hasCurrentClub: !!currentClub,
        hasUser: !!user
      });
      toast.error('You must be logged in to join a club');
      throw new Error('Cannot join club: either no club selected or user not logged in');
    }
    
    try {
      console.log(`[ClubContext] User ${user.id} joining club ${currentClub.id} with membership ${membershipType}`);
      console.log(`[ClubContext] Current userClubs before join:`, userClubs);
      
      const alreadyMember = isUserClubMember(currentClub.id);
      if (alreadyMember) {
        console.log(`[ClubContext] User is already a member of this club`);
        
        const existingMembership = userClubs.find(uc => uc.club.id === currentClub.id)?.membership;
        if (existingMembership) {
          return existingMembership;
        }
      }
      
      console.log(`[ClubContext] Calling edge function to join club`);
      const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
        body: {
          sqlName: 'join_club',
          params: {
            club_id: currentClub.id,
            user_id: user.id,
            membership_type: membershipType
          }
        }
      });
      
      if (error) {
        console.error(`[ClubContext] Error from edge function:`, error);
        throw error;
      }
      
      console.log(`[ClubContext] Join club edge function result:`, data);
      
      if (data) {
        const membership = {
          id: data.id,
          club_id: data.club_id,
          user_id: data.user_id,
          role: data.role as MemberRole,
          status: data.status as MemberStatus,
          membership_type: data.membership_type as MembershipType,
          joined_at: data.joined_at,
        } as ClubMember;
        
        console.log(`[ClubContext] Adding new membership to members state:`, membership);
        setMembers(prev => [...prev, membership]);
        
        if (currentClub) {
          const userClub = {
            membership,
            club: currentClub
          };
          
          setUserClubs(prev => {
            const exists = prev.some(uc => uc.club.id === currentClub.id);
            if (exists) {
              return prev.map(uc => 
                uc.club.id === currentClub.id ? userClub : uc
              );
            } else {
              return [...prev, userClub];
            }
          });
        }
        
        console.log(`[ClubContext] Refreshing clubs to update userClubs`);
        await refreshClubs();
      }
      
      console.log(`[ClubContext] Checking membership after join`);
      const isMember = isUserClubMember(currentClub.id);
      console.log(`[ClubContext] After join, isUserClubMember returns: ${isMember}`);
      
      return data;
    } catch (error) {
      console.error('[ClubContext] Error joining club:', error);
      toast.error('Failed to join club');
      throw error;
    }
  };
  
  const updateMemberRole = async (memberId: string, role: MemberRole) => {
    try {
      const updatedMember = await updateMemberRoleService(memberId, role);
      setMembers(prev => prev.map(member => member.id === memberId ? updatedMember : member));
      return updatedMember;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
      throw error;
    }
  };
  
  const leaveCurrentClub = async () => {
    if (!currentClub || !user) {
      throw new Error('Cannot leave club: either no club selected or user not logged in');
    }
    
    try {
      await leaveClub(currentClub.id);
      setMembers(prev => prev.filter(member => member.user_id !== user.id));
      refreshClubs(); // To update userClubs
      toast.success(`You've left ${currentClub.name}`);
      return true;
    } catch (error) {
      console.error('Error leaving club:', error);
      toast.error('Failed to leave club');
      throw error;
    }
  };
  
  const refreshEvents = async () => {
    if (!currentClub) return;
    
    try {
      setLoadingEvents(true);
      const eventData = await fetchClubEvents(currentClub.id);
      setEvents(eventData);
    } catch (error) {
      console.error('Error fetching club events:', error);
      toast.error('Failed to load club events');
    } finally {
      setLoadingEvents(false);
    }
  };
  
  const createNewEvent = async (event: Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEvent = await createEvent(event);
      setEvents(prev => [...prev, newEvent]);
      toast.success('Event created successfully');
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  };
  
  const updateExistingEvent = async (id: string, updates: Partial<Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const updatedEvent = await updateEvent(id, updates);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      toast.success('Event updated successfully');
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };
  
  const removeEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      throw error;
    }
  };
  
  const respondToClubEvent = async (eventId: string, status: EventParticipationStatus) => {
    if (!user) {
      toast.error('You must be logged in to respond to events');
      throw new Error('User not logged in');
    }
    
    try {
      const response = await respondToEvent(eventId, status);
      
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          const updatedParticipants = event.participants || [];
          const existingParticipantIndex = updatedParticipants.findIndex(p => p.user_id === user.id);
          
          if (existingParticipantIndex >= 0) {
            updatedParticipants[existingParticipantIndex] = response;
          } else {
            updatedParticipants.push(response);
          }
          
          return { ...event, participants: updatedParticipants };
        }
        return event;
      }));
      
      toast.success(`You're ${status === 'going' ? 'attending' : status === 'maybe' ? 'maybe attending' : 'not attending'} the event`);
      return response;
    } catch (error) {
      console.error('Error responding to event:', error);
      toast.error('Failed to respond to event');
      throw error;
    }
  };
  
  const refreshProducts = async () => {
    if (!currentClub) return;
    
    try {
      setLoadingProducts(true);
      const productData = await fetchClubProducts(currentClub.id);
      setProducts(productData);
    } catch (error) {
      console.error('Error fetching club products:', error);
      toast.error('Failed to load club products');
    } finally {
      setLoadingProducts(false);
    }
  };
  
  const purchaseProduct = async (productId: string) => {
    if (!user) {
      toast.error('You must be logged in to purchase products');
      throw new Error('Cannot purchase product: user not logged in');
    }
    
    try {
      const purchase = await purchaseClubProduct(productId);
      toast.success('Product purchased successfully!');
      return purchase;
    } catch (error) {
      console.error('Error purchasing product:', error);
      toast.error('Failed to purchase product');
      throw error;
    }
  };
  
  const upgradeToMembership = async (clubId: string, membershipType: MembershipType) => {
    if (!user) {
      toast.error('You must be logged in to upgrade membership');
      throw new Error('Cannot upgrade membership: user not logged in');
    }
    
    if (membershipType === 'premium') {
      return null;
    }
    
    try {
      const updatedMember = await updateMembership(clubId, membershipType);
      
      setMembers(prev => prev.map(member => 
        member.user_id === user.id ? updatedMember : member
      ));
      
      refreshClubs();
      
      return updatedMember;
    } catch (error) {
      console.error('Error upgrading membership:', error);
      toast.error('Failed to upgrade membership');
      throw error;
    }
  };
  
  const refreshPosts = async () => {
    if (!currentClub) return;
    
    try {
      setLoadingPosts(true);
      const postData = await fetchClubPosts(currentClub.id);
      setPosts(postData);
    } catch (error) {
      console.error('Error fetching club posts:', error);
      toast.error('Failed to load club posts');
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const createNewPost = async (post: Omit<ClubPost, 'id' | 'created_at' | 'updated_at' | 'profile'>) => {
    try {
      const newPost = await createPost(post);
      setPosts(prev => [newPost, ...prev]);
      toast.success('Post created successfully');
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      throw error;
    }
  };
  
  const removePost = async (id: string) => {
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Post deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
      throw error;
    }
  };
  
  const loadComments = async (postId: string) => {
    try {
      const comments = await fetchPostComments(postId);
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
      throw error;
    }
  };
  
  const createNewComment = async (comment: Omit<ClubPostComment, 'id' | 'created_at' | 'updated_at' | 'profile'>) => {
    try {
      const newComment = await createComment(comment);
      
      setPosts(prev => prev.map(post => {
        if (post.id === comment.post_id) {
          const comments = post.comments || [];
          return { ...post, comments: [...comments, newComment] };
        }
        return post;
      }));
      
      return newComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to create comment');
      throw error;
    }
  };
  
  const removeComment = async (id: string) => {
    try {
      await deleteComment(id);
      
      setPosts(prev => prev.map(post => {
        if (post.comments?.some(comment => comment.id === id)) {
          return {
            ...post,
            comments: post.comments.filter(comment => comment.id !== id)
          };
        }
        return post;
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      throw error;
    }
  };
  
  const refreshMessages = async () => {
    if (!currentClub) return;
    
    try {
      setLoadingMessages(true);
      const messageData = await fetchClubMessages(currentClub.id);
      setMessages(messageData);
    } catch (error) {
      console.error('Error fetching club messages:', error);
      toast.error('Failed to load club messages');
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const sendNewMessage = async (content: string) => {
    if (!currentClub || !user) {
      toast.error('You must be logged in to send messages');
      throw new Error('Cannot send message: either no club selected or user not logged in');
    }
    
    try {
      const newMessage = await sendMessage({
        club_id: currentClub.id,
        user_id: user.id,
        content
      });
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };
  
  const togglePinMessage = async (id: string, isPinned: boolean) => {
    try {
      const updatedMessage = await pinMessage(id, isPinned);
      setMessages(prev => prev.map(message => message.id === id ? { ...message, is_pinned: isPinned } : message));
      toast.success(`Message ${isPinned ? 'pinned' : 'unpinned'} successfully`);
      return updatedMessage;
    } catch (error) {
      console.error('Error pinning/unpinning message:', error);
      toast.error(`Failed to ${isPinned ? 'pin' : 'unpin'} message`);
      throw error;
    }
  };
  
  const isUserClubMember = (clubId: string): boolean => {
    if (!user) {
      console.log(`[ClubContext] isUserClubMember: No user logged in`);
      return false;
    }
    
    console.log(`[ClubContext] isUserClubMember checking:`, {
      clubId,
      userId: user.id,
      userClubsCount: userClubs.length,
      userClubs: userClubs.map(uc => ({ 
        clubId: uc.club.id,
        isMatch: uc.club.id === clubId 
      })),
    });
    
    const result = userClubs.some(uc => uc.club.id === clubId);
    console.log(`[ClubContext] isUserClubMember result for club ${clubId}:`, result);
    return result;
  };
  
  const getUserClubRole = (clubId: string): MemberRole | null => {
    if (!user) return null;
    const membership = userClubs.find(uc => uc.club.id === clubId)?.membership;
    return membership ? membership.role : null;
  };
  
  const isUserClubAdmin = (clubId: string): boolean => {
    const role = getUserClubRole(clubId);
    return role === 'admin' || role === 'moderator';
  };
  
  const isUserClubCreator = (clubId: string): boolean => {
    if (!user) return false;
    const club = clubs.find(c => c.id === clubId);
    return club ? club.creator_id === user.id : false;
  };
  
  const value: ClubContextType = {
    clubs,
    userClubs,
    loadingClubs,
    currentClub,
    setCurrentClub,
    refreshClubs,
    createNewClub,
    updateExistingClub,
    removeClub,
    
    members,
    loadingMembers,
    refreshMembers,
    joinCurrentClub,
    leaveCurrentClub,
    updateMemberRole,
    upgradeToMembership,
    
    events,
    loadingEvents,
    refreshEvents,
    createNewEvent,
    updateExistingEvent,
    removeEvent,
    respondToClubEvent,
    
    products,
    loadingProducts,
    refreshProducts,
    purchaseProduct,
    
    posts,
    loadingPosts,
    refreshPosts,
    createNewPost,
    removePost,
    
    loadComments,
    createNewComment,
    removeComment,
    
    messages,
    loadingMessages,
    refreshMessages,
    sendNewMessage,
    togglePinMessage,
    
    isUserClubMember,
    getUserClubRole,
    isUserClubAdmin,
    isUserClubCreator
  };
  
  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
};

export const useClub = () => useContext(ClubContext);
