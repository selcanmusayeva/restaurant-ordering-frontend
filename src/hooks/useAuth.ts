import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { UserRole } from '../types';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const useAuth = () => {
  const { user, token, loading } = useAppSelector(state => state.auth);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    setAuthState({
      user,
      isAuthenticated: !!token,
      loading
    });
  }, [user, token, loading]);

  return authState;
};

export default useAuth; 