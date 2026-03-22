import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GamificationData {
  dailyGoal: number;
  streak: number;
  lastReadDate: string | null;
  badges: string[];
  totalReadingMinutes: number;
}

export const BADGE_DEFINITIONS = [
  { id: 'newbie_reader', label: 'İlk Adım', icon: 'footsteps-outline', color: '#B0BEC5' },
  { id: '1_hour_reader', label: '1 Saatlik Okur', icon: 'time-outline', color: '#81C784' },
  { id: '10_hour_reader', label: 'Kitap Kurdu', icon: 'book', color: '#4FC3F7' },
  { id: '7_day_streak', label: 'Haftalık Seri', icon: 'flame', color: '#FFB74D' },
  { id: '30_day_streak', label: 'Ayın Okuru', icon: 'trophy', color: '#FFD54F' },
  { id: 'night_owl', label: 'Gece Kuşu', icon: 'moon', color: '#9575CD' },
];

interface GamificationContextType {
  data: GamificationData;
  updateDailyGoal: (minutes: number) => Promise<void>;
  addReadingMinutes: (minutes: number) => Promise<void>;
  awardBadge: (badgeId: string) => Promise<void>;
  incrementStreak: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const STORAGE_KEY = '@gamification_data_v1';

const DEFAULT_DATA: GamificationData = {
  dailyGoal: 30,
  streak: 0,
  lastReadDate: null,
  badges: ['newbie_reader'],
  totalReadingMinutes: 0
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<GamificationData>(DEFAULT_DATA);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Let's check if the streak is broken
        if (parsed.lastReadDate) {
          const lastDate = new Date(parsed.lastReadDate);
          const today = new Date();
          lastDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil(Math.abs(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            parsed.streak = 0; // Streak broken
          }
        }
        setData({ ...DEFAULT_DATA, ...parsed });
      } else {
        setData(DEFAULT_DATA);
      }
    } catch (e) {
      console.error('Failed to load gamification data', e);
    }
  };

  const saveData = async (newData: GamificationData) => {
    try {
      setData(newData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save gamification data', e);
    }
  };

  const updateDailyGoal = async (minutes: number) => {
    await saveData({ ...data, dailyGoal: minutes });
  };

  const incrementStreak = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = data.streak;
    
    // Only increment once per day
    if (data.lastReadDate !== todayStr) {
      newStreak += 1;
    }
    
    let newBadges = [...data.badges];
    if (newStreak >= 7 && !newBadges.includes('7_day_streak')) newBadges.push('7_day_streak');
    if (newStreak >= 30 && !newBadges.includes('30_day_streak')) newBadges.push('30_day_streak');

    await saveData({ ...data, streak: newStreak, lastReadDate: todayStr, badges: newBadges });
  };

  const addReadingMinutes = async (minutes: number) => {
    const total = data.totalReadingMinutes + minutes;
    let newBadges = [...data.badges];
    
    if (total >= 60 && !newBadges.includes('1_hour_reader')) newBadges.push('1_hour_reader');
    if (total >= 600 && !newBadges.includes('10_hour_reader')) newBadges.push('10_hour_reader');

    const hour = new Date().getHours();
    if ((hour >= 23 || hour < 4) && !newBadges.includes('night_owl')) {
      newBadges.push('night_owl');
    }

    await saveData({ ...data, totalReadingMinutes: total, badges: newBadges });
  };

  const awardBadge = async (badgeId: string) => {
    if (!data.badges.includes(badgeId)) {
      await saveData({ ...data, badges: [...data.badges, badgeId] });
    }
  };

  return (
    <GamificationContext.Provider value={{ data, updateDailyGoal, addReadingMinutes, awardBadge, incrementStreak }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
