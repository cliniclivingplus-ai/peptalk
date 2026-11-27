import fs from 'fs';
import path from 'path';
import { getFirestoreDb } from './firebaseAdmin';

export interface ActiveDeviceSession {
  email: string;
  sessionId: string;
  device: string;
  loggedInAt: string;
}

const FIRESTORE_COLLECTION = 'peptalk_sessions';

function getLocalSessionsPath(): string {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'active_sessions.json');
  } catch {
    return path.join('/tmp', 'active_sessions.json');
  }
}

/**
 * Registers the single allowed active session for a user (One ID = One Device).
 * Returns true if this replaced an existing active session on another device.
 */
export async function setActiveDeviceSession(
  email: string,
  sessionId: string,
  userAgent = ''
): Promise<{ replacedExisting: boolean; previousDevice?: string }> {
  const normalized = email.trim().toLowerCase();
  const device = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : 'Desktop';
  const record: ActiveDeviceSession = {
    email: normalized,
    sessionId,
    device,
    loggedInAt: new Date().toISOString(),
  };

  try {
    const db = getFirestoreDb();
    if (db) {
      const ref = db.collection(FIRESTORE_COLLECTION).doc(normalized);
      const snap = await ref.get();
      const prev = snap.exists ? (snap.data() as ActiveDeviceSession) : null;
      await ref.set(record);
      return {
        replacedExisting: !!(prev && prev.sessionId && prev.sessionId !== sessionId),
        previousDevice: prev?.device,
      };
    }
  } catch (err) {
    console.warn('[SessionStore] Firestore write failed:', err);
  }

  // Local fallback
  try {
    const filePath = getLocalSessionsPath();
    let map: Record<string, ActiveDeviceSession> = {};
    if (fs.existsSync(filePath)) {
      map = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    const prev = map[normalized];
    map[normalized] = record;
    fs.writeFileSync(filePath, JSON.stringify(map, null, 2), 'utf-8');
    return {
      replacedExisting: !!(prev && prev.sessionId && prev.sessionId !== sessionId),
      previousDevice: prev?.device,
    };
  } catch {
    return { replacedExisting: false };
  }
}

/**
 * Checks whether the given sessionId is still the single active session for this user.
 * If no session is recorded yet (legacy cookie before enforcement), allows it cleanly.
 */
export async function isActiveDeviceSession(email: string, sessionId?: string): Promise<boolean> {
  if (!sessionId) return true; // Legacy cookie grace until next login
  const normalized = email.trim().toLowerCase();

  try {
    const db = getFirestoreDb();
    if (db) {
      const snap = await db.collection(FIRESTORE_COLLECTION).doc(normalized).get();
      if (!snap.exists) return true;
      const data = snap.data() as ActiveDeviceSession;
      return data.sessionId === sessionId;
    }
  } catch (err) {
    console.warn('[SessionStore] Firestore read failed:', err);
    return true;
  }

  try {
    const filePath = getLocalSessionsPath();
    if (fs.existsSync(filePath)) {
      const map = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, ActiveDeviceSession>;
      if (!map[normalized]) return true;
      return map[normalized].sessionId === sessionId;
    }
  } catch {
    // Ignore
  }
  return true;
}
