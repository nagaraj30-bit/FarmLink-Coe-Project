import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { fetchProfileRemote, mapProfileRow } from '../data/supabaseDataAccess';

export interface SignUpMetadata {
  role: UserRole;
  name: string;
  nameTa?: string;
  phone: string;
  district: string;
  districtTa?: string;
  location: string;
  locationTa?: string;
  avatar?: string;
  fpoMember?: boolean;
  fpoName?: string;
  businessType?: string;
  businessTypeTa?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isRealAuth: boolean;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: Error | null; user: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfile = async (userId: string) => {
    try {
      const p = await fetchProfileRemote(userId);
      setProfile(p);
    } catch (err) {
      console.warn('Could not load remote profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Initial session retrieval
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        loadProfile(initialSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata: SignUpMetadata) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase client is not configured.'), user: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: metadata.role,
            name: metadata.name,
            name_ta: metadata.nameTa || '',
            phone: metadata.phone,
            district: metadata.district,
            district_ta: metadata.districtTa || '',
            location: metadata.location,
            location_ta: metadata.locationTa || '',
            avatar: metadata.avatar || (metadata.role === 'farmer' ? '👨‍🌾' : '🏢'),
            fpo_member: metadata.fpoMember || false,
            fpo_name: metadata.fpoName || null,
            business_type: metadata.businessType || null,
            business_type_ta: metadata.businessTypeTa || null,
          },
        },
      });

      if (error) return { error, user: null };
      if (data.user) {
        // Allow trigger to populate and fetch
        setTimeout(() => loadProfile(data.user!.id), 500);
      }
      return { error: null, user: data.user };
    } catch (err: any) {
      return { error: err, user: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase client is not configured.') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      if (data.user) {
        await loadProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isRealAuth: Boolean(user && profile),
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
