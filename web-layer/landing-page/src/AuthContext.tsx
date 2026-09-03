import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { USER_SERVICE_URL } from './api';

interface User {
  id: string;
  email: string;
  role: string;
  organizationName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      if (storedUser) setUser(JSON.parse(storedUser));
      
      // Fetch fresh user data in background
      fetch(`${USER_SERVICE_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch(console.error);
    }
  }, []);

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
