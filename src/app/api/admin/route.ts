import { NextRequest, NextResponse } from 'next/server';
import {
  getRoster,
  addStaff,
  removeStaff,
  toggleStaffStatus,
  getWeeklyAccess,
  rotateWeeklyPassword,
  verifyAdminSecret,
  StaffMember,
} from '@/lib/rosterStore';
import {
  sendWeeklyPasswordBroadcast,
  sendWeeklyPasswordNotification,
} from '@/lib/email';

function authenticateAdmin(request: NextRequest, bodyKey?: string): boolean {
  const headerKey = request.headers.get('x-admin-key');
  const key = headerKey || bodyKey;
  if (!key) return false;
  return verifyAdminSecret(key);
}

// GET: Return roster and current weekly access state
export async function GET(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized: Invalid Admin Security Key' }, { status: 401 });
  }

  const roster = await getRoster();
  const weeklyAccess = await getWeeklyAccess();
  const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  const resendConfigured = !!process.env.RESEND_API_KEY;

  return NextResponse.json({
    ok: true,
    roster,
    weeklyAccess,
    emailConfig: {
      smtpConfigured,
      resendConfigured,
      smtpUser: process.env.SMTP_USER || null,
    },
  });
}

// POST: Administrative operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || '';

    // Fast action: verify admin key
    if (action === 'verify_key') {
      const isValid = verifyAdminSecret(body.key || '');
      return NextResponse.json({ ok: isValid });
    }

    // All other actions require admin authentication
    if (!authenticateAdmin(request, body.adminKey)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: Invalid Admin Security Key' }, { status: 401 });
    }

    // 1. ROTATE WEEKLY PASSWORD
    if (action === 'rotate_password') {
      const customPass = body.customPassword?.trim();
      const newAccess = await rotateWeeklyPassword(customPass);
      const roster = await getRoster();

      let broadcastResult = null;
      if (body.dispatchEmails) {
        broadcastResult = await sendWeeklyPasswordBroadcast(
          roster,
          newAccess.currentPassword,
          newAccess.weekLabel,
          newAccess.expiresAt
        );
      }

      return NextResponse.json({
        ok: true,
        weeklyAccess: newAccess,
        broadcastResult,
        message: `Weekly password successfully rotated to ${newAccess.currentPassword}!`,
      });
    }

    // 2. ADD STAFF MEMBER
    if (action === 'add_staff') {
      const { email, name, role } = body;
      if (!email) {
        return NextResponse.json({ ok: false, error: 'Please provide staff email' }, { status: 400 });
      }

      const result = await addStaff(email, name, role);
      if (!result.success || !result.staff) {
        return NextResponse.json({ ok: false, error: result.error || 'Failed to add staff member' }, { status: 400 });
      }

      // Optionally send welcome password email
      if (body.sendEmail) {
        const weeklyAccess = await getWeeklyAccess();
        await sendWeeklyPasswordNotification(
          result.staff,
          weeklyAccess.currentPassword,
          weeklyAccess.weekLabel,
          weeklyAccess.expiresAt
        );
      }

      const updatedRoster = await getRoster();
      return NextResponse.json({
        ok: true,
        staff: result.staff,
        roster: updatedRoster,
        message: `Added ${result.staff.name} (${result.staff.email}) to active roster.`,
      });
    }

    // 3. REMOVE STAFF MEMBER
    if (action === 'remove_staff') {
      const { id } = body;
      const result = await removeStaff(id);
      if (!result.success) {
        return NextResponse.json({ ok: false, error: result.error || 'Failed to remove staff' }, { status: 400 });
      }

      const updatedRoster = await getRoster();
      return NextResponse.json({
        ok: true,
        roster: updatedRoster,
        message: 'Staff member removed. They can no longer log in.',
      });
    }

    // 4. TOGGLE STATUS (ACTIVE / SUSPENDED)
    if (action === 'toggle_status') {
      const { id, status } = body;
      const result = await toggleStaffStatus(id, status);
      if (!result.success) {
        return NextResponse.json({ ok: false, error: result.error || 'Failed to update status' }, { status: 400 });
      }

      const updatedRoster = await getRoster();
      return NextResponse.json({
        ok: true,
        roster: updatedRoster,
        message: `Staff member status updated to ${status}.`,
      });
    }

    // 5. DISPATCH EMAIL TO SINGLE STAFF
    if (action === 'dispatch_single') {
      const { email } = body;
      const roster = await getRoster();
      const staff = roster.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
      if (!staff) {
        return NextResponse.json({ ok: false, error: 'Staff member not found on roster' }, { status: 404 });
      }

      const weeklyAccess = await getWeeklyAccess();
      const sendRes = await sendWeeklyPasswordNotification(
        staff,
        weeklyAccess.currentPassword,
        weeklyAccess.weekLabel,
        weeklyAccess.expiresAt
      );

      return NextResponse.json({
        ok: sendRes.success,
        error: sendRes.error,
        message: sendRes.success
          ? `Weekly password successfully sent to ${staff.email}.`
          : `Failed to dispatch email: ${sendRes.error}`,
      });
    }

    // 6. BROADCAST WEEKLY PASSWORD TO ALL ACTIVE STAFF
    if (action === 'dispatch_broadcast') {
      const roster = await getRoster();
      const weeklyAccess = await getWeeklyAccess();
      const result = await sendWeeklyPasswordBroadcast(
        roster,
        weeklyAccess.currentPassword,
        weeklyAccess.weekLabel,
        weeklyAccess.expiresAt
      );

      return NextResponse.json({
        ok: true,
        result,
        message: `Dispatched weekly password to ${result.totalSent} staff members.`,
      });
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
