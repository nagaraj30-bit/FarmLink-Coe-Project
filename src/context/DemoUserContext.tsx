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
  const { user: authUser, profile: authProfile, isRealAuth, signOut: authSignOut, refreshProfile: authRefreshProfile } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>(() => getProfiles());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveUserId());

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  // When real Supabase user is logged in, their profile is the current user
  const currentUser: UserProfile | null = isRealAuth && authProfile
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
  const isGuest = currentUser === null;

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
      }}
    >
      {children}
    </DemoUserContext.Provider>
  );
};
