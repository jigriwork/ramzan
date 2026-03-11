
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
  notifPrayer: boolean;
  notifIftar: boolean;
  notifDua: boolean;
  notifKids: boolean;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  setCity: (city: string) => void;
  setLanguage: (lang: Language) => void;
  setShowTransliteration: (show: boolean) => void;
  setArabicFontSize: (size: FontSize) => void;
  setUiTextSize: (size: FontSize) => void;
  setNotifPrayer: (value: boolean) => void;
  setNotifIftar: (value: boolean) => void;
  setNotifDua: (value: boolean) => void;
  setNotifKids: (value: boolean) => void;
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
  notifPrayer: 'app_notif_prayer',
  notifIftar: 'app_notif_iftar',
  notifDua: 'app_notif_dua',
  notifKids: 'app_notif_kids',
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
  const [notifPrayer, setNotifPrayerState] = useState<boolean>(true);
  const [notifIftar, setNotifIftarState] = useState<boolean>(true);
  const [notifDua, setNotifDuaState] = useState<boolean>(false);
  const [notifKids, setNotifKidsState] = useState<boolean>(true);

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
      notifPrayer: localStorage.getItem(STORAGE_KEYS.notifPrayer) === null ? true : localStorage.getItem(STORAGE_KEYS.notifPrayer) === 'true',
      notifIftar: localStorage.getItem(STORAGE_KEYS.notifIftar) === null ? true : localStorage.getItem(STORAGE_KEYS.notifIftar) === 'true',
      notifDua: localStorage.getItem(STORAGE_KEYS.notifDua) === null ? false : localStorage.getItem(STORAGE_KEYS.notifDua) === 'true',
      notifKids: localStorage.getItem(STORAGE_KEYS.notifKids) === null ? true : localStorage.getItem(STORAGE_KEYS.notifKids) === 'true',
    };

    if (saved.theme) setThemeState(saved.theme);
    if (saved.mode) setModeState(saved.mode);
    if (saved.city) setCityState(saved.city);
    if (saved.language) setLanguageState(saved.language);
    setShowTransliterationState(saved.trans);
    if (saved.fontSize) setArabicFontSizeState(saved.fontSize);
    if (saved.uiSize) setUiTextSizeState(saved.uiSize);
    setNotifPrayerState(saved.notifPrayer);
    setNotifIftarState(saved.notifIftar);
    setNotifDuaState(saved.notifDua);
    setNotifKidsState(saved.notifKids);
  };

  const cacheSettings = (patch: Partial<{
    theme: Theme;
    mode: Mode;
    city: string;
    language: Language;
    transliteration: boolean;
    arabicFontSize: FontSize;
    uiTextSize: FontSize;
    notifPrayer: boolean;
    notifIftar: boolean;
    notifDua: boolean;
    notifKids: boolean;
  }>) => {
    if (typeof window === 'undefined') return;
    if (patch.theme !== undefined) localStorage.setItem(STORAGE_KEYS.theme, patch.theme);
    if (patch.mode !== undefined) localStorage.setItem(STORAGE_KEYS.mode, patch.mode);
    if (patch.city !== undefined) localStorage.setItem(STORAGE_KEYS.city, patch.city);
    if (patch.language !== undefined) localStorage.setItem(STORAGE_KEYS.language, patch.language);
    if (patch.transliteration !== undefined) localStorage.setItem(STORAGE_KEYS.transliteration, String(patch.transliteration));
    if (patch.arabicFontSize !== undefined) localStorage.setItem(STORAGE_KEYS.arabicFontSize, patch.arabicFontSize);
    if (patch.uiTextSize !== undefined) localStorage.setItem(STORAGE_KEYS.uiTextSize, patch.uiTextSize);
    if (patch.notifPrayer !== undefined) localStorage.setItem(STORAGE_KEYS.notifPrayer, String(patch.notifPrayer));
    if (patch.notifIftar !== undefined) localStorage.setItem(STORAGE_KEYS.notifIftar, String(patch.notifIftar));
    if (patch.notifDua !== undefined) localStorage.setItem(STORAGE_KEYS.notifDua, String(patch.notifDua));
    if (patch.notifKids !== undefined) localStorage.setItem(STORAGE_KEYS.notifKids, String(patch.notifKids));
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
          notifPrayer: boolean;
          notifIftar: boolean;
          notifDua: boolean;
          notifKids: boolean;
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

        const settings = (data.settings && typeof data.settings === 'object') ? (data.settings as Record<string, unknown>) : null;
        const notifPrayerRaw = settings?.notif_prayer;
        const notifIftarRaw = settings?.notif_iftar;
        const notifDuaRaw = settings?.notif_dua;
        const notifKidsRaw = settings?.notif_kids;

        if (typeof notifPrayerRaw === 'boolean') {
          setNotifPrayerState(notifPrayerRaw);
          patch.notifPrayer = notifPrayerRaw;
        }
        if (typeof notifIftarRaw === 'boolean') {
          setNotifIftarState(notifIftarRaw);
          patch.notifIftar = notifIftarRaw;
        }
        if (typeof notifDuaRaw === 'boolean') {
          setNotifDuaState(notifDuaRaw);
          patch.notifDua = notifDuaRaw;
        }
        if (typeof notifKidsRaw === 'boolean') {
          setNotifKidsState(notifKidsRaw);
          patch.notifKids = notifKidsRaw;
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

  const persistNotificationSettings = (next: {
    notifPrayer: boolean;
    notifIftar: boolean;
    notifDua: boolean;
    notifKids: boolean;
  }) => {
    cacheSettings(next);
    saveToFirestore({
      settings: {
        notif_prayer: next.notifPrayer,
        notif_iftar: next.notifIftar,
        notif_dua: next.notifDua,
        notif_kids: next.notifKids,
      }
    });
  };

  const setNotifPrayer = (value: boolean) => {
    setNotifPrayerState(value);
    persistNotificationSettings({ notifPrayer: value, notifIftar, notifDua, notifKids });
  };

  const setNotifIftar = (value: boolean) => {
    setNotifIftarState(value);
    persistNotificationSettings({ notifPrayer, notifIftar: value, notifDua, notifKids });
  };

  const setNotifDua = (value: boolean) => {
    setNotifDuaState(value);
    persistNotificationSettings({ notifPrayer, notifIftar, notifDua: value, notifKids });
  };

  const setNotifKids = (value: boolean) => {
    setNotifKidsState(value);
    persistNotificationSettings({ notifPrayer, notifIftar, notifDua, notifKids: value });
  };

  return (
    <AppSettingsContext.Provider value={{
      theme, mode, city, language, showTransliteration, arabicFontSize, uiTextSize,
      notifPrayer, notifIftar, notifDua, notifKids,
      setTheme, setMode, setCity, setLanguage, setShowTransliteration, setArabicFontSize, setUiTextSize,
      setNotifPrayer, setNotifIftar, setNotifDua, setNotifKids,
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
