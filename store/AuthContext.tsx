import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  connectionError: string | null;
  signUp: (username: string, password: string, fullName: string) => Promise<any>;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatUsernameToEmail = (username: string) => {
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
  const email = `${cleanUsername}@bilgeokur.com`;
  console.log("Generated Email:", email);
  return email;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthProvider initializing...");
    const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    console.log("- Env URL:", envUrl ? "Defined" : "MISSING");
    
    if (!envUrl) {
      setConnectionError("Supabase URL bulunamadı. .env dosyasını kontrol edin.");
    }

    if (!supabase || !supabase.auth) {
      console.error("Supabase client not properly initialized!");
      setConnectionError("Supabase istemcisi başlatılamadı.");
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase Session Error:", error.message);
        } else {
          console.log("Supabase Session Check: Done", session ? "User active" : "No user");
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username: string, password: string, fullName: string) => {
    const email = formatUsernameToEmail(username);
    
    // 1. Sign up to Supabase Auth
    console.log("Attempting Supabase Auth signUp for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        }
      }
    });

    if (error) {
      console.error("Supabase Auth.signUp error:", error);
      throw error;
    }
    console.log("Supabase Auth.signUp success, user id:", data.user?.id);

    // 2. Create profile entry (Handled via SQL Trigger normally, but manually here for local dev if needed)
    // SQL trigger is better but we can ensure it here
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username,
          full_name: fullName,
        });
      
      if (profileError && profileError.code !== '23505') { // Ignore duplicate key if trigger already ran
        console.error('Profile creation error:', profileError);
      }
    }

    return data;
  };

  const signIn = async (username: string, password: string) => {
    const email = formatUsernameToEmail(username);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, connectionError, signUp, signIn, signOut }}>
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
