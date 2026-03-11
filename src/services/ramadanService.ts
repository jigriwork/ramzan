import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

type Ashra = 'Mercy' | 'Forgiveness' | 'Protection';

type RamadanInfo = {
  day: number;
  ashra: Ashra;
  isRamadan: boolean;
};

export type RamadanChecklistItem = {
  id: string;
  label: string;
  category?: string;
  points?: number;
};

export type RamadanDayCompletion = {
  completed: boolean;
  completedAt: string | null;
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

const CALENDAR_LOCAL_KEY = 'ramadan_calendar_completion_v1';

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

function getRamadanYear() {
  return getIndiaTodayDate().getFullYear();
}

function normalizeChecklistItem(row: Record<string, any>, fallbackId: string): RamadanChecklistItem {
  return {
    id: String(row.id ?? fallbackId),
    label: String(row.label ?? row.title ?? 'Task'),
    category: typeof row.category === 'string' ? row.category : (typeof row.type === 'string' ? row.type : undefined),
    points: typeof row.points === 'number' ? row.points : undefined,
  };
}

function readLocalCalendarMap(): Record<string, RamadanDayCompletion> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CALENDAR_LOCAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, RamadanDayCompletion>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalCalendarMap(map: Record<string, RamadanDayCompletion>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CALENDAR_LOCAL_KEY, JSON.stringify(map));
}

function calendarKey(year: number, day: number) {
  return `${year}_${day}`;
}

export const ramadanService = {
  getChecklist: async (): Promise<RamadanChecklistItem[]> => {
    try {
      const db = getDb();
      const snap = await getDocs(query(collection(db, 'ramadan_checklist'), orderBy('order', 'asc')));
      if (snap.docs.length > 0) {
        return snap.docs.map((doc: any) => normalizeChecklistItem({ id: doc.id, ...doc.data() }, doc.id));
      }
    } catch {
      // ignore
    }

    return [
      { id: 'task-1', label: 'Fasting (Sawm)', category: 'mandatory', points: 10 },
      { id: 'task-2', label: '5 Daily Prayers', category: 'mandatory', points: 10 },
      { id: 'task-3', label: 'Taraweeh', category: 'sunnah', points: 5 },
      { id: 'task-4', label: 'Read Quran (1 Juz)', category: 'sunnah', points: 5 },
      { id: 'task-5', label: 'Give Charity (Sadaqah)', category: 'sunnah', points: 5 }
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
  },
  getCalendarDayCompletion: async (params: { day: number; year?: number; uid?: string }): Promise<RamadanDayCompletion> => {
    const year = params.year ?? getRamadanYear();
    const localMap = readLocalCalendarMap();
    const key = calendarKey(year, params.day);
    const localValue = localMap[key];

    if (params.uid) {
      try {
        const db = getDb();
        const snap = await getDoc(doc(db, 'users', params.uid, 'ramadan', String(year), 'days', String(params.day)));
        if (snap.exists()) {
          const data = snap.data() as Partial<RamadanDayCompletion>;
          const result: RamadanDayCompletion = {
            completed: Boolean(data.completed),
            completedAt: typeof data.completedAt === 'string' ? data.completedAt : null,
          };
          localMap[key] = result;
          writeLocalCalendarMap(localMap);
          return result;
        }
      } catch {
        // fall back to local
      }
    }

    return localValue || { completed: false, completedAt: null };
  },
  saveCalendarDayCompletion: async (params: { day: number; completed: boolean; year?: number; uid?: string }) => {
    const year = params.year ?? getRamadanYear();
    const key = calendarKey(year, params.day);
    const localMap = readLocalCalendarMap();
    const payload: RamadanDayCompletion = {
      completed: params.completed,
      completedAt: params.completed ? new Date().toISOString() : null,
    };

    localMap[key] = payload;
    writeLocalCalendarMap(localMap);

    if (!params.uid) return;

    try {
      const db = getDb();
      await setDoc(
        doc(db, 'users', params.uid, 'ramadan', String(year), 'days', String(params.day)),
        payload,
        { merge: true }
      );
    } catch {
      // local is already saved
    }
  },
  syncLocalCalendarToCloud: async (params: { uid: string; year?: number }) => {
    const year = params.year ?? getRamadanYear();
    const localMap = readLocalCalendarMap();
    const db = getDb();

    const operations: Promise<void>[] = [];
    for (let day = 1; day <= 30; day += 1) {
      const key = calendarKey(year, day);
      const local = localMap[key];
      if (!local || !local.completed) continue;
      operations.push(
        setDoc(
          doc(db, 'users', params.uid, 'ramadan', String(year), 'days', String(day)),
          local,
          { merge: true }
        )
      );
    }

    await Promise.all(operations);
  }
};
