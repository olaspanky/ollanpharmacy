"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded: User & { exp?: number } = JSON.parse(jsonPayload);

        // Check for required fields (_id, name, email)
        if (decoded._id && decoded.name && decoded.email) {
          // Validate token expiration
          if (decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            if (decoded.exp < currentTime) {
              console.warn('JWT is expired');
              localStorage.removeItem('token');
              setUser(null);
              return;
            }
          }
          setUser(decoded);
          // Optional: Store user in localStorage for consistency
          localStorage.setItem('user', JSON.stringify(decoded));
        } else {
          console.error('Invalid JWT payload: missing required fields (_id, name, email)');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Optional, since user is derived from token
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};