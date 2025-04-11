import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Club, ClubEvent } from '@/types/club';

interface ClubContextType {
  clubs: Club[];
  userClubs: Club[];
  clubEvents: ClubEvent[];
  currentClub: Club | null;
  loadingClubs: boolean;
  loadingClubEvents: boolean;
  setCurrentClub: (club: Club | null) => void;
  refreshClubs: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  loadClubEvents: (clubId: string) => Promise<void>;
  createClubEvent: (eventData: any) => Promise<ClubEvent | null>;
}

const ClubContext = createContext<ClubContextType>({
  clubs: [],
  userClubs: [],
  clubEvents: [],
  currentClub: null,
  loadingClubs: true,
  loadingClubEvents: true,
  setCurrentClub: () => {},
  refreshClubs: async () => {},
  refreshMembers: async () => {},
  refreshProducts: async () => {},
  loadClubEvents: async () => {},
  createClubEvent: async () => null,
});

export const useClub = () => useContext(ClubContext);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingClubEvents, setLoadingClubEvents] = useState(true);
  
  const { user } = useAuth();
  
  const refreshClubs = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingClubs(true);
      
      // Fetch all clubs
      const { data: allClubs, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (clubsError) throw clubsError;
      setClubs(allClubs || []);
      
      // Fetch user's clubs
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
        setUserClubs(userClubsData || []);
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
  
  const refreshMembers = async () => {
    if (!currentClub) return;
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('club_id', currentClub.id);
  
      if (error) {
        console.error("Error fetching club members:", error);
      } else {
        // setClubMembers(data || []); // If you have a state for members
      }
    } catch (error) {
      console.error("Error fetching club members:", error);
    }
  };

  const refreshProducts = async () => {
    if (!currentClub) return;
    try {
      const { data, error } = await supabase
        .from('club_products')
        .select('*')
        .eq('club_id', currentClub.id);
  
      if (error) {
        console.error("Error fetching club products:", error);
      } else {
        // setClubProducts(data || []); // If you have a state for products
      }
    } catch (error) {
      console.error("Error fetching club products:", error);
    }
  };
  
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
        currentClub,
        loadingClubs,
        loadingClubEvents,
        setCurrentClub,
        refreshClubs,
        refreshMembers,
        refreshProducts,
        loadClubEvents,
        createClubEvent,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};
