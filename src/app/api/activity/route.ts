import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isValidClinicEmail, SESSION_COOKIE_NAME, ADMIN_EMAIL } from '@/lib/auth';
import { verifyAdminSecret } from '@/lib/rosterStore';
import { isActiveDeviceSession } from '@/lib/sessionStore';
import { logActivity, getRecentActivity, ActivityAction } from '@/lib/activityStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ACTIONS = new Set<ActivityAction>([
  'login',
  'time_spent',
  'page_view',
  'compound_view',
  'protocol_view',
  'course_view',
  'ai_chat',
  'content_studio',
  'copy_blocked',
  'print_blocked',
  'devtools_blocked',
  'device_kicked',
]);

// POST: Log an authenticated user's activity, time heartbeat, or blocked copy/export attempt
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);
    if (!session || !isValidClinicEmail(session.email)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // Enforce One ID = One Device on every heartbeat/activity ping
    const stillActive = await isActiveDeviceSession(session.email, session.sessionId);
    if (!stillActive) {
      const res = NextResponse.json({ ok: false, kicked: true }, { status: 401 });
      res.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return res;
    }

    const body = await req.json();
    const action = body.action as ActivityAction;
    const detail = typeof body.detail === 'string' ? body.detail : '';
    const durationSeconds =
      typeof body.durationSeconds === 'number' && body.durationSeconds > 0
        ? Math.min(body.durationSeconds, 300)
        : undefined;

    if (!VALID_ACTIONS.has(action)) {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }

    await logActivity({
      email: session.email,
      action,
      detail,
      durationSeconds,
      userAgent: req.headers.get('user-agent') || '',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET: God View telemetry feed (restricted strictly to shakthi@cliniclivingplus.com + Admin Security Key)
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key') || '';
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(sessionCookie);

  if (!verifyAdminSecret(adminKey)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (session && session.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json(
      { ok: false, error: `God View is restricted exclusively to ${ADMIN_EMAIL}.` },
      { status: 403 }
    );
  }

  const allEvents = await getRecentActivity(400);

  const userMap = new Map<
    string,
    {
      email: string;
      totalActions: number;
      logins: number;
      aiChats: number;
      views: number;
      securityAlerts: number;
      totalTimeSeconds: number;
      lastActive: string;
      device: string;
    }
  >();

  let totalAlerts = 0;
  let totalAiQueries = 0;
  let totalTimeSeconds = 0;

  for (const ev of allEvents) {
    const isAlert =
      ev.action === 'copy_blocked' ||
      ev.action === 'print_blocked' ||
      ev.action === 'devtools_blocked' ||
      ev.action === 'device_kicked';
    const isAi = ev.action === 'ai_chat' || ev.action === 'content_studio';
    const isTime = ev.action === 'time_spent';
    const isLogin = ev.action === 'login';
    const sec = ev.durationSeconds || (isTime ? 60 : 0);

    if (isAlert) totalAlerts++;
    if (isAi) totalAiQueries++;
    if (sec > 0) totalTimeSeconds += sec;

    const existing = userMap.get(ev.email);
    if (!existing) {
      userMap.set(ev.email, {
        email: ev.email,
        totalActions: isTime ? 0 : 1,
        logins: isLogin ? 1 : 0,
        aiChats: isAi ? 1 : 0,
        views: !isAlert && !isAi && !isTime && !isLogin ? 1 : 0,
        securityAlerts: isAlert ? 1 : 0,
        totalTimeSeconds: sec,
        lastActive: ev.timestamp,
        device: ev.device || 'Desktop',
      });
    } else {
      if (!isTime) existing.totalActions += 1;
      if (isLogin) existing.logins += 1;
      else if (isAi) existing.aiChats += 1;
      else if (isAlert) existing.securityAlerts += 1;
      else if (!isTime) existing.views += 1;
      existing.totalTimeSeconds += sec;
    }
  }

  // Filter out silent heartbeat pings from the visible chronological feed
  const feedEvents = allEvents.filter((e) => e.action !== 'time_spent');

  return NextResponse.json({
    ok: true,
    summary: {
      activeUsers: userMap.size,
      totalEvents: feedEvents.length,
      totalAiQueries,
      totalAlerts,
      totalTimeSeconds,
    },
    users: Array.from(userMap.values()),
    events: feedEvents,
  });
}
