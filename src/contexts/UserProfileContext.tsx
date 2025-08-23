'use client';

import { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { Profile } from '@/services/auth/auth.types';
import { authService } from '@/services/auth/auth.service';
import { useAuth } from './AuthContext';

type UserProfileState = {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
};

type UserProfileAction =
  | { type: 'SET_PROFILE_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: Profile | null }
  | { type: 'SET_PROFILE_ERROR'; payload: Error | null };

function userProfileReducer(state: UserProfileState, action: UserProfileAction): UserProfileState {
  switch (action.type) {
    case 'SET_PROFILE_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, error: null };
    case 'SET_PROFILE_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

const initialState: UserProfileState = {
  profile: null,
  isLoading: true,
  error: null,
};

const UserProfileContext = createContext<UserProfileState | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userProfileReducer, initialState);
  const { user } = useAuth();
  const pathname = usePathname();

  // Fetch user profile with retry logic
  const fetchProfile = useCallback(async (userId: string) => {
    const maxRetries = 3;
    let retryCount = 0;

    const attemptFetch = async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_PROFILE_LOADING', payload: true });
        const { data, error } = await authService.getProfile(userId);

        if (error) throw error;
        
        dispatch({ type: 'SET_PROFILE', payload: data });
      } catch (err) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptFetch();
        }
        
        console.error('Error fetching profile after retries:', err);
        dispatch({ 
          type: 'SET_PROFILE_ERROR', 
          payload: err instanceof Error ? err : new Error('Failed to fetch profile') 
        });
      }
    };

    await attemptFetch();
  }, []);

  // Update profile when user changes
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      dispatch({ type: 'SET_PROFILE', payload: null });
      dispatch({ type: 'SET_PROFILE_LOADING', payload: false });
    }
  }, [user?.id, fetchProfile, pathname]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    updateProfile: async (updates: Partial<Profile>) => {
      if (!user?.id) return;
      
      try {
        dispatch({ type: 'SET_PROFILE_LOADING', payload: true });
        const { data, error } = await authService.updateProfile(user.id, updates);
        
        if (error) throw error;
        
        dispatch({ type: 'SET_PROFILE', payload: data });
      } catch (err) {
        console.error('Error updating profile:', err);
        dispatch({ 
          type: 'SET_PROFILE_ERROR', 
          payload: err instanceof Error ? err : new Error('Failed to update profile') 
        });
        throw err;
      } finally {
        dispatch({ type: 'SET_PROFILE_LOADING', payload: false });
      }
    },
    
    refreshProfile: async () => {
      if (user?.id) {
        await fetchProfile(user.id);
      }
    },
  }), [state, user?.id, fetchProfile]);

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// Combined provider for easier usage at the app root
export function AuthAndProfileProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      {children}
    </UserProfileProvider>
  );
}
