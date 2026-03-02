import React, { createContext, useContext, useState } from 'react';
import api from './api';

type Role = 'admin' | 'guard' | 'resident';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  wing: string;       // "A" | "B" | "C" | "D"
  flatNumber: string;       // raw flat number, e.g. "803" (residents only)
  fullFlat: string | null; // "A-803" for residents, null otherwise
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    wing: string;
    flatNumber: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ── Initialize synchronously from sessionStorage (no useEffect race condition) ──
  // sessionStorage is tab-isolated: each tab keeps its own login session.
  // Lazy initializer runs once on mount, BEFORE the first render — so ProtectedRoute
  // always has the correct user on the first paint and never redirects incorrectly.
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem('user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));

  // loading is false from the start because we initialise synchronously above.
  // We keep it in the context shape for API compatibility but it never blocks.
  const [loading] = useState(false);


  const persist = (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    sessionStorage.setItem('token', jwt);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwt } = res.data;
    persist(userData, jwt);
  };

  const register = async (data: {
    name: string; email: string; password: string;
    role: Role; wing: string; flatNumber: string;
  }) => {
    const res = await api.post('/auth/register', data);
    const { user: userData, token: jwt } = res.data;
    persist(userData, jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
