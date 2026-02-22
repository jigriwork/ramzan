'use client';

import {
  EmailAuthProvider,
  getAuth,
  createUserWithEmailAndPassword,
  linkWithCredential,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getAuthInstance() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export async function ensureAuthForSaving(): Promise<User> {
  const auth = getAuthInstance();
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function signInEmail(email: string, password: string) {
  const auth = getAuthInstance();
  return signInWithEmailAndPassword(auth, email, password);
}

export function registerEmail(email: string, password: string) {
  const auth = getAuthInstance();
  return createUserWithEmailAndPassword(auth, email, password);
}

export function sendReset(email: string) {
  const auth = getAuthInstance();
  return sendPasswordResetEmail(auth, email);
}

export async function upgradeAnonymousToEmail(email: string, password: string) {
  const auth = getAuthInstance();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No signed-in user available for account upgrade.');
  }

  const credential = EmailAuthProvider.credential(email, password);
  return linkWithCredential(user, credential);
}
