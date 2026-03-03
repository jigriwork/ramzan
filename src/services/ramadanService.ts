import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

type Ashra = 'Mercy' | 'Forgiveness' | 'Protection';

type RamadanInfo = {
  day: number;
  ashra: Ashra;
  isRamadan: boolean;
};

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

const INDIA_RAMADAN_START_DATES: Record<number, string> = {
  // India moon-sighting aligned baseline
  2026: '2026-02-19',
};

function getIndiaTodayDate(): Date {
  const now = new Date();
  const indiaDateStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(indiaDateStr);
}

function getDateOnlyKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getAshra(day: number): Ashra {
  if (day <= 10) return 'Mercy';
  if (day <= 20) return 'Forgiveness';
  return 'Protection';
}

export const ramadanService = {
  getChecklist: async () => {
    try {
      const db = getDb();
      const snap = await getDocs(query(collection(db, 'ramadan_checklist'), orderBy('order', 'asc')));
      if (snap.docs.length > 0) {
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch {
      // ignore
    }

    return [
      { id: 'task-1', title: 'Fasting (Sawm)', type: 'mandatory', points: 10, order: 1 },
      { id: 'task-2', title: '5 Daily Prayers', type: 'mandatory', points: 10, order: 2 },
      { id: 'task-3', title: 'Taraweeh', type: 'sunnah', points: 5, order: 3 },
      { id: 'task-4', title: 'Read Quran (1 Juz)', type: 'sunnah', points: 5, order: 4 },
      { id: 'task-5', title: 'Give Charity (Sadaqah)', type: 'sunnah', points: 5, order: 5 }
    ];
  },
  getCompletion: (day: number): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(`ramadan_day_${day}`);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  saveCompletion: (day: number, taskIds: string[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`ramadan_day_${day}`, JSON.stringify(taskIds));
  },
  getCurrentRamadanInfo: (): RamadanInfo => {
    const today = getIndiaTodayDate();
    const year = today.getFullYear();
    const startDateKey = INDIA_RAMADAN_START_DATES[year];
    if (!startDateKey) {
      return { day: 1, ashra: 'Mercy', isRamadan: false };
    }

    const start = new Date(`${startDateKey}T00:00:00`);
    const current = new Date(`${getDateOnlyKey(today)}T00:00:00`);
    const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const day = diffDays + 1;
    const isRamadan = day >= 1 && day <= 30;
    const normalizedDay = Math.min(30, Math.max(1, day));

    return {
      day: normalizedDay,
      ashra: getAshra(normalizedDay),
      isRamadan,
    };
  },
  getStreak: () => {
    if (typeof window === 'undefined') return 0;
    const { day } = ramadanService.getCurrentRamadanInfo();
    let streak = 0;
    for (let d = day; d >= 1; d -= 1) {
      const completed = ramadanService.getCompletion(d);
      if (completed.length === 0) break;
      streak += 1;
    }
    return streak;
  }
};
