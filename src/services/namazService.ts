import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface NamazStep {
    id: string;
    title: string;
    instruction: string;
    arabic?: string;
    transliteration?: string;
    translation_en?: string;
    translation_ur?: string;
    translation_hi?: string;
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

export const namazService = {
    getSteps: async (): Promise<NamazStep[]> => {
        try {
            const db = getDb();
            const snap = await getDocs(query(collection(db, 'namaz_steps'), orderBy('order', 'asc')));
            if (snap.docs.length > 0) {
                return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as NamazStep));
            }
        } catch {
            // ignore
        }

        // Static fallback if Firebase is empty
        return [
            {
                id: 'step-1', order: 1, title: 'Intention (Niyyah)',
                instruction: 'Stand facing the Qiblah and make the intention in your heart for the prayer you are about to perform.',
                arabic: 'نَوَيْتُ أَنْ أُصَلِّيَ...',
                transliteration: 'Nawaytu an usalliya...',
                translation_en: 'I intend to pray...'
            },
            {
                id: 'step-2', order: 2, title: 'Takbeerat-ul-Ihram',
                instruction: 'Raise your hands to your earlobes and say Allahu Akbar.',
                arabic: 'اللَّهُ أَكْبَرُ',
                transliteration: 'Allahu Akbar',
                translation_en: 'God is the Greatest'
            }
        ];
    }
};
