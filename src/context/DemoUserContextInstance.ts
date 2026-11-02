import { createContext } from 'react';
import { UserProfile } from '../types';

export interface DemoUserContextType {
  currentUser: UserProfile | null;
  allProfiles: UserProfile[];
  switchUser: (userId: string) => void;
  login: (userId: string) => void;
  logout: () => void;
  registerUser: (data: Omit<UserProfile, 'id'>) => UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => UserProfile | undefined;
  isFarmer: boolean;
  isBuyer: boolean;
  isGuest: boolean;
  isRealAuth?: boolean;
  isLoading?: boolean;
}

export const DemoUserContext = createContext<DemoUserContextType | undefined>(undefined);
