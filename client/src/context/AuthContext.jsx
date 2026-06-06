import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('pantrypal_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  });

  const signIn = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      sessionStorage.setItem('pantrypal_user', JSON.stringify(nextUser));
    } else {
      sessionStorage.removeItem('pantrypal_user');
    }
  };

  const signOut = () => {
    setUser(null);
    sessionStorage.removeItem('pantrypal_user');
    sessionStorage.removeItem('pantrypal_token');
  };

  useEffect(() => {
    const token = sessionStorage.getItem('pantrypal_token');
    if (!token || user) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/profile');
        const profile = response?.data?.data?.user;
        if (profile) {
          signIn(profile);
        }
      } catch (error) {
        signOut();
        sessionStorage.removeItem('pantrypal_token');
      }
    };

    fetchProfile();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      // Merge updated fields into the current user object and persist to sessionStorage
      updateUser: (updatedFields) => {
        const merged = { ...user, ...updatedFields };
        setUser(merged);
        sessionStorage.setItem('pantrypal_user', JSON.stringify(merged));
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}