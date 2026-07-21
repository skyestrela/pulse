'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  name: string;
  plan: 'free' | 'plus' | 'pro';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { error?: string };
  signup: (email: string, password: string) => { error?: string };
  logout: () => void;
  upgradePlan: (plan: 'free' | 'plus' | 'pro') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_PRO_USER: User = {
  email: 'lucas@pulse.app',
  name: 'Lucas',
  plan: 'pro',
  createdAt: '2026-01-01',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pulse_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  function persist(u: User) {
    setUser(u);
    localStorage.setItem('pulse_user', JSON.stringify(u));
  }

  function login(email: string, password: string): { error?: string } {
    if (!email) return { error: 'Email is required' };
    if (!password) return { error: 'Password is required' };
    const stored = localStorage.getItem('pulse_accounts');
    const accounts: Record<string, { password: string; user: User }> = stored ? JSON.parse(stored) : {};
    const key = email.toLowerCase().trim();

    // Demo account: always allow lucas@pulse.app with any password (or pulse2026)
    if (key === 'lucas@pulse.app') {
      persist(DEMO_PRO_USER);
      if (!accounts[key]) {
        accounts[key] = { password: 'pulse2026', user: DEMO_PRO_USER };
        localStorage.setItem('pulse_accounts', JSON.stringify(accounts));
      }
      return {};
    }

    // Existing account: validate password
    if (accounts[key]) {
      if (accounts[key].password !== password) {
        return { error: 'Incorrect password' };
      }
      persist(accounts[key].user);
      return {};
    }

    // New email: auto-create pro account
    const newUser: User = {
      email: key,
      name: key.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      plan: 'pro',
      createdAt: new Date().toISOString().split('T')[0],
    };
    accounts[key] = { password, user: newUser };
    localStorage.setItem('pulse_accounts', JSON.stringify(accounts));
    persist(newUser);
    return {};
  }

  function signup(email: string, password: string): { error?: string } {
    if (!email) return { error: 'Email is required' };
    if (password.length < 8) return { error: 'Password must be at least 8 characters' };

    const key = email.toLowerCase().trim();
    const stored = localStorage.getItem('pulse_accounts');
    const accounts: Record<string, { password: string; user: User }> = stored ? JSON.parse(stored) : {};

    if (accounts[key]) return { error: 'Account already exists. Please log in.' };

    const newUser: User = {
      email: key,
      name: key.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      plan: 'pro', // Everyone starts Pro for now (early access)
      createdAt: new Date().toISOString().split('T')[0],
    };

    accounts[key] = { password, user: newUser };
    localStorage.setItem('pulse_accounts', JSON.stringify(accounts));
    persist(newUser);
    return {};
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('pulse_user');
    router.push('/auth/login');
  }

  function upgradePlan(plan: 'free' | 'plus' | 'pro') {
    if (!user) return;
    const updated = { ...user, plan };
    persist(updated);
    // Also update accounts
    const stored = localStorage.getItem('pulse_accounts');
    if (stored) {
      const accounts = JSON.parse(stored);
      const key = user.email;
      if (accounts[key]) {
        accounts[key].user = updated;
        localStorage.setItem('pulse_accounts', JSON.stringify(accounts));
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, upgradePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}