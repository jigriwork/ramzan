
import quranData from '@/mock/quran.json';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

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

export interface Ayah {
  id: string;
  surahId: string;
  ayahNo: number;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ur?: string;
  translation_hi?: string;
}

const isDev = process.env.NODE_ENV === 'development';

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

async function fetchSurahsFromFirestore(): Promise<Surah[]> {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'quran_surahs'), orderBy('index', 'asc')));
  return snap.docs.map((d) => d.data() as Surah);
}

async function fetchAyahsBySurahFromFirestore(surahId: string): Promise<Ayah[]> {
  const db = getDb();
  const snap = await getDocs(
    query(collection(db, 'quran_ayahs'), where('surahId', '==', surahId), orderBy('ayahNo', 'asc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Ayah, 'id'>) }));
}

export const quranService = {
  getSurahs: async (): Promise<Surah[]> => {
    try {
      const surahs = await fetchSurahsFromFirestore();
      if (surahs.length > 0) return surahs;
    } catch {
      // fallback below
    }

    if (isDev) return quranData.surahs as Surah[];
    return [];
  },
  getJuzs: async (): Promise<Juz[]> => {
    return quranData.juzs;
  },
  getAyahsBySurah: async (surahId: string): Promise<Ayah[]> => {
    try {
      const ayahs = await fetchAyahsBySurahFromFirestore(surahId);
      if (ayahs.length > 0) return ayahs;
    } catch {
      // fallback below
    }

    if (isDev) {
      return ((quranData as any).ayahs || []).filter((a: any) => String(a.surahId) === String(surahId));
    }

    return [];
  },
  searchQuran: async (query: string) => {
    const q = query.toLowerCase();
    const surahs = await quranService.getSurahs();
    return surahs.filter(s => s.nameEnglish.toLowerCase().includes(q));
  }
};
