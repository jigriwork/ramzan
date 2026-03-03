
import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ur?: string;
  translation_hi?: string;
}

export interface DuaCollection {
  id: string;
  title: string;
  image: string;
  duaIds: string[];
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

function parseSafeJsonArray<T>(value: string | null): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fetchDuasFromFirestore(): Promise<Dua[]> {
  try {
    const db = getDb();
    const snap = await getDocs(query(collection(db, 'duas'), orderBy('title', 'asc')));
    return snap.docs.map((d) => {
      const row = d.data() as any;
      return {
        id: d.id,
        title: row.title ?? '',
        category: row.category ?? 'General',
        arabic: row.arabic ?? row.text_ar ?? row.text ?? '',
        transliteration: row.transliteration ?? row.translit_en ?? row.translit ?? '',
        translation_en: row.translation_en ?? row.translations?.en ?? row.translation ?? '',
        translation_ur: row.translation_ur ?? row.translations?.ur,
        translation_hi: row.translation_hi ?? row.translations?.hi,
      } as Dua;
    });
  } catch {
    return [];
  }
}

async function fetchDuaByIdFromFirestore(id: string): Promise<Dua | undefined> {
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, 'duas', id));
    if (!snap.exists()) return undefined;
    const row = snap.data() as any;
    return {
      id: snap.id,
      title: row.title ?? '',
      category: row.category ?? 'General',
      arabic: row.arabic ?? row.text_ar ?? row.text ?? '',
      transliteration: row.transliteration ?? row.translit_en ?? row.translit ?? '',
      translation_en: row.translation_en ?? row.translations?.en ?? row.translation ?? '',
      translation_ur: row.translation_ur ?? row.translations?.ur,
      translation_hi: row.translation_hi ?? row.translations?.hi,
    };
  } catch {
    return undefined;
  }
}

async function fetchCollectionsFromFirestore(): Promise<DuaCollection[]> {
  try {
    const db = getDb();
    const snap = await getDocs(query(collection(db, 'dua_collections'), orderBy('title', 'asc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DuaCollection, 'id'>) }));
  } catch {
    return [];
  }
}

export const duaService = {
  getDuas: async (): Promise<Dua[]> => {
    try {
      const duas = await fetchDuasFromFirestore();
      if (duas.length > 0) return duas;
    } catch {
      // return fallback below
    }
    return [
      { id: 'dua-1', title: 'Before Sleeping', category: 'Evening', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration: 'Bismika Allahumma amutu wa ahya', translation_en: 'In Your Name, O Allah, I die and I live.' },
      { id: 'dua-2', title: 'Upon Waking Up', category: 'Morning', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', transliteration: 'Alhamdu lillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur', translation_en: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.' },
      { id: 'dua-3', title: 'For Forgiveness', category: 'Forgiveness', arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', transliteration: 'Rabbana thalamna anfusana wa-in lam taghfir lana watarhamna lanakoonanna mina alkhasireen', translation_en: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.' }
    ];
  },
  getDuaById: async (id: string): Promise<Dua | undefined> => {
    try {
      const fromFirestore = await fetchDuaByIdFromFirestore(id);
      if (fromFirestore) return fromFirestore;
    } catch {
      // return fallback below
    }
    const all = await duaService.getDuas();
    return all.find(d => d.id === id);
  },
  getCollections: async (): Promise<DuaCollection[]> => {
    try {
      const collections = await fetchCollectionsFromFirestore();
      if (collections.length > 0) return collections;
    } catch {
      // return fallback below
    }
    return [
      { id: 'col-1', title: 'Morning & Evening', image: '/images/morning.jpg', duaIds: ['dua-1', 'dua-2'] },
      { id: 'col-2', title: 'Forgiveness', image: '/images/forgiveness.jpg', duaIds: ['dua-3'] }
    ];
  },
  getFavoriteDuas: (): string[] => {
    if (typeof window === 'undefined') return [];
    const favorites = localStorage.getItem('fav_duas');
    return parseSafeJsonArray<string>(favorites);
  },
  toggleFavorite: (id: string) => {
    if (typeof window === 'undefined') return [];
    const favorites = duaService.getFavoriteDuas();
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('fav_duas', JSON.stringify(favorites));
    return favorites;
  }
};
