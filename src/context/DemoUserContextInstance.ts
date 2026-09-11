import { createContext } from 'react';
import type { Profile } from '../types';

export interface DemoUserContextType {
  currentProfile: Profile;
  allProfiles: Profile[];
  switchProfile: (profileId: string) => void;
  switchRole: (role: 'farmer' | 'buyer') => void;
  resetDemoData: () => void;
  isFarmer: boolean;
  isBuyer: boolean;
  dataRevision: number;
}

export const DemoUserContext = createContext<DemoUserContextType | undefined>(undefined);
