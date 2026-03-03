import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { QURAN_SURAH_META, QURAN_JUZ_META } from '@/lib/data/quran-surah-meta';

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
  startSurahId: string | number;
  startSurah: string;
  startAyah: number;
  description: string;
}

export interface Ayah {
  id: string;
  surahId: string;
  ayahNo: number;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ur?: string;
  translation_hi?: string;
  juz?: number;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export const quranService = {
  getSurahs: async (): Promise<Surah[]> => {
    try {
      const db = getDb();
      const snap = await getDocs(query(collection(db, 'quran_surahs'), orderBy('order', 'asc')));
      if (snap.docs.length === 114) {
        return snap.docs.map((d) => {
          const row = d.data() as any;
          return {
            id: d.id,
            index: row.order,
            nameArabic: row.name_ar,
            nameEnglish: row.name_en,
            ayahCount: row.ayahCount,
          };
        });
      }
    } catch {
      // Ignored, fallback below
    }

    return QURAN_SURAH_META.map((surah: any) => ({
      id: String(surah.id),
      index: surah.order,
      nameArabic: surah.name_ar,
      nameEnglish: surah.name_en,
      ayahCount: surah.ayahCount,
    }));
  },

  getJuzs: async (): Promise<Juz[]> => {
    try {
      const db = getDb();
      const snap = await getDocs(query(collection(db, 'quran_juzs'), orderBy('index', 'asc')));
      if (snap.docs.length === 30) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      }
    } catch {
      // fall through
    }
    return QURAN_JUZ_META.map(j => ({ ...j, startSurahId: String(j.startSurahId) }));
  },

  getAyahsBySurah: async (surahId: string): Promise<Ayah[]> => {
    try {
      const db = getDb();
      const snap = await getDocs(
        query(collection(db, 'quran_ayahs'), where('surahId', '==', surahId), orderBy('ayahNumber', 'asc'))
      );
      if (snap.docs.length > 0) {
        return snap.docs.map((d) => {
          const row = d.data() as any;
          return {
            id: d.id,
            surahId: String(row.surahId ?? surahId),
            ayahNo: Number(row.ayahNumber ?? 0),
            arabic: row.text_ar ?? '',
            transliteration: row.translit_en ?? '',
            translation_en: row.translations?.en ?? '',
            translation_ur: row.translations?.ur ?? '',
            translation_hi: row.translations?.hi ?? '',
            juz: row.juz,
          };
        });
      }
    } catch {
      // Ignored, fallback below
    }

    // Fallback to API if complete data wasn't imported
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.asad,ur.jalandhry,hi.farooq,en.transliteration`);
      const payload = await res.json();
      if (payload.code === 200 && payload.data && payload.data.length === 5) {
        const arAyahs = payload.data[0].ayahs;
        const enAyahs = payload.data[1].ayahs;
        const urAyahs = payload.data[2].ayahs;
        const hiAyahs = payload.data[3].ayahs;
        const transAyahs = payload.data[4].ayahs;

        return arAyahs.map((ar: any, i: number) => ({
          id: String(ar.number),
          surahId: String(surahId),
          ayahNo: ar.numberInSurah,
          arabic: ar.text,
          transliteration: transAyahs[i]?.text || '',
          translation_en: enAyahs[i]?.text || '',
          translation_ur: urAyahs[i]?.text || '',
          translation_hi: hiAyahs[i]?.text || '',
          juz: ar.juz
        }));
      }
    } catch {
      return [];
    }

    return [];
  },

  searchQuran: async (queryStr: string) => {
    const q = queryStr.toLowerCase();
    const surahs = await quranService.getSurahs();
    return surahs.filter(s => s.nameEnglish.toLowerCase().includes(q));
  }
};
