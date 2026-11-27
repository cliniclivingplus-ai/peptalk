import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isValidClinicEmail, SESSION_COOKIE_NAME } from '@/lib/auth';
import { verifyAdminSecret } from '@/lib/rosterStore';
import { logActivity, getRecentActivity, ActivityAction } from '@/lib/activityStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ACTIONS = new Set<ActivityAction>([
  'login',
  'page_view',
  'compound_view',
  'protocol_view',
  'course_view',
  'ai_chat',
  'content_studio',
  'copy_blocked',
  'print_blocked',
  'devtools_blocked',
]);

// POST: Log an authenticated user's activity or blocked copy/export attempt
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);
    if (!session || !isValidClinicEmail(session.email)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action as ActivityAction;
    const detail = typeof body.detail === 'string' ? body.detail : '';

    if (!VALID_ACTIONS.has(action)) {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }

    await logActivity({
      email: session.email,
      action,
      detail,
      userAgent: req.headers.get('user-agent') || '',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET: God View telemetry feed (Admin Security Key required)
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key') || '';
  if (!verifyAdminSecret(adminKey)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const events = await getRecentActivity(250);

  // Aggregate per-user summary
  const userMap = new Map<
    string,
    {
      email: string;
      totalActions: number;
      aiChats: number;
      views: number;
      securityAlerts: number;
      lastActive: string;
      device: string;
    }
  >();

  let totalAlerts = 0;
  let totalAiQueries = 0;

  for (const ev of events) {
    const isAlert =
      ev.action === 'copy_blocked' ||
      ev.action === 'print_blocked' ||
      ev.action === 'devtools_blocked';
    const isAi = ev.action === 'ai_chat' || ev.action === 'content_studio';

    if (isAlert) totalAlerts++;
    if (isAi) totalAiQueries++;

    const existing = userMap.get(ev.email);
    if (!existing) {
      userMap.set(ev.email, {
        email: ev.email,
        totalActions: 1,
        aiChats: isAi ? 1 : 0,
        views: !isAlert && !isAi ? 1 : 0,
        securityAlerts: isAlert ? 1 : 0,
        lastActive: ev.timestamp,
        device: ev.device || 'Desktop',
      });
    } else {
      existing.totalActions += 1;
      if (isAi) existing.aiChats += 1;
      else if (!isAlert) existing.views += 1;
      if (isAlert) existing.securityAlerts += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    summary: {
      activeUsers: userMap.size,
      totalEvents: events.length,
      totalAiQueries,
      totalAlerts,
    },
    users: Array.from(userMap.values()),
    events,
  });
}
