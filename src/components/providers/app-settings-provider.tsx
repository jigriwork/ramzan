
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ensureAuthForSaving, useFirestore, useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark' | 'system';
type Mode = 'adult' | 'kids';
type Language = 'en' | 'ur' | 'hi';
type FontSize = 'small' | 'medium' | 'large';

interface AppSettingsContextType {
  theme: Theme;
  mode: Mode;
  city: string;
  language: Language;
  showTransliteration: boolean;
  arabicFontSize: FontSize;
  uiTextSize: FontSize;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  setCity: (city: string) => void;
  setLanguage: (lang: Language) => void;
  setShowTransliteration: (show: boolean) => void;
  setArabicFontSize: (size: FontSize) => void;
  setUiTextSize: (size: FontSize) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  theme: 'app_theme',
  mode: 'app_mode',
  city: 'app_city',
  language: 'app_lang',
  transliteration: 'app_trans',
  arabicFontSize: 'app_font_size',
  uiTextSize: 'app_ui_size',
} as const;

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const db = useFirestore();
  const { user } = useUser();
  const [theme, setThemeState] = useState<Theme>('light');
  const [mode, setModeState] = useState<Mode>('adult');
  const [city, setCityState] = useState<string>('Berhampur');
  const [language, setLanguageState] = useState<Language>('en');
  const [showTransliteration, setShowTransliterationState] = useState<boolean>(true);
  const [arabicFontSize, setArabicFontSizeState] = useState<FontSize>('medium');
  const [uiTextSize, setUiTextSizeState] = useState<FontSize>('medium');

  const applyCachedSettings = () => {
    if (typeof window === 'undefined') return;
    const saved = {
      theme: localStorage.getItem(STORAGE_KEYS.theme) as Theme,
      mode: localStorage.getItem(STORAGE_KEYS.mode) as Mode,
      city: localStorage.getItem(STORAGE_KEYS.city),
      language: localStorage.getItem(STORAGE_KEYS.language) as Language,
      trans: localStorage.getItem(STORAGE_KEYS.transliteration) === 'false' ? false : true,
      fontSize: localStorage.getItem(STORAGE_KEYS.arabicFontSize) as FontSize,
      uiSize: localStorage.getItem(STORAGE_KEYS.uiTextSize) as FontSize,
    };

    if (saved.theme) setThemeState(saved.theme);
    if (saved.mode) setModeState(saved.mode);
    if (saved.city) setCityState(saved.city);
    if (saved.language) setLanguageState(saved.language);
    setShowTransliterationState(saved.trans);
    if (saved.fontSize) setArabicFontSizeState(saved.fontSize);
    if (saved.uiSize) setUiTextSizeState(saved.uiSize);
  };

  const cacheSettings = (patch: Partial<{
    theme: Theme;
    mode: Mode;
    city: string;
    language: Language;
    transliteration: boolean;
    arabicFontSize: FontSize;
    uiTextSize: FontSize;
  }>) => {
    if (typeof window === 'undefined') return;
    if (patch.theme !== undefined) localStorage.setItem(STORAGE_KEYS.theme, patch.theme);
    if (patch.mode !== undefined) localStorage.setItem(STORAGE_KEYS.mode, patch.mode);
    if (patch.city !== undefined) localStorage.setItem(STORAGE_KEYS.city, patch.city);
    if (patch.language !== undefined) localStorage.setItem(STORAGE_KEYS.language, patch.language);
    if (patch.transliteration !== undefined) localStorage.setItem(STORAGE_KEYS.transliteration, String(patch.transliteration));
    if (patch.arabicFontSize !== undefined) localStorage.setItem(STORAGE_KEYS.arabicFontSize, patch.arabicFontSize);
    if (patch.uiTextSize !== undefined) localStorage.setItem(STORAGE_KEYS.uiTextSize, patch.uiTextSize);
  };

  useEffect(() => {
    applyCachedSettings();
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        if (cancelled || !snapshot.exists()) return;
        const data = snapshot.data() as Record<string, unknown>;

        const patch: Partial<{
          theme: Theme;
          mode: Mode;
          city: string;
          language: Language;
          transliteration: boolean;
          arabicFontSize: FontSize;
          uiTextSize: FontSize;
        }> = {};

        if (typeof data.theme === 'string') {
          setThemeState(data.theme as Theme);
          patch.theme = data.theme as Theme;
        }
        if (typeof data.mode === 'string') {
          setModeState(data.mode as Mode);
          patch.mode = data.mode as Mode;
        }
        if (typeof data.city === 'string') {
          setCityState(data.city);
          patch.city = data.city;
        }
        if (typeof data.language === 'string') {
          setLanguageState(data.language as Language);
          patch.language = data.language as Language;
        }
        if (typeof data.transliteration === 'boolean') {
          setShowTransliterationState(data.transliteration);
          patch.transliteration = data.transliteration;
        }
        if (typeof data.arabicFontSize === 'string') {
          setArabicFontSizeState(data.arabicFontSize as FontSize);
          patch.arabicFontSize = data.arabicFontSize as FontSize;
        }
        if (typeof data.uiTextSize === 'string') {
          setUiTextSizeState(data.uiTextSize as FontSize);
          patch.uiTextSize = data.uiTextSize as FontSize;
        }

        cacheSettings(patch);
      } catch {
        toast({
          variant: 'destructive',
          title: 'Sync Warning',
          description: 'Failed to load settings from cloud. Using cached settings.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply UI text size scaling to root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    const sizeClass = uiTextSize === 'small' ? 'text-sm' : uiTextSize === 'medium' ? 'text-base' : 'text-lg';
    root.classList.add(sizeClass);
  }, [uiTextSize]);

  const saveToFirestore = (patch: Record<string, unknown>) => {
    void (async () => {
      try {
        const activeUser = await ensureAuthForSaving();
        await setDoc(doc(db, 'users', activeUser.uid), {
          ...patch,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'Could not sync settings to cloud. Changes are cached locally.',
        });
      }
    })();
  };

  const setTheme = (val: Theme) => {
    setThemeState(val);
    cacheSettings({ theme: val });
    saveToFirestore({ theme: val });
  };
  const setMode = (val: Mode) => {
    setModeState(val);
    cacheSettings({ mode: val });
    saveToFirestore({ mode: val });
  };
  const setCity = (val: string) => {
    setCityState(val);
    cacheSettings({ city: val });
    saveToFirestore({ city: val });
  };
  const setLanguage = (val: Language) => {
    setLanguageState(val);
    cacheSettings({ language: val });
    saveToFirestore({ language: val });
  };
  const setShowTransliteration = (val: boolean) => {
    setShowTransliterationState(val);
    cacheSettings({ transliteration: val });
    saveToFirestore({ transliteration: val });
  };
  const setArabicFontSize = (val: FontSize) => {
    setArabicFontSizeState(val);
    cacheSettings({ arabicFontSize: val });
    saveToFirestore({ arabicFontSize: val });
  };
  const setUiTextSize = (val: FontSize) => {
    setUiTextSizeState(val);
    cacheSettings({ uiTextSize: val });
    saveToFirestore({ uiTextSize: val });
  };

  return (
    <AppSettingsContext.Provider value={{ 
      theme, mode, city, language, showTransliteration, arabicFontSize, uiTextSize,
      setTheme, setMode, setCity, setLanguage, setShowTransliteration, setArabicFontSize, setUiTextSize
    }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return context;
};
