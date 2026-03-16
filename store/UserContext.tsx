import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  taste_profile?: any;
  intellectual_identity?: {
    title: string;
    description: string;
    traits: string[];
    analysisDate: string;
  } | null;
}

interface UserContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile load error:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (e) {
      console.error('Failed to save profile', e);
      throw e;
    }
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
