
export type AppSettings = {
  language: 'en' | 'ur' | 'hi';
  transliteration: boolean;
  arabicFontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
  calculationMethod: number;
  madhhab: 'hanafi' | 'shafi';
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  transliteration: true,
  arabicFontSize: 'medium',
  theme: 'light',
  calculationMethod: 1,
  madhhab: 'hanafi',
};

function normalizeSettings(input: unknown): AppSettings {
  if (!input || typeof input !== 'object') return DEFAULT_SETTINGS;
  const raw = input as Partial<AppSettings>;

  return {
    language: raw.language === 'en' || raw.language === 'ur' || raw.language === 'hi' ? raw.language : DEFAULT_SETTINGS.language,
    transliteration: typeof raw.transliteration === 'boolean' ? raw.transliteration : DEFAULT_SETTINGS.transliteration,
    arabicFontSize: raw.arabicFontSize === 'small' || raw.arabicFontSize === 'medium' || raw.arabicFontSize === 'large' ? raw.arabicFontSize : DEFAULT_SETTINGS.arabicFontSize,
    theme: raw.theme === 'light' || raw.theme === 'dark' || raw.theme === 'system' ? raw.theme : DEFAULT_SETTINGS.theme,
    calculationMethod: typeof raw.calculationMethod === 'number' && Number.isFinite(raw.calculationMethod) ? raw.calculationMethod : DEFAULT_SETTINGS.calculationMethod,
    madhhab: raw.madhhab === 'hanafi' || raw.madhhab === 'shafi' ? raw.madhhab : DEFAULT_SETTINGS.madhhab,
  };
}

export const settingsService = {
  getSettings: (): AppSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const saved = localStorage.getItem('app_settings_v2');
    if (!saved) return DEFAULT_SETTINGS;
    try {
      return normalizeSettings(JSON.parse(saved));
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  getCalculationMethod: (): number => {
    return settingsService.getSettings().calculationMethod;
  },
  saveSettings: (settings: Partial<AppSettings>) => {
    if (typeof window === 'undefined') return;
    const current = settingsService.getSettings();
    const next = normalizeSettings({ ...current, ...settings });
    localStorage.setItem('app_settings_v2', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('app-settings-updated', { detail: settings }));
  }
};
