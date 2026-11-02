import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  getProfiles,
  getActiveUserId,
  setActiveUserId as persistActiveUserId,
  clearActiveUserId,
  createProfile as persistCreateProfile,
  updateProfile as persistUpdateProfile,
} from '../data/dataAccess';
import { updateProfileRemote } from '../data/supabaseDataAccess';
import { useAuth } from './AuthContext';
import { DemoUserContext, DemoUserContextType } from './DemoUserContextInstance';

export type { DemoUserContextType };
export { DemoUserContext };

export const DemoUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, profile: authProfile, isRealAuth, isLoading: authLoading, signOut: authSignOut, refreshProfile: authRefreshProfile } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>(() => getProfiles());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveUserId());

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  // Clear demo activeId whenever real authenticated user session is active
  useEffect(() => {
    if (authUser && activeId) {
      setActiveId(null);
      clearActiveUserId();
    }
  }, [authUser, activeId]);

  // When real Supabase user is logged in, their verified database profile is the ONLY authorized identity.
  // Real authenticated users never receive demo personas, and user_metadata is NEVER trusted for role authorization!
  const currentUser: UserProfile | null = authUser
    ? authProfile
    : activeId
    ? (profiles.find((p) => p.id === activeId) || null)
    : null;

  const switchUser = (userId: string) => {
    if (isRealAuth) {
      authSignOut();
    }
    setActiveId(userId);
    persistActiveUserId(userId);
  };

  const login = (userId: string) => {
    if (isRealAuth) {
      authSignOut();
    }
    setActiveId(userId);
    persistActiveUserId(userId);
  };

  const logout = () => {
    if (isRealAuth) {
      authSignOut();
    }
    setActiveId(null);
    clearActiveUserId();
  };

  const registerUser = (data: Omit<UserProfile, 'id'>): UserProfile => {
    const newProfile = persistCreateProfile(data);
    const updated = getProfiles();
    setProfiles(updated);
    setActiveId(newProfile.id);
    return newProfile;
  };

  const updateProfile = (updates: Partial<UserProfile>): UserProfile | undefined => {
    if (!currentUser) return undefined;

    if (isRealAuth && authUser) {
      updateProfileRemote(authUser.id, updates)
        .then(() => authRefreshProfile())
        .catch((err) => console.error('Failed to update remote profile:', err));
      return { ...currentUser, ...updates };
    }

    const updated = persistUpdateProfile(currentUser.id, updates);
    if (updated) {
      const refreshed = getProfiles();
      setProfiles(refreshed);
    }
    return updated;
  };

  const isFarmer = currentUser?.role === 'farmer';
  const isBuyer = currentUser?.role === 'buyer';
  const isGuest = !authUser && currentUser === null;

  return (
    <DemoUserContext.Provider
      value={{
        currentUser,
        allProfiles: profiles,
        switchUser,
        login,
        logout,
        registerUser,
        updateProfile,
        isFarmer,
        isBuyer,
        isGuest,
        isRealAuth,
        isLoading: authLoading,
      }}
    >
      {children}
    </DemoUserContext.Provider>
  );
};
