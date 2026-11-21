import { NextRequest, NextResponse } from 'next/server';
import {
  isValidClinicEmail,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  DEFAULT_CLINIC_PASSWORD,
  CLINIC_DOMAIN,
} from '@/lib/auth';
import {
  getUser,
  saveUser,
  hashPassword,
  verifyPassword,
  generateOtp,
  verifyOtp,
} from '@/lib/userStore';
import { sendOtpEmail } from '@/lib/email';

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

// POST: Multi-flow auth handler (Login, Request OTP, Create Password, Reset Password)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'login';
    const email = (body.email || '').trim().toLowerCase();
    const rememberMe = !!body.rememberMe;

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local-client';
    const rateLimitKey = `${clientIp}_${email}`;

    // 1. Strict domain validation for ALL actions
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your clinic email address.' },
        { status: 400 }
      );
    }

    if (!isValidClinicEmail(email)) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        {
          ok: false,
          error: `Access Restricted: Only authorized staff with an @${CLINIC_DOMAIN} email address may access this portal. Personal or outside email domains (e.g. gmail, yahoo) are strictly prohibited.`,
        },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------------------
    // FLOW 1: REQUEST OTP (For Create Password or Forgot Password)
    // ------------------------------------------------------------------------
    if (action === 'request_otp') {
      const purpose = body.purpose === 'reset' ? 'reset' : 'signup';
      const existingUser = await getUser(email);

      if (purpose === 'signup' && existingUser) {
        return NextResponse.json(
          {
            ok: false,
            error: 'An account has already been registered for this email. Please sign in or use "Forgot Password" if you need to reset it.',
            alreadyExists: true,
          },
          { status: 400 }
        );
      }

      if (purpose === 'reset' && !existingUser) {
        // If user hasn't registered a personal password yet, check if they can just create one
        return NextResponse.json(
          {
            ok: false,
            error: 'No personal password has been registered for this email yet. Please use "Create Password (First Time)" to activate your account.',
            notFound: true,
          },
          { status: 404 }
        );
      }

      // Generate 6-digit OTP
      const otp = await generateOtp(email, purpose);

      // Send OTP via email (Resend / Vercel integration, with automatic dev fallback)
      const emailResult = await sendOtpEmail(email, otp, purpose);

      if (!emailResult.success) {
        console.warn('[Auth API] Email dispatch failed, falling back to simulated OTP:', emailResult.error);
        return NextResponse.json(
          {
            ok: true,
            message: `Verification code generated! (Resend Sandbox: ${emailResult.error})`,
            simulated: true,
            devOtp: otp,
            sandboxNotice: emailResult.error,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          message: emailResult.sandboxNotice
            ? `Verification code dispatched! ${emailResult.sandboxNotice}`
            : `Verification code sent to ${email}. Valid for 10 minutes.`,
          simulated: !!emailResult.simulated,
          devOtp: emailResult.simulated ? emailResult.otp : undefined,
          sandboxNotice: emailResult.sandboxNotice,
        },
        { status: 200 }
      );
    }

    // ------------------------------------------------------------------------
    // FLOW 2: CREATE PASSWORD (FIRST-TIME ACTIVATION)
    // ------------------------------------------------------------------------
    if (action === 'create_password') {
      const otp = (body.otp || '').trim();
      const password = (body.password || '').trim();

      if (!otp) {
        return NextResponse.json({ ok: false, error: 'Please enter the 6-digit verification code.' }, { status: 400 });
      }

      if (!password || password.length < 8) {
        return NextResponse.json(
          { ok: false, error: 'Password must be at least 8 characters long for clinical security.' },
          { status: 400 }
        );
      }

      // Verify OTP
      const otpCheck = await verifyOtp(email, otp, 'signup');
      if (!otpCheck.valid) {
        return NextResponse.json({ ok: false, error: otpCheck.reason || 'Invalid or expired verification code.' }, { status: 400 });
      }

      // Hash password and store user
      const { hash, salt } = hashPassword(password);
      await saveUser({
        email,
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Clear rate limit & issue authenticated session
      clearRateLimit(rateLimitKey);
      const token = createSessionToken(email, rememberMe);
      const maxAgeSeconds = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

      const response = NextResponse.json(
        {
          ok: true,
          message: 'Account successfully activated! Welcome to PepTalk Clinical Portal.',
          user: { email, domain: CLINIC_DOMAIN },
        },
        { status: 200 }
      );

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
    }

    // ------------------------------------------------------------------------
    // FLOW 3: RESET PASSWORD (FORGOT PASSWORD)
    // ------------------------------------------------------------------------
    if (action === 'reset_password') {
      const otp = (body.otp || '').trim();
      const newPassword = (body.newPassword || '').trim();

      if (!otp) {
        return NextResponse.json({ ok: false, error: 'Please enter the 6-digit verification code.' }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { ok: false, error: 'New password must be at least 8 characters long for clinical security.' },
          { status: 400 }
        );
      }

      // Verify OTP
      const otpCheck = await verifyOtp(email, otp, 'reset');
      if (!otpCheck.valid) {
        return NextResponse.json({ ok: false, error: otpCheck.reason || 'Invalid or expired verification code.' }, { status: 400 });
      }

      // Hash new password and update user
      const { hash, salt } = hashPassword(newPassword);
      const existingUser = await getUser(email);
      await saveUser({
        email,
        passwordHash: hash,
        salt,
        createdAt: existingUser?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Clear rate limit & issue authenticated session
      clearRateLimit(rateLimitKey);
      const token = createSessionToken(email, rememberMe);
      const maxAgeSeconds = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

      const response = NextResponse.json(
        {
          ok: true,
          message: 'Password successfully updated! Logging you in...',
          user: { email, domain: CLINIC_DOMAIN },
        },
        { status: 200 }
      );

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
    }

    // ------------------------------------------------------------------------
    // FLOW 4: STANDARD SIGN IN
    // ------------------------------------------------------------------------
    const password = (body.password || '').trim();

    // Check rate limit
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Too many failed login attempts. For security, please wait 5 minutes before trying again.',
        },
        { status: 429 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your password.' },
        { status: 400 }
      );
    }

    // Check user database
    const user = await getUser(email);
    let isAuthenticated = false;

    if (user && user.passwordHash && user.salt) {
      // User has set their personal password
      isAuthenticated = verifyPassword(password, user.passwordHash, user.salt);
    }

    // Fallback: Check master clinic passcode
    const configuredMasterPassword = process.env.CLINIC_PASSWORD || DEFAULT_CLINIC_PASSWORD;
    if (!isAuthenticated && password === configuredMasterPassword) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        {
          ok: false,
          error: user
            ? 'Incorrect password. If you forgot your password, please click "Forgot Password".'
            : 'Invalid password. If this is your first time here, click "Create Password (First Time)" to activate your account.',
        },
        { status: 401 }
      );
    }

    // Clear rate limit & issue authenticated session
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

// DELETE: Sign out and clear session cookie
export async function DELETE() {
  const response = NextResponse.json(
    { ok: true, message: 'Logged out successfully' },
    { status: 200 }
  );

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
