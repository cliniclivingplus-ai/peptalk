import { NextRequest, NextResponse } from 'next/server';
import {
  getRoster,
  getWeeklyAccess,
  rotateWeeklyPassword,
  verifyAdminSecret,
} from '@/lib/rosterStore';
import {
  sendWeeklyPasswordBroadcast,
  sendAdminWeeklySummaryEmail,
} from '@/lib/email';

function verifyCronAuthorization(request: NextRequest): boolean {
  // 1. Check Vercel Cron Secret (if configured in environment)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // 2. Check Admin Key via Header or Query Param
  const adminHeader = request.headers.get('x-admin-key');
  if (adminHeader && verifyAdminSecret(adminHeader)) {
    return true;
  }

  const queryKey = request.nextUrl.searchParams.get('key');
  if (queryKey && verifyAdminSecret(queryKey)) {
    return true;
  }

  // 3. Fallback: If neither is strictly required or in local development
  if (!cronSecret && process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  return handleRotation(request);
}

export async function POST(request: NextRequest) {
  return handleRotation(request);
}

async function handleRotation(request: NextRequest) {
  // Authorization check
  if (!verifyCronAuthorization(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: Invalid cron authorization secret or admin key' },
      { status: 401 }
    );
  }

  try {
    console.log('[CRON] Executing automated weekly credential rotation...');

    // 1. Rotate to new weekly passcode
    const newAccess = await rotateWeeklyPassword();
    const roster = await getRoster();
    const activeStaff = roster.filter((s) => s.status === 'active');

    // 2. Broadcast new weekly password to all active staff inboxes
    const broadcastResult = await sendWeeklyPasswordBroadcast(
      roster,
      newAccess.currentPassword,
      newAccess.weekLabel,
      newAccess.expiresAt
    );

    // 3. Dispatch Executive Director's Summary Email to admin
    const adminEmail = process.env.SMTP_USER || 'cliniclivingplus.ai@gmail.com';
    const adminSummaryResult = await sendAdminWeeklySummaryEmail(
      adminEmail,
      newAccess.currentPassword,
      newAccess.weekLabel,
      activeStaff,
      newAccess.expiresAt
    );

    console.log(
      `[CRON SUCCESS] Rotated to ${newAccess.currentPassword}. Notified ${broadcastResult.totalSent} staff. Admin notified: ${adminSummaryResult.success}`
    );

    return NextResponse.json({
      ok: true,
      message: 'Automated weekly password rotation completed successfully!',
      currentPassword: newAccess.currentPassword,
      weekLabel: newAccess.weekLabel,
      expiresAt: newAccess.expiresAt,
      staffEmailedCount: broadcastResult.totalSent,
      adminNotified: adminSummaryResult.success,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[CRON ERROR] Failed to execute automated rotation:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal cron execution failure' },
      { status: 500 }
    );
  }
}
