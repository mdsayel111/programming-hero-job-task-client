'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  authApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getStoredUser,
  setStoredUser,
  type User,
} from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'MENTOR';
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      const cachedUser = getStoredUser();

      if (storedToken) {
        setToken(storedToken);
        if (cachedUser) {
          setUser(cachedUser);
        }

        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          setStoredUser(res.data.user);
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          removeAuthToken();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authApi.login(credentials);
    const { user: loggedInUser, token: authToken } = res.data;

    setToken(authToken);
    setUser(loggedInUser);
    setAuthToken(authToken);
    setStoredUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'MENTOR';
  }) => {
    const res = await authApi.register(data);
    const { user: registeredUser, token: authToken } = res.data;

    setToken(authToken);
    setUser(registeredUser);
    setAuthToken(authToken);
    setStoredUser(registeredUser);

    return registeredUser;
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
      setStoredUser(res.data.user);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
