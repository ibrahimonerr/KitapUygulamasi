import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  adminId: string; // ID of the person who created the club
}

interface ClubsContextType {
  myClubs: Club[];
  createClub: (clubData: Partial<Club>) => void;
  deleteClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
  isLoading: boolean;
}

const ClubsContext = createContext<ClubsContextType | undefined>(undefined);

const STORAGE_KEY = '@clubs_data_v2';

const MY_USER_ID = 'user_unique_id_123';

const INITIAL_CLUBS: Club[] = [
  {
    id: '1',
    name: 'Tutunamayanlar Okuma Grubu',
    description: 'Selim Işık\'ın izinde, hayatı ve edebiyatı sorguladığımız derinlikli bir yolculuk. Her hafta belirlenen bölümler üzerine Bilge Rehber eşliğinde beyin fırtınası yapıyoruz.',
    type: 'book',
    privacy: 'public',
    bookTitle: 'Tutunamayanlar',
    author: 'Oğuz Atay',
    members: 42,
    progress: 12,
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=3087&auto=format&fit=crop',
    deadline: '10 gün kaldı',
    targetPage: 120,
    adminId: 'admin_id_other', // For testing leave club
  },
  {
    id: '2',
    name: 'Pazar Okumaları',
    description: 'Bireysel okuma yolculuklarımızı birleştirdiğimiz butik bir topluluk. Herkes kendi kitabıyla derinleşirken, aldığımız notlar ve alıntılarla birbirimize ilham oluyoruz.',
    type: 'friends',
    privacy: 'private',
    members: 5,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=3000&auto=format&fit=crop',
    adminId: MY_USER_ID, // My own club for testing delete
  }
];

export const ClubsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myClubs, setMyClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMyClubs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load clubs', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveClubs = async (clubs: Club[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(clubs));
    } catch (e) {
      console.error('Failed to save clubs', e);
    }
  };

  const createClub = (clubData: Partial<Club>) => {
    const newClub: Club = {
      id: Math.random().toString(36).substring(7),
      name: clubData.name || 'Yeni Kulüp',
      description: clubData.description || '',
      type: clubData.type || 'book',
      privacy: clubData.privacy || 'public',
      bookTitle: clubData.type === 'book' ? 'Kitap Seçilmedi' : undefined,
      author: clubData.type === 'book' ? 'Yazar Bilinmiyor' : undefined,
      members: 1,
      progress: clubData.type === 'book' ? 0 : undefined,
      cover: clubData.cover || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=3087&auto=format&fit=crop',
      adminId: MY_USER_ID,
      ...clubData
    } as Club;

    const updatedClubs = [newClub, ...myClubs];
    setMyClubs(updatedClubs);
    saveClubs(updatedClubs);
  };

  const deleteClub = (clubId: string) => {
    const updatedClubs = myClubs.filter(c => c.id !== clubId);
    setMyClubs(updatedClubs);
    saveClubs(updatedClubs);
  };

  const leaveClub = (clubId: string) => {
    const updatedClubs = myClubs.filter(c => c.id !== clubId);
    setMyClubs(updatedClubs);
    saveClubs(updatedClubs);
  };

  return (
    <ClubsContext.Provider value={{ myClubs, createClub, deleteClub, leaveClub, isLoading }}>
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
