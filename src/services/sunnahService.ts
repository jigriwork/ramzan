import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, orderBy, query, doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface SunnahHabit {
    id: string;
    title: string;
    description: string;
    reference?: string;
    order: number;
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

export const sunnahService = {
    getSunnahs: async (): Promise<SunnahHabit[]> => {
        try {
            const db = getDb();
            const snap = await getDocs(query(collection(db, 'sunnah'), orderBy('order', 'asc')));
            return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as SunnahHabit));
        } catch {
            return [];
        }
    },

    getCompletions: async (uid: string, dateKey: string): Promise<string[]> => {
        try {
            if (!uid) return [];
            const db = getDb();
            const snap = await getDoc(doc(db, 'sunnah_completions', `${uid}_${dateKey}`));
            if (snap.exists()) {
                return snap.data().completedIds || [];
            }
            return [];
        } catch {
            return [];
        }
    },

    saveCompletions: async (uid: string, dateKey: string, completedIds: string[]): Promise<void> => {
        try {
            if (!uid) return;
            const db = getDb();
            await setDoc(doc(db, 'sunnah_completions', `${uid}_${dateKey}`), {
                completedIds,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch {
            // ignore
        }
    }
};
