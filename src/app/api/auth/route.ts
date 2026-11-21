import { NextRequest, NextResponse } from 'next/server';
import {
  isValidClinicEmail,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  DEFAULT_CLINIC_PASSWORD,
  CLINIC_DOMAIN,
} from '@/lib/auth';

// In-memory rate limiting against brute-force (max 5 failed attempts per 5 minutes per IP)
const failedAttemptsMap = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = failedAttemptsMap.get(identifier);
  if (!record) return true;

  if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
    failedAttemptsMap.delete(identifier);
    return true;
  }

  return record.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const record = failedAttemptsMap.get(identifier);
  if (!record || now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
    failedAttemptsMap.set(identifier, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
  }
}

function clearRateLimit(identifier: string) {
  failedAttemptsMap.delete(identifier);
}

// GET: Check current authentication session
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(sessionCookie);

  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        email: payload.email,
        domain: payload.domain,
        expiresAt: payload.expiresAt,
      },
    },
    { status: 200 }
  );
}

// POST: Login with clinic email & password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const rememberMe = !!body.rememberMe;

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local-client';
    const rateLimitKey = `${clientIp}_${email}`;

    // 1. Check rate limit
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Too many failed login attempts. For security, please wait 5 minutes before trying again.',
        },
        { status: 429 }
      );
    }

    // 2. Strict Email validation
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your clinic email address.' },
        { status: 400 }
      );
    }

    // Explicit domain enforcement
    if (!isValidClinicEmail(email)) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        {
          ok: false,
          error: `Access Restricted: Only authorized staff with an @${CLINIC_DOMAIN} email address may sign in. Personal or outside email domains (e.g. gmail, yahoo) are strictly prohibited.`,
        },
        { status: 403 }
      );
    }

    // 3. Clinical Password / Access Key Verification
    const configuredPassword = process.env.CLINIC_PASSWORD || DEFAULT_CLINIC_PASSWORD;
    
    if (!password) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your clinical staff access passcode.' },
        { status: 400 }
      );
    }

    if (password !== configuredPassword) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        {
          ok: false,
          error: 'Incorrect clinical passcode. Please verify your credentials or contact your ClinicLivingPlus administrator.',
        },
        { status: 401 }
      );
    }

    // 4. Successful authentication -> Clear rate limit & issue signed token
    clearRateLimit(rateLimitKey);

    const token = createSessionToken(email, rememberMe);
    const maxAgeSeconds = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          email,
          domain: CLINIC_DOMAIN,
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE: Sign out / Revoke session
export async function DELETE() {
  const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });
  
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
