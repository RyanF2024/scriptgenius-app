'use client';

import { createContext, useContext, ReactNode, useMemo, useReducer } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type AdminState = {
  isSidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
};

type AdminAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

type AdminContextType = {
  state: AdminState;
  toggleSidebar: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, {
    isSidebarOpen: true,
    isLoading: false,
    error: null,
  });

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setLoading = (isLoading: boolean) =>
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  const setError = (error: string | null) =>
    dispatch({ type: 'SET_ERROR', payload: error });

  const value = useMemo(
    () => ({
      state,
      toggleSidebar,
      setLoading,
      setError,
    }),
    [state]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Protected route hook
export function useAdminRoute() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  // Redirect to home if not admin
  React.useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, status, router]);

  return { isAdmin, isLoading: status === 'loading' };
}
