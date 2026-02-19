
import quranData from '@/mock/quran.json';

export interface Surah {
  id: string;
  index: number;
  nameArabic: string;
  nameEnglish: string;
  ayahCount: number;
}

export interface Juz {
  id: string;
  index: number;
  startSurah: string;
  startAyah: number;
  description: string;
}

export const quranService = {
  getSurahs: async (): Promise<Surah[]> => {
    return quranData.surahs;
  },
  getJuzs: async (): Promise<Juz[]> => {
    return quranData.juzs;
  },
  searchQuran: async (query: string) => {
    const q = query.toLowerCase();
    return quranData.surahs.filter(s => s.nameEnglish.toLowerCase().includes(q));
  }
};
