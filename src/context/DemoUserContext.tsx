import React, { useEffect, useState } from 'react';
import {
  getProfiles,
  getActiveProfileId,
  setActiveProfileId,
  resetDemoData as dataLayerReset,
} from '../data/dataAccess';
import type { Profile } from '../types';
import { DemoUserContext } from './DemoUserContextInstance';

export const DemoUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => getProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => getActiveProfileId());
  const [dataRevision, setDataRevision] = useState<number>(0);

  // Sync profiles and data if storage changes, resets, or updates
  useEffect(() => {
    const handleReset = () => {
      const refreshed = getProfiles();
      setProfiles(refreshed);
      setActiveProfileIdState(getActiveProfileId());
      setDataRevision(prev => prev + 1);
    };

    const handleDataUpdate = () => {
      setDataRevision(prev => prev + 1);
    };

    window.addEventListener('farmlink_data_reset', handleReset);
    window.addEventListener('farmlink_data_updated', handleDataUpdate);

    return () => {
      window.removeEventListener('farmlink_data_reset', handleReset);
      window.removeEventListener('farmlink_data_updated', handleDataUpdate);
    };
  }, []);

  const currentProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const switchProfile = (profileId: string) => {
    setActiveProfileIdState(profileId);
    setActiveProfileId(profileId);
    setDataRevision(prev => prev + 1);
  };

  const switchRole = (role: 'farmer' | 'buyer') => {
    const matching = profiles.find(p => p.role === role);
    if (matching) {
      switchProfile(matching.id);
    }
  };

  const resetDemoData = () => {
    dataLayerReset();
    setActiveProfileIdState('farmer-1');
    setDataRevision(prev => prev + 1);
  };

  return (
    <DemoUserContext.Provider
      value={{
        currentProfile,
        allProfiles: profiles,
        switchProfile,
        switchRole,
        resetDemoData,
        isFarmer: currentProfile.role === 'farmer',
        isBuyer: currentProfile.role === 'buyer',
        dataRevision,
      }}
    >
      {children}
    </DemoUserContext.Provider>
  );
};
