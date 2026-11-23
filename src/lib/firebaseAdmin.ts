import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Returns a shared Firestore instance when Firebase service-account env vars are set,
 * otherwise null (local dev falls back to JSON files).
 *
 * Required env vars (Vercel → Settings → Environment Variables):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (paste the full key incl. BEGIN/END lines; \n escapes are OK)
 */
let db: Firestore | null = null;

export function getFirestoreDb(): Firestore | null {
  if (db) return db;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

  if (!projectId || !clientEmail || !privateKey) return null;

  const app: App =
    getApps()[0] ||
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

  db = getFirestore(app);
  return db;
}
