import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

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

export const kidsService = {
  getStories: async () => {
    try {
      const db = getDb();
      const snap = await getDocs(collection(db, 'kids_stories'));
      if (snap.docs.length > 0) {
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch {
      // ignore
    }

    return [
      { id: 'story-1', title: 'The Story of Prophet Nuh', content: 'Prophet Nuh built a great ark...', duration: '5 min', image: '/images/nuh.jpg' },
      { id: 'story-2', title: 'The Patience of Ayyub', content: 'Prophet Ayyub was tested with illness...', duration: '4 min', image: '/images/ayyub.jpg' }
    ];
  },
  getStoryById: async (id: string) => {
    try {
      const db = getDb();
      const docRef = doc(db, 'kids_stories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return undefined;
    } catch {
      return undefined;
    }
  },
  getQuizzes: async () => {
    try {
      const db = getDb();
      const snap = await getDocs(collection(db, 'kids_quizzes'));
      if (snap.docs.length > 0) {
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch {
      // ignore
    }

    return [
      { id: 'quiz-1', title: 'Prophets of Islam', questionCount: 5, difficulty: 'Easy' },
      { id: 'quiz-2', title: 'Pillars of Faith', questionCount: 5, difficulty: 'Medium' }
    ];
  },
  saveScore: (quizId: string, score: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`quiz_score_${quizId}`, String(score));
  }
};
