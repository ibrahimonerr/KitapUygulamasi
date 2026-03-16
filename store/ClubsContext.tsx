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
      setMyClubs([]);
      setMemberships([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadMemberships = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Fetch club memberships from Supabase
      const { data, error } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const clubIds = data.map(m => m.club_id);
      setMemberships(clubIds);
      
      // In a real production app, we would fetch club details from a 'clubs' table
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allClubs = stored ? JSON.parse(stored) : [];
      
      // Filter clubs where user is a member
      const joinedClubs = allClubs.filter((c: Club) => clubIds.includes(c.id));
      setMyClubs(joinedClubs);
    } catch (e) {
      console.error('Failed to load memberships', e);
    } finally {
      setIsLoading(false);
    }
  };

  const createClub = async (clubData: Partial<Club>) => {
    if (!user) return;
    const newClub: Club = {
      id: Math.random().toString(36).substring(7),
      name: clubData.name || 'Yeni Kulüp',
      description: clubData.description || '',
      type: clubData.type || 'book',
      privacy: clubData.privacy || 'public',
      members: 1,
      cover: clubData.cover || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=3087&auto=format&fit=crop',
      adminId: user.id,
      ...clubData
    } as Club;

    // 1. Add to club_members in Supabase
    const { error } = await supabase
      .from('club_members')
      .insert({
        club_id: newClub.id,
        user_id: user.id,
        role: 'admin'
      });

    if (error) throw error;

    // 2. Update local state
    const updatedClubs = [newClub, ...myClubs];
    setMyClubs(updatedClubs);
    setMemberships(prev => [...prev, newClub.id]);
    
    // Save all clubs to local storage (mock for now)
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const allClubs = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newClub, ...allClubs]));
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
