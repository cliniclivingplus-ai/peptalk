import fs from 'fs';
import path from 'path';
import { getFirestoreDb } from './firebaseAdmin';

export type ActivityAction =
  | 'login'
  | 'time_spent'
  | 'page_view'
  | 'compound_view'
  | 'protocol_view'
  | 'course_view'
  | 'ai_chat'
  | 'content_studio'
  | 'copy_blocked'
  | 'print_blocked'
  | 'devtools_blocked'
  | 'device_kicked';

export interface ActivityEvent {
  id: string;
  email: string;
  action: ActivityAction;
  detail: string;
  durationSeconds?: number;
  device?: string;
  timestamp: string;
}

const FIRESTORE_COLLECTION = 'peptalk_activity';
const MAX_LOCAL_EVENTS = 500;

function getLocalLogPath(): string {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'activity_logs.json');
  } catch {
    return path.join('/tmp', 'activity_logs.json');
  }
}

export async function logActivity(params: {
  email: string;
  action: ActivityAction;
  detail: string;
  durationSeconds?: number;
  userAgent?: string;
}): Promise<void> {
  const email = (params.email || 'unknown').trim().toLowerCase();
  const ua = params.userAgent || '';
  const device = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
  const event: ActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email,
    action: params.action,
    detail: (params.detail || '').slice(0, 300),
    ...(params.durationSeconds ? { durationSeconds: params.durationSeconds } : {}),
    device,
    timestamp: new Date().toISOString(),
  };

  try {
    const db = getFirestoreDb();
    if (db) {
      await db.collection(FIRESTORE_COLLECTION).doc(event.id).set(event);
      return;
    }
  } catch (err) {
    console.warn('[ActivityStore] Firestore write failed:', err);
  }

  // Local fallback
  try {
    const filePath = getLocalLogPath();
    let list: ActivityEvent[] = [];
    if (fs.existsSync(filePath)) {
      list = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    list.unshift(event);
    fs.writeFileSync(filePath, JSON.stringify(list.slice(0, MAX_LOCAL_EVENTS), null, 2), 'utf-8');
  } catch {
    // Ignore local write errors
  }
}

export async function getRecentActivity(limit = 200): Promise<ActivityEvent[]> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const snap = await db
        .collection(FIRESTORE_COLLECTION)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      return snap.docs.map((d) => d.data() as ActivityEvent);
    }
  } catch (err) {
    console.warn('[ActivityStore] Firestore read failed:', err);
  }

  try {
    const filePath = getLocalLogPath();
    if (fs.existsSync(filePath)) {
      const list = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ActivityEvent[];
      return list.slice(0, limit);
    }
  } catch {
    // Ignore
  }
  return [];
}
