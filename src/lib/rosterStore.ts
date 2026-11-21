import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'suspended';
  addedAt: string;
  lastNotifiedAt?: string;
}

export interface PasswordHistoryItem {
  password: string;
  rotatedAt: string;
  weekLabel: string;
}

export interface WeeklyAccess {
  currentPassword: string;
  generatedAt: string;
  expiresAt: string;
  weekLabel: string;
  history: PasswordHistoryItem[];
}

interface RosterData {
  staff: StaffMember[];
  weeklyAccess: WeeklyAccess;
}

// In-memory cache
let cachedData: RosterData | null = null;

// Generate readable clinical week label, e.g. "Week of Nov 21 - Nov 28, 2026"
export function generateWeekLabel(startDate = new Date()): string {
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `Week of ${startStr} – ${endStr}`;
}

// Generate secure, medical-grade, memorable passcode, e.g. "LivingPlus-Nov21-7392"
export function generateWeeklyPasscode(): string {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'short' });
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = crypto.randomInt(1000, 9999).toString();
  return `LivingPlus-${month}${day}-${randomSuffix}`;
}

function getDefaultData(): RosterData {
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const defaultPassword = process.env.CLINIC_PASSWORD || 'LivingPlus-Nov21-8429';

  return {
    staff: [
      {
        id: 'staff-shakthi',
        email: 'shakthi@cliniclivingplus.com',
        name: 'Dr. Shakthi',
        role: 'Clinic Lead',
        status: 'active',
        addedAt: now.toISOString(),
      },
      {
        id: 'staff-admin',
        email: 'admin@cliniclivingplus.com',
        name: 'Clinic Administrator',
        role: 'Portal Admin',
        status: 'active',
        addedAt: now.toISOString(),
      },
      {
        id: 'staff-taylor',
        email: 'dr.taylor@cliniclivingplus.com',
        name: 'Dr. Taylor',
        role: 'Attending Physician',
        status: 'active',
        addedAt: now.toISOString(),
      },
    ],
    weeklyAccess: {
      currentPassword: defaultPassword,
      generatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      weekLabel: generateWeekLabel(now),
      history: [
        {
          password: defaultPassword,
          rotatedAt: now.toISOString(),
          weekLabel: generateWeekLabel(now),
        },
      ],
    },
  };
}

function getStoragePath(): string {
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      try {
        fs.mkdirSync(localDir, { recursive: true });
      } catch {
        // Ignored in read-only environment
      }
    }
    const localPath = path.join(localDir, 'clinic_roster.json');
    if (fs.existsSync(localPath)) {
      fs.accessSync(localPath, fs.constants.W_OK);
      return localPath;
    } else if (fs.existsSync(localDir)) {
      const defaultContent = getDefaultData();
      fs.writeFileSync(localPath, JSON.stringify(defaultContent, null, 2), { flag: 'wx' });
      return localPath;
    }
  } catch {
    // Falls through to /tmp
  }

  const tmpPath = path.join('/tmp', 'clinic_roster.json');
  if (!fs.existsSync(tmpPath)) {
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
    } catch {
      // Ignored
    }
  }
  return tmpPath;
}

function loadData(): RosterData {
  if (cachedData) return cachedData;
  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const text = fs.readFileSync(filePath, 'utf-8');
      cachedData = JSON.parse(text) as RosterData;
      return cachedData;
    }
  } catch (err) {
    console.warn('[RosterStore] Error loading data from disk:', err);
  }
  cachedData = getDefaultData();
  return cachedData;
}

function saveData(data: RosterData): void {
  cachedData = data;
  try {
    const filePath = getStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[RosterStore] Error persisting data to disk:', err);
  }
}

// ----------------------------------------------------------------------------
// STAFF ROSTER OPERATIONS
// ----------------------------------------------------------------------------

export async function getRoster(): Promise<StaffMember[]> {
  const data = loadData();
  return data.staff;
}

export async function getStaffByEmail(email: string): Promise<StaffMember | null> {
  const normalized = email.trim().toLowerCase();
  const data = loadData();
  return data.staff.find((s) => s.email.toLowerCase() === normalized) || null;
}

export async function addStaff(
  email: string,
  name?: string,
  role?: string
): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
  const normalized = email.trim().toLowerCase();

  if (!normalized.endsWith('@cliniclivingplus.com')) {
    return { success: false, error: 'Only @cliniclivingplus.com email addresses can be added to the clinic staff roster.' };
  }

  const data = loadData();
  const existing = data.staff.find((s) => s.email.toLowerCase() === normalized);
  if (existing) {
    return { success: false, error: 'This email is already in the clinic roster.' };
  }

  const derivedName = name?.trim() || normalized.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const newStaff: StaffMember = {
    id: `staff-${Date.now()}-${crypto.randomInt(100, 999)}`,
    email: normalized,
    name: derivedName,
    role: role?.trim() || 'Attending Physician',
    status: 'active',
    addedAt: new Date().toISOString(),
  };

  data.staff.push(newStaff);
  saveData(data);
  return { success: true, staff: newStaff };
}

export async function removeStaff(idOrEmail: string): Promise<{ success: boolean; error?: string }> {
  const data = loadData();
  const target = idOrEmail.trim().toLowerCase();
  const initialCount = data.staff.length;

  data.staff = data.staff.filter((s) => s.id !== target && s.email.toLowerCase() !== target);

  if (data.staff.length === initialCount) {
    return { success: false, error: 'Staff member not found.' };
  }

  saveData(data);
  return { success: true };
}

export async function toggleStaffStatus(
  idOrEmail: string,
  status: 'active' | 'suspended'
): Promise<{ success: boolean; error?: string }> {
  const data = loadData();
  const target = idOrEmail.trim().toLowerCase();
  const staff = data.staff.find((s) => s.id === target || s.email.toLowerCase() === target);

  if (!staff) {
    return { success: false, error: 'Staff member not found.' };
  }

  staff.status = status;
  saveData(data);
  return { success: true };
}

export async function recordStaffNotification(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const data = loadData();
  const staff = data.staff.find((s) => s.email.toLowerCase() === normalized);
  if (staff) {
    staff.lastNotifiedAt = new Date().toISOString();
    saveData(data);
  }
}

// ----------------------------------------------------------------------------
// WEEKLY PASSWORD ROTATION OPERATIONS
// ----------------------------------------------------------------------------

export async function getWeeklyAccess(): Promise<WeeklyAccess> {
  const data = loadData();
  return data.weeklyAccess;
}

export async function rotateWeeklyPassword(customPassword?: string): Promise<WeeklyAccess> {
  const data = loadData();
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const newPassword = (customPassword || generateWeeklyPasscode()).trim();
  const newWeekLabel = generateWeekLabel(now);

  const historyItem: PasswordHistoryItem = {
    password: data.weeklyAccess.currentPassword,
    rotatedAt: data.weeklyAccess.generatedAt,
    weekLabel: data.weeklyAccess.weekLabel,
  };

  const updatedHistory = [historyItem, ...(data.weeklyAccess.history || [])].slice(0, 10);

  data.weeklyAccess = {
    currentPassword: newPassword,
    generatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    weekLabel: newWeekLabel,
    history: updatedHistory,
  };

  saveData(data);
  return data.weeklyAccess;
}

// ----------------------------------------------------------------------------
// VALIDATION & AUTHENTICATION
// ----------------------------------------------------------------------------

export async function validateStaffLogin(
  email: string,
  password: string
): Promise<{ valid: boolean; staff?: StaffMember; reason?: string }> {
  const normalized = email.trim().toLowerCase();
  const data = loadData();

  // 1. Strict Domain Check
  if (!normalized.endsWith('@cliniclivingplus.com')) {
    return {
      valid: false,
      reason: 'Access Restricted: Only authorized staff with an @cliniclivingplus.com email address may sign in.',
    };
  }

  // 2. Check if email exists in active roster
  const staff = data.staff.find((s) => s.email.toLowerCase() === normalized);
  if (!staff) {
    return {
      valid: false,
      reason: `Access Denied: The email ${normalized} is not registered on the active ClinicLivingPlus staff roster. Please contact the administrator.`,
    };
  }

  // 3. Check if staff status is suspended
  if (staff.status === 'suspended') {
    return {
      valid: false,
      reason: 'Access Suspended: Your clinic access has been temporarily suspended by the clinic administrator.',
    };
  }

  // 4. Verify Password: Must match current active weekly password OR clinic master admin key
  const cleanPassword = password.trim();
  const activePassword = data.weeklyAccess.currentPassword;
  const masterPassword = process.env.CLINIC_PASSWORD || 'ClinicLivingPlus2026!';
  const adminSecret = process.env.ADMIN_SECRET || 'ClinicLivingAdmin2026!';

  const isWeeklyMatch = cleanPassword === activePassword;
  const isMasterMatch = cleanPassword === masterPassword || cleanPassword === adminSecret;

  if (!isWeeklyMatch && !isMasterMatch) {
    return {
      valid: false,
      reason: `Incorrect weekly password. Please enter this week's active password or check your clinic email. (Week: ${data.weeklyAccess.weekLabel})`,
    };
  }

  return { valid: true, staff };
}

export function verifyAdminSecret(secret: string): boolean {
  const configured = process.env.ADMIN_SECRET || 'ClinicLivingAdmin2026!';
  const inputBuffer = Buffer.from(secret.trim());
  const targetBuffer = Buffer.from(configured);
  if (inputBuffer.length !== targetBuffer.length) return false;
  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}
