import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

export interface Club {
  id: string;
  name: string;
  description: string;
  type: 'book' | 'friends';
  privacy: 'public' | 'private';
  bookTitle?: string;
  author?: string;
  members: number;
  progress?: number;
  cover?: string;
  deadline?: string;
  targetPage?: number;
  adminId: string;
}

interface ClubsContextType {
  myClubs: Club[];
  createClub: (clubData: Partial<Club>) => Promise<void>;
  deleteClub: (clubId: string) => Promise<void>;
  joinClub: (clubId: string) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
  isUserMember: (clubId: string) => boolean;
  isLoading: boolean;
}

const ClubsContext = createContext<ClubsContextType | undefined>(undefined);

const STORAGE_KEY = '@clubs_data_v2';

const INITIAL_CLUBS: Club[] = [];

export const ClubsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberships, setMemberships] = useState<string[]>([]); // Array of club IDs

  useEffect(() => {
    if (user) {
      loadMemberships();
    } else {
      // Guest mode: load from local storage only
      loadLocalClubs();
    }
  }, [user]);

  const loadLocalClubs = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allClubs = stored ? JSON.parse(stored) : [];
      setMyClubs(allClubs);
      setMemberships(allClubs.map((c: Club) => c.id));
    } catch (e) {
      console.error('Failed to load local clubs', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMemberships = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // 1. Fetch club memberships
      const { data: memberData, error: memberError } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      
      const clubIds = memberData.map(m => m.club_id);
      setMemberships(clubIds);
      
      // 2. Fetch club details from Supabase if possible, fallback to AsyncStorage
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .in('id', clubIds);

      if (!clubError && clubData) {
        setMyClubs(clubData);
      } else {
        // Fallback to legacy AsyncStorage logic
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const allClubs = stored ? JSON.parse(stored) : [];
        const joinedClubs = allClubs.filter((c: Club) => clubIds.includes(c.id));
        setMyClubs(joinedClubs);
      }
    } catch (e) {
      console.error('Failed to load memberships', e);
    } finally {
      setIsLoading(false);
    }
  };

  const createClub = async (clubData: Partial<Club>) => {
    const userId = user?.id || 'guest';
    const clubId = Math.random().toString(36).substring(2, 11);
    const newClub: Club = {
      id: clubId,
      name: clubData.name || 'Yeni Kulüp',
      description: clubData.description || '',
      type: clubData.type || 'book',
      privacy: clubData.privacy || 'public',
      members: 1,
      cover: clubData.cover || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=3087&auto=format&fit=crop',
      adminId: userId,
      ...clubData
    } as Club;

    // Update local state immediately for better UX
    setMyClubs(prev => [newClub, ...prev]);
    setMemberships(prev => [...prev, newClub.id]);

    try {
      if (user) {
        // 1. Try to insert club into Supabase
        await supabase
          .from('clubs')
          .insert({
            id: newClub.id,
            name: newClub.name,
            description: newClub.description,
            type: newClub.type,
            privacy: newClub.privacy,
            cover: newClub.cover,
            admin_id: newClub.adminId,
            members_count: 1
          });

        // 2. Add to club_members
        await supabase
          .from('club_members')
          .insert({
            club_id: newClub.id,
            user_id: user.id,
            role: 'admin'
          });
      }

      // 3. Persistence backup (for both guest and logged in)
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allClubs = stored ? JSON.parse(stored) : [];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newClub, ...allClubs]));
    } catch (e: any) {
      console.warn('Backend sync failed, but club created locally:', e);
    }
  };

  const joinClub = async (clubId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: user.id,
        role: 'member'
      });

    if (error) throw error;

    setMemberships(prev => [...prev, clubId]);
    await loadMemberships(); // Refresh list
  };

  const leaveClub = async (clubId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', user.id);

    if (error) throw error;

    setMemberships(prev => prev.filter(id => id !== clubId));
    setMyClubs(prev => prev.filter(c => c.id !== clubId));
  };

  const deleteClub = async (clubId: string) => {
    // In a real app, this would delete from 'clubs' table
    // For now, we just leave it which effectively removes it from 'myClubs'
    await leaveClub(clubId);
  };

  const isUserMember = (clubId: string) => memberships.includes(clubId);

  return (
    <ClubsContext.Provider value={{ myClubs, createClub, deleteClub, joinClub, leaveClub, isUserMember, isLoading }}>
      {children}
    </ClubsContext.Provider>
  );
};

export const useClubs = () => {
  const context = useContext(ClubsContext);
  if (context === undefined) {
    throw new Error('useClubs must be used within a ClubsProvider');
  }
  return context;
};
