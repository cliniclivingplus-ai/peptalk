import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredUser {
  email: string;
  name?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingOtp {
  email: string;
  code: string;
  purpose: 'signup' | 'reset';
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

// In-memory cache for fast lookups & warm Lambda execution
const memoryUsers = new Map<string, StoredUser>();
const pendingOtps = new Map<string, PendingOtp>();

// Determine persistent file paths (with /tmp fallback for Vercel Serverless)
function getUserDataFilePath(): string {
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      try {
        fs.mkdirSync(localDir, { recursive: true });
      } catch {
        // Directory cannot be created in read-only environment
      }
    }
    const localPath = path.join(localDir, 'clinic_users.json');
    // Test writeability
    if (fs.existsSync(localPath)) {
      fs.accessSync(localPath, fs.constants.W_OK);
      return localPath;
    } else if (fs.existsSync(localDir)) {
      fs.writeFileSync(localPath, JSON.stringify({}), { flag: 'wx' });
      return localPath;
    }
  } catch {
    // Falls through to /tmp
  }

  // Fallback to /tmp which is always writable in Vercel Serverless
  return path.join('/tmp', 'clinic_users.json');
}

function loadUsersFromDisk(): void {
  try {
    const filePath = getUserDataFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      for (const [email, user] of Object.entries(parsed)) {
        memoryUsers.set(email.toLowerCase(), user as StoredUser);
      }
    }
  } catch (err) {
    console.warn('[UserStore] Error loading users from disk:', err);
  }
}

function persistUsersToDisk(): void {
  try {
    const filePath = getUserDataFilePath();
    const obj: Record<string, StoredUser> = {};
    for (const [email, user] of memoryUsers.entries()) {
      obj[email] = user;
    }
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[UserStore] Error persisting users to disk:', err);
  }
}

// Load initial users
loadUsersFromDisk();

/**
 * Hash a password using PBKDF2 (100,000 iterations, SHA-512)
 */
export function hashPassword(password: string, saltInput?: string): { hash: string; salt: string } {
  const salt = saltInput || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a plaintext password against a stored PBKDF2 hash using timingSafeEqual
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const { hash } = hashPassword(password, salt);
    const hashBuffer = Buffer.from(hash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (hashBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Retrieve a user by email
 */
export async function getUser(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  if (memoryUsers.has(normalized)) {
    return memoryUsers.get(normalized)!;
  }
  loadUsersFromDisk();
  return memoryUsers.get(normalized) || null;
}

/**
 * Save or update a user
 */
export async function saveUser(user: StoredUser): Promise<void> {
  const normalized = user.email.trim().toLowerCase();
  memoryUsers.set(normalized, {
    ...user,
    email: normalized,
    updatedAt: new Date().toISOString()
  });
  persistUsersToDisk();
}

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export async function generateOtp(email: string, purpose: 'signup' | 'reset'): Promise<string> {
  const normalized = email.trim().toLowerCase();
  // 6 digits (100000 - 999999)
  const otpNumber = crypto.randomInt(100000, 999999).toString();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

  pendingOtps.set(`${normalized}:${purpose}`, {
    email: normalized,
    code: otpNumber,
    purpose,
    createdAt: now,
    expiresAt,
    attempts: 0
  });

  return otpNumber;
}

/**
 * Verify and consume a pending OTP
 */
export async function verifyOtp(email: string, code: string, purpose: 'signup' | 'reset'): Promise<{ valid: boolean; reason?: string }> {
  const normalized = email.trim().toLowerCase();
  const key = `${normalized}:${purpose}`;
  const record = pendingOtps.get(key);

  if (!record) {
    return { valid: false, reason: 'No pending OTP found. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(key);
    return { valid: false, reason: 'OTP has expired. Please request a new code.' };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    pendingOtps.delete(key);
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new code.' };
  }

  const cleanCode = code.trim();
  if (record.code !== cleanCode) {
    return { valid: false, reason: 'Invalid OTP code. Please check your email and try again.' };
  }

  // Code is valid! Consume it so it cannot be reused
  pendingOtps.delete(key);
  return { valid: true };
}
