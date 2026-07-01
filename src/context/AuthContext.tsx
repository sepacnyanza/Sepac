/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (
    email: string | {
      email: string;
      password?: string;
      pass?: string;
      name: string;
      graduation_year: string;
      phone?: string;
      avatar_url?: string;
    }, 
    pass?: string, 
    name?: string, 
    graduation_year?: string, 
    phone?: string, 
    avatar_url?: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: {
    name: string;
    graduation_year: string;
    bio: string;
    phone?: string;
    avatar_url?: string;
  }) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sepac_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have a saved token, fetch profile on startup
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': authToken
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
      } else {
        // Token has expired or is invalid
        logout();
      }
    } catch (e) {
      console.error('Error fetching user profile', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password: pass })
      });
      
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.profile);
        localStorage.setItem('sepac_token', data.token);
        return true;
      } else {
        setError(data.error || 'Authentication failed');
        return false;
      }
    } catch (e) {
      setError('Connection to backend server failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    emailOrData: string | {
      email: string;
      password?: string;
      pass?: string;
      name: string;
      graduation_year: string;
      phone?: string;
      avatar_url?: string;
    }, 
    pass?: string, 
    name?: string, 
    graduation_year?: string, 
    phone?: string, 
    avatar_url?: string
  ): Promise<boolean> => {
    setError(null);
    setLoading(true);

    let finalEmail = '';
    let finalPass = '';
    let finalName = '';
    let finalGrad = '';
    let finalPhone = '';
    let finalAvatar = '';

    if (typeof emailOrData === 'object' && emailOrData !== null) {
      finalEmail = emailOrData.email || '';
      finalPass = emailOrData.password || emailOrData.pass || '';
      finalName = emailOrData.name || '';
      finalGrad = emailOrData.graduation_year || '';
      finalPhone = emailOrData.phone || '';
      finalAvatar = emailOrData.avatar_url || '';
    } else {
      finalEmail = (emailOrData as string) || '';
      finalPass = pass || '';
      finalName = name || '';
      finalGrad = graduation_year || '';
      finalPhone = phone || '';
      finalAvatar = avatar_url || '';
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: finalEmail, 
          password: finalPass, 
          name: finalName, 
          graduation_year: finalGrad, 
          phone: finalPhone || undefined, 
          avatar_url: finalAvatar || undefined 
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.profile);
        localStorage.setItem('sepac_token', data.token);
        return true;
      } else {
        setError(data.error || 'Registration failed');
        return false;
      }
    } catch (e) {
      setError('Connection to backend server failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': token
        }
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('sepac_token');
    setError(null);
  };

  const updateProfile = async (data: {
    name: string;
    graduation_year: string;
    bio: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<boolean> => {
    if (!token) return false;
    setError(null);
    try {
      const res = await fetch('/api/auth/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      if (res.ok) {
        setUser(resData.profile);
        return true;
      } else {
        setError(resData.error || 'Failed to update profile');
        return false;
      }
    } catch (e) {
      setError('Server update failed');
      return false;
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchUserProfile(token);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      refreshProfile,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
