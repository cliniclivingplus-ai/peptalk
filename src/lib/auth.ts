import crypto from 'crypto';

export const CLINIC_DOMAIN = 'cliniclivingplus.com';
export const ADMIN_EMAIL = 'shakthi@cliniclivingplus.com';
export const DEFAULT_CLINIC_PASSWORD = process.env.CLINIC_PASSWORD || 'ClinicLivingPlus2026!';
export const SESSION_COOKIE_NAME = 'peptalk_auth_session';

// Secret used for signing HMAC tokens
const SESSION_SECRET = process.env.SESSION_SECRET || 'cliniclivingplus-secure-peptalk-session-key-2026';

export interface AuthSessionPayload {
  email: string;
  domain: string;
  sessionId?: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Validates that an email belongs strictly to cliniclivingplus.com
 */
export function isValidClinicEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  
  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return false;

  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].toLowerCase();
  return domain === CLINIC_DOMAIN;
}

/**
 * Creates a cryptographically signed HMAC token for the session
 */
export function createSessionToken(email: string, rememberMe = true, sessionId?: string): string {
  const durationMs = rememberMe 
    ? 7 * 24 * 60 * 60 * 1000 // 7 days
    : 24 * 60 * 60 * 1000;    // 24 hours

  const now = Date.now();
  const payload: AuthSessionPayload = {
    email: email.trim().toLowerCase(),
    domain: CLINIC_DOMAIN,
    sessionId: sessionId || crypto.randomUUID(),
    issuedAt: now,
    expiresAt: now + durationMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes an HMAC session token
 */
export function verifySessionToken(token: string | undefined | null): AuthSessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  // Verify HMAC signature
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: AuthSessionPayload = JSON.parse(jsonStr);

    // Validate structure & domain
    if (!payload.email || payload.domain !== CLINIC_DOMAIN) return null;
    if (payload.expiresAt < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
