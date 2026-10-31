import { useContext } from 'react';
import { DemoUserContext, DemoUserContextType } from '../context/DemoUserContext';

export function useDemoUser(): DemoUserContextType {
  const context = useContext(DemoUserContext);
  if (!context) {
    throw new Error('useDemoUser must be used within a DemoUserProvider');
  }
  return context;
}
