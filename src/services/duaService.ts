
import duaData from '@/mock/duas.json';
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

async function fetchDuasFromFirestore(): Promise<Dua[]> {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'duas'), orderBy('title', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Dua, 'id'>) }));
}

async function fetchDuaByIdFromFirestore(id: string): Promise<Dua | undefined> {
  const db = getDb();
  const snap = await getDoc(doc(db, 'duas', id));
  if (!snap.exists()) return undefined;
  return { id: snap.id, ...(snap.data() as Omit<Dua, 'id'>) };
}

async function fetchCollectionsFromFirestore(): Promise<DuaCollection[]> {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'dua_collections'), orderBy('title', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DuaCollection, 'id'>) }));
}

export const duaService = {
  getDuas: async (): Promise<Dua[]> => {
    try {
      const duas = await fetchDuasFromFirestore();
      if (duas.length > 0) return duas;
    } catch {
      // fallback below
    }

    if (isDev) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(duaData.duas as Dua[]), 300);
      });
    }

    return [];
  },
  getDuaById: async (id: string): Promise<Dua | undefined> => {
    try {
      const fromFirestore = await fetchDuaByIdFromFirestore(id);
      if (fromFirestore) return fromFirestore;
    } catch {
      // fallback below
    }

    if (isDev) return (duaData.duas as Dua[]).find(d => d.id === id);
    return undefined;
  },
  getCollections: async (): Promise<DuaCollection[]> => {
    try {
      const collections = await fetchCollectionsFromFirestore();
      if (collections.length > 0) return collections;
    } catch {
      // fallback below
    }

    if (isDev) return duaData.collections as DuaCollection[];
    return [];
  },
  getFavoriteDuas: (): string[] => {
    if (typeof window === 'undefined') return [];
    const favorites = localStorage.getItem('fav_duas');
    return favorites ? JSON.parse(favorites) : [];
  },
  toggleFavorite: (id: string) => {
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
