
export type AppSettings = {
  language: 'en' | 'ur' | 'hi';
  transliteration: boolean;
  arabicFontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
  calculationMethod: number;
  madhhab: 'hanafi' | 'shafi';
};

export const settingsService = {
  getSettings: (): AppSettings => {
    if (typeof window === 'undefined') return { language: 'en', transliteration: true, arabicFontSize: 'medium', theme: 'light', calculationMethod: 1, madhhab: 'hanafi' };
    const saved = localStorage.getItem('app_settings_v2');
    return saved ? JSON.parse(saved) : { language: 'en', transliteration: true, arabicFontSize: 'medium', theme: 'light', calculationMethod: 1, madhhab: 'hanafi' };
  },
  saveSettings: (settings: Partial<AppSettings>) => {
    const current = settingsService.getSettings();
    localStorage.setItem('app_settings_v2', JSON.stringify({ ...current, ...settings }));
  }
};
