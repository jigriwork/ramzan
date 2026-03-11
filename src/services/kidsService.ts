import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export type KidsQuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type KidsQuiz = {
  id: string;
  title: string;
  description?: string;
  questions: KidsQuizQuestion[];
};

export type KidsStory = {
  id: string;
  title: string;
  short: string;
  content: string;
  moral?: string;
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

function normalizeStory(raw: any, fallbackId: string): KidsStory | null {
  const title = typeof raw?.title === 'string' ? raw.title.trim() : '';
  const content = typeof raw?.content === 'string' ? raw.content.trim() : '';
  if (!title || !content) return null;

  const shortText = typeof raw?.short === 'string' && raw.short.trim().length > 0
    ? raw.short.trim()
    : `${content.slice(0, 140)}${content.length > 140 ? '…' : ''}`;

  return {
    id: String(raw?.id ?? fallbackId),
    title,
    content,
    short: shortText,
    moral: typeof raw?.moral === 'string' && raw.moral.trim() ? raw.moral.trim() : undefined,
  };
}

function normalizeQuestion(raw: any): KidsQuizQuestion | null {
  const question = typeof raw?.question === 'string' ? raw.question.trim() : '';
  const options = Array.isArray(raw?.options)
    ? raw.options.map((o: any) => String(o)).filter((o: string) => o.trim().length > 0)
    : [];
  const correctIndexRaw = Number(raw?.correctIndex ?? raw?.answer);
  if (!question || options.length < 2 || !Number.isFinite(correctIndexRaw)) return null;
  const correctIndex = Math.max(0, Math.min(options.length - 1, correctIndexRaw));

  return {
    question,
    options,
    correctIndex,
    explanation: typeof raw?.explanation === 'string' && raw.explanation.trim() ? raw.explanation.trim() : undefined,
  };
}

function normalizeQuiz(raw: any, fallbackId: string): KidsQuiz | null {
  const title = typeof raw?.title === 'string' ? raw.title.trim() : '';
  const questions = Array.isArray(raw?.questions)
    ? raw.questions.map(normalizeQuestion).filter((q: KidsQuizQuestion | null): q is KidsQuizQuestion => Boolean(q))
    : [];
  if (!title || questions.length === 0) return null;

  return {
    id: String(raw?.id ?? fallbackId),
    title,
    description: typeof raw?.description === 'string' && raw.description.trim() ? raw.description.trim() : undefined,
    questions,
  };
}

export const kidsService = {
  getStories: async (): Promise<KidsStory[]> => {
    try {
      const db = getDb();
      const snap = await getDocs(collection(db, 'kids_stories'));
      if (snap.docs.length > 0) {
        const normalized = snap.docs
          .map((doc: any) => normalizeStory({ id: doc.id, ...doc.data() }, doc.id))
          .filter((story: KidsStory | null): story is KidsStory => Boolean(story));
        if (normalized.length > 0) return normalized;
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 'story-1',
        title: 'The Story of Prophet Nuh',
        short: 'Prophet Nuh (AS) called his people to Allah with patience, courage, and trust for many years.',
        content: 'Prophet Nuh (AS) invited his people to worship Allah alone for many years. Most people refused and mocked him. Allah commanded him to build an ark. When the flood came, those who believed were saved. The story teaches us patience, obedience to Allah, and never giving up on truth.',
        moral: 'Stay patient and obey Allah even when others do not understand you.',
      },
      {
        id: 'story-2',
        title: 'The Patience of Ayyub',
        short: 'Prophet Ayyub (AS) remained grateful to Allah during hardship and became an example of sabr.',
        content: 'Prophet Ayyub (AS) faced severe illness and loss, but he never complained against Allah. He kept making dua with humility and hope. Allah accepted his prayer, restored his health, and rewarded his patience. His story reminds us that trials can bring us closer to Allah.',
        moral: 'Be grateful and patient in difficulty; Allah rewards sincere patience.',
      }
    ];
  },
  getStoryById: async (id: string): Promise<KidsStory | undefined> => {
    try {
      const db = getDb();
      const docRef = doc(db, 'kids_stories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return normalizeStory({ id: docSnap.id, ...docSnap.data() }, docSnap.id) || undefined;
      }
    } catch {
      // ignore and fallback below
    }

    const stories = await kidsService.getStories();
    return stories.find((story) => story.id === id);
  },
  getQuizzes: async (): Promise<KidsQuiz[]> => {
    try {
      const db = getDb();
      const snap = await getDocs(collection(db, 'kids_quizzes'));
      if (snap.docs.length > 0) {
        const normalized = snap.docs
          .map((doc: any) => normalizeQuiz({ id: doc.id, ...doc.data() }, doc.id))
          .filter((quiz: KidsQuiz | null): quiz is KidsQuiz => Boolean(quiz));
        if (normalized.length > 0) return normalized;
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 'quiz-1',
        title: 'Prophets of Islam',
        description: 'Learn key facts about beloved prophets.',
        questions: [
          {
            question: 'Which prophet built the ark by Allah’s command?',
            options: ['Prophet Musa (AS)', 'Prophet Nuh (AS)', 'Prophet Isa (AS)'],
            correctIndex: 1,
            explanation: 'Prophet Nuh (AS) built the ark before the great flood.',
          },
          {
            question: 'Who is known for great patience during illness?',
            options: ['Prophet Ayyub (AS)', 'Prophet Yusuf (AS)', 'Prophet Yunus (AS)'],
            correctIndex: 0,
          },
        ],
      },
      {
        id: 'quiz-2',
        title: 'Pillars of Faith',
        description: 'Basics every young Muslim should know.',
        questions: [
          {
            question: 'How many pillars are in Islam?',
            options: ['4', '5', '6'],
            correctIndex: 1,
          },
          {
            question: 'Which pillar means fasting in Ramadan?',
            options: ['Salah', 'Zakah', 'Sawm'],
            correctIndex: 2,
          },
        ],
      }
    ];
  },
  saveScore: (quizId: string, score: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`quiz_score_${quizId}`, String(score));
  }
};
