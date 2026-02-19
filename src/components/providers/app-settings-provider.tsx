
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInAnonymously, getAuth } from 'firebase/auth';

type Theme = 'light' | 'dark' | 'system';
type Mode = 'adult' | 'kids';

interface AppSettingsContextType {
  theme: Theme;
  mode: Mode;
  city: string;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  setCity: (city: string) => void;
  ensureGuestAuth: () => Promise<string>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const db = useFirestore();
  const auth = getAuth();
  
  const [theme, setThemeState] = useState<Theme>('light');
  const [mode, setModeState] = useState<Mode>('adult');
  const [city, setCityState] = useState<string>('');

  // Initial load from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedMode = localStorage.getItem('mode') as Mode;
    const savedCity = localStorage.getItem('city');

    if (savedTheme) setThemeState(savedTheme);
    if (savedMode) setModeState(savedMode);
    if (savedCity) setCityState(savedCity);
  }, []);

  // sync from Firestore if user is logged in
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.theme) setThemeState(data.theme);
          if (data.mode) setModeState(data.mode);
          if (data.city) setCityState(data.city);
        }
      });
    }
  }, [user, db]);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const ensureGuestAuth = async () => {
    if (auth.currentUser) return auth.currentUser.uid;
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      updateDocumentNonBlocking(userRef, { theme: newTheme });
    }
  };

  const setMode = async (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem('mode', newMode);
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      updateDocumentNonBlocking(userRef, { mode: newMode });
    }
  };

  const setCity = async (newCity: string) => {
    setCityState(newCity);
    localStorage.setItem('city', newCity);
    const uid = await ensureGuestAuth();
    const userRef = doc(db, 'users', uid);
    setDoc(userRef, { city: newCity, updatedAt: new Date().toISOString() }, { merge: true });
  };

  return (
    <AppSettingsContext.Provider value={{ theme, mode, city, setTheme, setMode, setCity, ensureGuestAuth }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return context;
};
