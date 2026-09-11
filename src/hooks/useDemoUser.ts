import { useContext } from 'react';
import { DemoUserContext } from '../context/DemoUserContextInstance';
import type { DemoUserContextType } from '../context/DemoUserContextInstance';

export function useDemoUser(): DemoUserContextType {
  const context = useContext(DemoUserContext);
  if (!context) {
    throw new Error('useDemoUser must be used within a DemoUserProvider');
  }
  return context;
}
