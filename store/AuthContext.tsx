import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseUrl } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  connectionError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signInWithApple: () => Promise<boolean>;
  signInAsGuest: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractAuthParams = (url: string) => {
  const [baseUrl, hashFragment = ''] = url.split('#');
  const queryString = baseUrl.includes('?') ? baseUrl.split('?')[1] : '';
  const params = new URLSearchParams([queryString, hashFragment].filter(Boolean).join('&'));

  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    code: params.get('code'),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      WebBrowser.maybeCompleteAuthSession();
    }

    if (!supabaseUrl) {
      setConnectionError('Supabase URL bulunamadı. .env dosyasını kontrol edin.');
    }

    if (!supabase || !supabase.auth) {
      console.error('Supabase client not properly initialized!');
      setConnectionError('Supabase istemcisi başlatılamadı.');
    }

    const getInitialSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase Session Error:', error.message);
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (err) {
        console.error('Auth Init Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, currentSession: any) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeOAuthSession = async (provider: 'google' | 'apple') => {
    const redirectTo = Linking.createURL('/');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('OAuth yönlendirme adresi alınamadı.');

    if (Platform.OS === 'web') {
      const webLocation = typeof globalThis !== 'undefined' ? globalThis.location : undefined;
      if (!webLocation) {
        throw new Error('Web yönlendirmesi başlatılamadı.');
      }
      webLocation.assign(data.url);
      return false;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== 'success' || !result.url) {
      if (result.type === 'cancel' || result.type === 'dismiss') {
        return false;
      }
      throw new Error('Sosyal giriş tamamlanamadı.');
    }

    const { accessToken, refreshToken, code } = extractAuthParams(result.url);

    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
      return true;
    }

    if (!accessToken || !refreshToken) {
      throw new Error('Oturum bilgileri alınamadı.');
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) throw sessionError;
    return true;
  };

  const signInWithGoogle = async () => {
    return completeOAuthSession('google');
  };

  const signInWithApple = async () => {
    return completeOAuthSession('apple');
  };

  const signInAsGuest = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        connectionError,
        signInWithGoogle,
        signInWithApple,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
