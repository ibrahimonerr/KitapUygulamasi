import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface SocialContextType {
  following: string[]; // IDs of people user follows
  followers: string[]; // IDs of people following the user
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  isLoading: boolean;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSocialData();
    } else {
      setFollowing([]);
      setFollowers([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadSocialData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      
      // Load people I follow
      const { data: followingData, error: fError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (fError) throw fError;
      setFollowing(followingData.map(f => f.following_id));

      // Load people following me
      const { data: followersData, error: flError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (flError) throw flError;
      setFollowers(followersData.map(f => f.follower_id));

    } catch (e) {
      console.error('Failed to load social data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      });

    if (error) throw error;
    setFollowing(prev => [...prev, targetUserId]);
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (error) throw error;
    setFollowing(prev => prev.filter(id => id !== targetUserId));
  };

  const isFollowing = (userId: string) => following.includes(userId);

  return (
    <SocialContext.Provider value={{ following, followers, followUser, unfollowUser, isFollowing, isLoading }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
