import 'server-only';

import { App, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function resolveServiceAccount(): ServiceAccount | undefined {
  const fromJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (fromJson) {
    const parsed = JSON.parse(fromJson) as ServiceAccount;
    if (parsed.privateKey) {
      parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n');
    }
    return parsed;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return undefined;
}

function getOrCreateAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0]!;
  }

  const credential = resolveServiceAccount();
  if (!credential) {
    throw new Error('Missing Firebase Admin credentials. Set FIREBASE_ADMIN_CREDENTIALS_JSON or individual FIREBASE_ADMIN_* fields.');
  }

  return initializeApp({ credential: cert(credential) });
}

export function getAdminDb() {
  return getFirestore(getOrCreateAdminApp());
}

export function getAdminAuth() {
  return getAuth(getOrCreateAdminApp());
}
