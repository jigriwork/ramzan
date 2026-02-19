
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';

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

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mode, setModeState] = useState<Mode>('adult');
  const [city, setCityState] = useState<string>('Berhampur');
  const [language, setLanguageState] = useState<Language>('en');
  const [showTransliteration, setShowTransliterationState] = useState<boolean>(true);
  const [arabicFontSize, setArabicFontSizeState] = useState<FontSize>('medium');
  const [uiTextSize, setUiTextSizeState] = useState<FontSize>('medium');

  useEffect(() => {
    const saved = {
      theme: localStorage.getItem('app_theme') as Theme,
      mode: localStorage.getItem('app_mode') as Mode,
      city: localStorage.getItem('app_city'),
      language: localStorage.getItem('app_lang') as Language,
      trans: localStorage.getItem('app_trans') === 'false' ? false : true,
      fontSize: localStorage.getItem('app_font_size') as FontSize,
      uiSize: localStorage.getItem('app_ui_size') as FontSize,
    };

    if (saved.theme) setThemeState(saved.theme);
    if (saved.mode) setModeState(saved.mode);
    if (saved.city) setCityState(saved.city);
    if (saved.language) setLanguageState(saved.language);
    setShowTransliterationState(saved.trans);
    if (saved.fontSize) setArabicFontSizeState(saved.fontSize);
    if (saved.uiSize) setUiTextSizeState(saved.uiSize);
  }, []);

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

  const setTheme = (val: Theme) => { setThemeState(val); localStorage.setItem('app_theme', val); };
  const setMode = (val: Mode) => { setModeState(val); localStorage.setItem('app_mode', val); };
  const setCity = (val: string) => { setCityState(val); localStorage.setItem('app_city', val); };
  const setLanguage = (val: Language) => { setLanguageState(val); localStorage.setItem('app_lang', val); };
  const setShowTransliteration = (val: boolean) => { setShowTransliterationState(val); localStorage.setItem('app_trans', String(val)); };
  const setArabicFontSize = (val: FontSize) => { setArabicFontSizeState(val); localStorage.setItem('app_font_size', val); };
  const setUiTextSize = (val: FontSize) => { setUiTextSizeState(val); localStorage.setItem('app_ui_size', val); };

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
