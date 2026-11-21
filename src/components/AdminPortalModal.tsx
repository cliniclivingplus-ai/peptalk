'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Users,
  RefreshCw,
  Send,
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  Copy,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { StaffMember, WeeklyAccess } from '@/lib/rosterStore';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey?: string;
  hasServerKey?: boolean;
  onSaveGeminiKey?: (key: string) => void;
}

export default function AdminPortalModal({
  isOpen,
  onClose,
  geminiKey = '',
  hasServerKey = false,
  onSaveGeminiKey,
}: AdminPortalModalProps) {
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gemini AI Engine Key Management
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiKey || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync Gemini key when modal opens or prop updates
  useEffect(() => {
    if (geminiKey) {
      setLocalGeminiKey(geminiKey);
    } else {
      const stored = localStorage.getItem('peptalk_gemini_api_key') || localStorage.getItem('peppal_gemini_api_key') || '';
      if (stored) setLocalGeminiKey(stored);
    }
  }, [geminiKey, isOpen]);

  // Roster & Weekly Access Data
  const [roster, setRoster] = useState<StaffMember[]>([]);
  const [weeklyAccess, setWeeklyAccess] = useState<WeeklyAccess | null>(null);
  const [emailConfig, setEmailConfig] = useState<{ smtpConfigured: boolean; resendConfigured: boolean; smtpUser: string | null } | null>(null);

  // Add Staff Form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Attending Physician');
  const [sendEmailOnAdd, setSendEmailOnAdd] = useState(true);

  // Copy Feedback
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // Check saved admin session
  useEffect(() => {
    const saved = localStorage.getItem('peptalk_admin_key');
    if (saved && isOpen) {
      setAdminKey(saved);
      verifyKeyAndLoad(saved);
    }
  }, [isOpen]);

  const resetAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const verifyKeyAndLoad = async (keyToVerify = adminKey, keepAlerts = false) => {
    if (!keyToVerify.trim()) {
      setErrorMessage('Please enter the Admin Security Key.');
      return;
    }

    setIsLoading(true);
    if (!keepAlerts) resetAlerts();

    try {
      const res = await fetch('/api/admin', {
        headers: { 'x-admin-key': keyToVerify.trim() },
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Invalid Admin Security Key.');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setRoster(data.roster);
      setWeeklyAccess(data.weeklyAccess);
      setEmailConfig(data.emailConfig);
      localStorage.setItem('peptalk_admin_key', keyToVerify.trim());
      setIsLoading(false);
    } catch {
      setErrorMessage('Failed to connect to admin service.');
      setIsLoading(false);
    }
  };

  const handleRotatePassword = async () => {
    if (!window.confirm('Are you sure you want to rotate this week\'s password? All previous passwords will expire, and active staff will need the new password.')) {
      return;
    }

    const shouldEmail = window.confirm('Would you like to automatically dispatch the new password email to all active clinic staff right now?');

    setIsLoading(true);
    resetAlerts();

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'rotate_password',
          dispatchEmails: shouldEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to rotate password.');
        setIsLoading(false);
        return;
      }

      setWeeklyAccess(data.weeklyAccess);
      const emailNote = shouldEmail && data.broadcastResult
        ? ` Dispatched emails to ${data.broadcastResult.totalSent} staff.`
        : '';
      setSuccessMessage(`Password successfully rotated to: ${data.weeklyAccess.currentPassword}!${emailNote}`);
      setIsLoading(false);
    } catch {
      setErrorMessage('Network error rotating password.');
      setIsLoading(false);
    }
  };

  const handleBroadcastEmails = async () => {
    if (!window.confirm('Send the current active weekly password to all active staff members?')) {
      return;
    }

    setIsLoading(true);
    resetAlerts();

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'dispatch_broadcast',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to broadcast emails.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Weekly password emails successfully sent to all staff!');
      setIsLoading(false);
      // Reload roster to reflect lastNotifiedAt without wiping success alert
      verifyKeyAndLoad(adminKey, true);
    } catch {
      setErrorMessage('Network error sending emails.');
      setIsLoading(false);
    }
  };

  const handleTestCronRun = async () => {
    if (!window.confirm('Trigger the automated weekly rotation now? This simulates the Sunday 11:30 PM cron run: rotates the password, emails all active staff, and sends the Director Summary to your Gmail.')) {
      return;
    }

    setIsLoading(true);
    resetAlerts();

    try {
      const res = await fetch(`/api/cron/rotate-passwords?key=${encodeURIComponent(adminKey)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to execute automated cron.');
        setIsLoading(false);
        return;
      }

      setWeeklyAccess((prev) => prev ? {
        ...prev,
        currentPassword: data.currentPassword,
        weekLabel: data.weekLabel,
        expiresAt: data.expiresAt,
      } : null);

      setSuccessMessage(`Automated Cron Executed! Rotated to: ${data.currentPassword}. Notified ${data.staffEmailedCount} staff + sent Director Summary to your Gmail.`);
      setIsLoading(false);
      verifyKeyAndLoad(adminKey, true);
    } catch {
      setErrorMessage('Network error executing cron.');
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsLoading(true);
    resetAlerts();

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'add_staff',
          email: newEmail.trim(),
          name: newName.trim(),
          role: newRole,
          sendEmail: sendEmailOnAdd,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to add staff member.');
        setIsLoading(false);
        return;
      }

      setRoster(data.roster);
      setSuccessMessage(data.message || `Added ${newEmail} to staff roster.`);
      setNewEmail('');
      setNewName('');
      setIsLoading(false);
    } catch {
      setErrorMessage('Network error adding staff.');
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setIsLoading(true);
    resetAlerts();

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'toggle_status',
          id: staffId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to update status.');
        setIsLoading(false);
        return;
      }

      setRoster(data.roster);
      setSuccessMessage(`Staff status updated to ${newStatus}.`);
      setIsLoading(false);
    } catch {
      setErrorMessage('Network error updating status.');
      setIsLoading(false);
    }
  };

  const handleRemoveStaff = async (staffId: string, staffEmail: string) => {
    if (!window.confirm(`Are you sure you want to completely remove ${staffEmail}? They will immediately lose all access to the PepTalk portal.`)) {
      return;
    }

    setIsLoading(true);
    resetAlerts();

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'remove_staff',
          id: staffId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to remove staff.');
        setIsLoading(false);
        return;
      }

      setRoster(data.roster);
      setSuccessMessage(`Removed ${staffEmail} from roster.`);
      setIsLoading(false);
    } catch {
      setErrorMessage('Network error removing staff.');
      setIsLoading(false);
    }
  };

  const handleSendSingleEmail = async (staffEmail: string) => {
    setIsLoading(true);
    resetAlerts();

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'dispatch_single',
          email: staffEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to dispatch email.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Sent weekly password to ${staffEmail}.`);
      setIsLoading(false);
      verifyKeyAndLoad(adminKey, true);
    } catch {
      setErrorMessage('Network error sending email.');
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, isBroadcast = false) => {
    navigator.clipboard.writeText(text);
    if (isBroadcast) {
      setCopiedBroadcast(true);
      setTimeout(() => setCopiedBroadcast(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleTestGeminiKey = async () => {
    const cleaned = localGeminiKey.trim().replace(/^['"]|['"]$/g, '');
    if (!cleaned && !hasServerKey) {
      setGeminiTestResult({ type: 'error', message: 'Please enter a Gemini API Key to test.' });
      return;
    }

    setIsTestingGemini(true);
    setGeminiTestResult(null);

    try {
      if (cleaned) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleaned}`);
        const data = await res.json();
        if (!res.ok || data.error) {
          setGeminiTestResult({
            type: 'error',
            message: data.error?.message || `Google API rejected this key (HTTP ${res.status}).`,
          });
        } else {
          setGeminiTestResult({
            type: 'success',
            message: 'Google Gemini API key verified successfully! Gemini 2.5 Flash / Pro models are active and responding.',
          });
        }
      } else if (hasServerKey) {
        setGeminiTestResult({
          type: 'success',
          message: 'Server-side Gemini API Key is configured in environment (.env.local / Vercel).',
        });
      }
    } catch (err: any) {
      setGeminiTestResult({
        type: 'error',
        message: `Network error verifying Gemini API Key: ${err.message}`,
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleSaveGeminiKey = () => {
    const cleaned = localGeminiKey.trim().replace(/^['"]|['"]$/g, '');
    if (onSaveGeminiKey) {
      onSaveGeminiKey(cleaned);
    } else {
      if (cleaned) {
        localStorage.setItem('peptalk_gemini_api_key', cleaned);
      } else {
        localStorage.removeItem('peptalk_gemini_api_key');
        localStorage.removeItem('peppal_gemini_api_key');
      }
    }
    setSuccessMessage('Gemini API Key configuration saved successfully. All clinic staff AI chat sessions will now use this key.');
    setGeminiTestResult({
      type: 'success',
      message: cleaned ? 'Gemini API Key saved and active for the clinic portal.' : 'Custom Gemini API Key cleared.',
    });
  };

  const handleClearGeminiKey = () => {
    setLocalGeminiKey('');
    if (onSaveGeminiKey) {
      onSaveGeminiKey('');
    } else {
      localStorage.removeItem('peptalk_gemini_api_key');
      localStorage.removeItem('peppal_gemini_api_key');
    }
    setGeminiTestResult(null);
    setSuccessMessage('Custom Gemini API Key removed.');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 17, 26, 0.72)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.2rem',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(127, 102, 255, 0.2)'
      }}>
        {/* Modal Top Bar */}
        <div style={{
          padding: '1.1rem 1.6rem',
          background: 'linear-gradient(90deg, #18113C 0%, #29186B 60%, #151A38 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={18} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                ClinicLivingPlus Staff Access & Weekly Passwords
              </h2>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Administrator Security Center · 100% User & Access Control
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '1.4rem 1.6rem', overflowY: 'auto', flex: 1 }}>
          {/* Alerts */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 0.9rem',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              color: '#B91C1C',
              fontSize: '0.82rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 0.9rem',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '10px',
              color: '#047857',
              fontSize: '0.82rem',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 1: ADMIN LOGIN PROMPT                                       */}
          {/* ---------------------------------------------------------------- */}
          {!isAuthenticated ? (
            <div style={{ maxWidth: '420px', margin: '2rem auto', textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: '#F1EEFE',
                color: '#7F66FF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <KeyRound size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111116', margin: '0 0 0.4rem 0' }}>
                Admin Authentication Required
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '0 0 1.4rem 0' }}>
                Enter your Clinic Administrator Security Key to manage staff access and rotate weekly passwords.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); verifyKeyAndLoad(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminKey ? 'text' : 'password'}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter Admin Security Key"
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 2.6rem 0.8rem 1rem',
                      fontSize: '0.92rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E4EB',
                      outline: 'none',
                      textAlign: 'center',
                      letterSpacing: '2px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    aria-label={showAdminKey ? 'Hide key' : 'Show key'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#8A8D9F',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                    }}
                  >
                    {showAdminKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Verifying...' : 'Unlock Admin Portal'}
                </button>
              </form>
            </div>
          ) : (
            /* ---------------------------------------------------------------- */
            /* STEP 2: AUTHENTICATED ADMIN DASHBOARD                            */
            /* ---------------------------------------------------------------- */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* SECTION 1: WEEKLY PASSWORD ROTATION CARD */}
              <div style={{
                background: '#F9FAFE',
                border: '1.5px solid rgba(127, 102, 255, 0.22)',
                borderRadius: '16px',
                padding: '1.4rem',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', background: '#F1EEFE', color: '#583EDB', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Calendar size={13} />
                        {weeklyAccess?.weekLabel || 'Active Week'}
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', background: '#ECFDF5', color: '#047857', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #A7F3D0' }}>
                        <span>🕒 Auto-Rotation: Every Sun 11:30 PM</span>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111116', margin: 0 }}>
                      Active Weekly Password
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.15rem' }}>
                      All authorized clinic staff use this key to sign in this week.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleTestCronRun}
                      disabled={isLoading}
                      title="Trigger the automated Sunday 11:30 PM cron rotation right now to test the full pipeline"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '9px',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)'
                      }}
                    >
                      <Zap size={14} color="#FBBF24" />
                      <span>Simulate Auto-Cron Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRotatePassword}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '9px',
                        background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(127, 102, 255, 0.35)'
                      }}
                    >
                      <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                      <span>Rotate Password for This Week</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBroadcastEmails}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '9px',
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      <Send size={14} />
                      <span>Email All Active Staff</span>
                    </button>
                  </div>
                </div>

                {/* Password Display Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                  border: '1.5px solid #7F66FF',
                  borderRadius: '12px',
                  padding: '1rem 1.4rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7F66FF', marginBottom: '0.2rem' }}>
                      Current Password (Expires in 7 days)
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px', color: '#583EDB' }}>
                      {weeklyAccess?.currentPassword || '—'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(weeklyAccess?.currentPassword || '')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.8rem',
                        background: copiedPass ? '#ECFDF5' : '#F4F5F9',
                        color: copiedPass ? '#059669' : '#4B5563',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedPass ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedPass ? 'Copied' : 'Copy Key'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = `ClinicLivingPlus Team: Here is our PepTalk portal access password for ${weeklyAccess?.weekLabel}: ${weeklyAccess?.currentPassword} (Valid for all approved @cliniclivingplus.com staff). Access at http://localhost:3000`;
                        copyToClipboard(msg, true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.8rem',
                        background: copiedBroadcast ? '#ECFDF5' : '#F4F5F9',
                        color: copiedBroadcast ? '#059669' : '#4B5563',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedBroadcast ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedBroadcast ? 'Copied Announcement' : 'Copy for WhatsApp / Slack'}</span>
                    </button>
                  </div>
                </div>

                {/* Email Service Status Banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', fontSize: '0.74rem', color: '#6B7280' }}>
                  {emailConfig?.smtpConfigured ? (
                    <>
                      <CheckCircle2 size={14} color="#10B981" />
                      <span><strong>Gmail SMTP Active:</strong> Emails sending directly from <code>{emailConfig.smtpUser}</code> to all staff.</span>
                    </>
                  ) : emailConfig?.resendConfigured ? (
                    <>
                      <CheckCircle2 size={14} color="#10B981" />
                      <span><strong>Resend Active:</strong> Email service connected.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="#F59E0B" />
                      <span><strong>Email Configuration:</strong> Add <code>SMTP_USER</code> & <code>SMTP_PASS</code> in .env.local to send automatic emails directly via Gmail.</span>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION 2: GOOGLE GEMINI AI ENGINE CONFIGURATION */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(127, 102, 255, 0.25)',
                borderRadius: '16px',
                padding: '1.35rem',
                boxShadow: '0 4px 18px rgba(127, 102, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111116', margin: 0 }}>
                          Google Gemini AI Engine Key
                        </h3>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: '#F1EEFE',
                          color: '#583EDB',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          Admin Exclusive
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '0.15rem' }}>
                        Powers AI Chat & RAG clinical queries across 699 monographs for all authorized staff.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      background: (localGeminiKey || hasServerKey) ? '#ECFDF5' : '#FFFBEB',
                      border: `1px solid ${(localGeminiKey || hasServerKey) ? '#A7F3D0' : '#FDE68A'}`,
                      color: (localGeminiKey || hasServerKey) ? '#047857' : '#B45309',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: (localGeminiKey || hasServerKey) ? '#10B981' : '#F59E0B' }} />
                      <span>{(localGeminiKey || hasServerKey) ? 'AI Engine Ready' : 'Key Required'}</span>
                    </div>
                  </div>
                </div>

                {/* Input Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                      <input
                        type={showGeminiKey ? 'text' : 'password'}
                        value={localGeminiKey}
                        onChange={(e) => setLocalGeminiKey(e.target.value)}
                        placeholder={hasServerKey ? "Using server key from .env.local (or paste custom key)" : "AIzaSy... (Paste Google Gemini API Key)"}
                        style={{
                          width: '100%',
                          padding: '0.6rem 2.4rem 0.6rem 0.85rem',
                          fontSize: '0.86rem',
                          borderRadius: '9px',
                          border: '1.5px solid #CBD5E1',
                          outline: 'none',
                          background: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        aria-label={showGeminiKey ? 'Hide key' : 'Show key'}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#8A8D9F',
                          cursor: 'pointer',
                          padding: '3px',
                          display: 'flex',
                        }}
                      >
                        {showGeminiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestGeminiKey}
                      disabled={isTestingGemini || (!localGeminiKey.trim() && !hasServerKey)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.6rem 0.95rem',
                        borderRadius: '9px',
                        background: '#F1F5F9',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: (!localGeminiKey.trim() && !hasServerKey) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isTestingGemini ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} color="#7F66FF" />}
                      <span>{isTestingGemini ? 'Testing...' : 'Test Key'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveGeminiKey}
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.6rem 1.1rem',
                        borderRadius: '9px',
                        background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(127, 102, 255, 0.3)'
                      }}
                    >
                      <Check size={14} />
                      <span>Save Key</span>
                    </button>

                    {localGeminiKey && (
                      <button
                        type="button"
                        onClick={handleClearGeminiKey}
                        title="Remove custom key"
                        style={{
                          padding: '0.6rem 0.8rem',
                          borderRadius: '9px',
                          background: '#FEF2F2',
                          color: '#EF4444',
                          border: '1px solid #FECACA',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Feedback on test */}
                  {geminiTestResult && (
                    <div style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: geminiTestResult.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                      border: `1px solid ${geminiTestResult.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                      color: geminiTestResult.type === 'success' ? '#065F46' : '#991B1B'
                    }}>
                      {geminiTestResult.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{geminiTestResult.message}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.72rem', color: '#64748B' }}>
                    <span>
                      {hasServerKey ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>✓ Server fallback key detected in .env.local</span>
                      ) : (
                        <span>Configured key applies to all clinic users automatically without them needing to enter keys.</span>
                      )}
                    </span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#7F66FF', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <span>Get a free key from Google AI Studio</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {/* SECTION 3: STAFF ROSTER TABLE */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111116', margin: 0 }}>
                      Approved Clinical Staff Roster ({roster.length} members)
                    </h3>
                    <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                      Only users listed here can log in. Removing or suspending a user blocks them immediately.
                    </div>
                  </div>
                </div>

                {/* Add Staff Inline Form */}
                <form onSubmit={handleAddStaff} style={{
                  display: 'flex',
                  gap: '0.5rem',
                  background: '#F8FAFC',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="doctor@cliniclivingplus.com"
                    required
                    style={{
                      flex: 1.5,
                      minWidth: '220px',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Staff Full Name (e.g. Dr. John)"
                    style={{
                      flex: 1.2,
                      minWidth: '180px',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  >
                    <option value="Lead Clinician">Lead Clinician</option>
                    <option value="Attending Physician">Attending Physician</option>
                    <option value="Clinical Fellow">Clinical Fellow</option>
                    <option value="Research Fellow">Research Fellow</option>
                    <option value="Clinic Staff">Clinic Staff</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.55rem 0.95rem',
                      borderRadius: '8px',
                      background: '#7F66FF',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <UserPlus size={15} />
                    <span>Add to Roster</span>
                  </button>
                </form>

                {/* Roster Table */}
                <div style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                        <th style={{ padding: '0.65rem 0.9rem', fontWeight: 700 }}>Staff Member</th>
                        <th style={{ padding: '0.65rem 0.9rem', fontWeight: 700 }}>Clinical Role</th>
                        <th style={{ padding: '0.65rem 0.9rem', fontWeight: 700 }}>Access Status</th>
                        <th style={{ padding: '0.65rem 0.9rem', fontWeight: 700 }}>Last Emailed</th>
                        <th style={{ padding: '0.65rem 0.9rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((staff, idx) => (
                        <tr key={staff.id} style={{
                          borderBottom: idx < roster.length - 1 ? '1px solid #F1F5F9' : 'none',
                          background: staff.status === 'suspended' ? '#FEF2F2' : '#FFFFFF'
                        }}>
                          <td style={{ padding: '0.75rem 0.9rem' }}>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{staff.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{staff.email}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.9rem' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              background: '#F1EEFE',
                              color: '#583EDB',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600
                            }}>
                              {staff.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.9rem' }}>
                            {staff.status === 'active' ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: '#059669',
                                fontWeight: 700,
                                fontSize: '0.74rem'
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                Active
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: '#DC2626',
                                fontWeight: 700,
                                fontSize: '0.74rem'
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }} />
                                Suspended
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 0.9rem', color: '#64748B', fontSize: '0.74rem' }}>
                            {staff.lastNotifiedAt ? new Date(staff.lastNotifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
                          </td>
                          <td style={{ padding: '0.75rem 0.9rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                              {/* Email button */}
                              <button
                                type="button"
                                title="Send weekly password email to this doctor"
                                onClick={() => handleSendSingleEmail(staff.email)}
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  background: '#F1F5F9',
                                  color: '#334155',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Mail size={13} />
                                <span>Email</span>
                              </button>

                              {/* Suspend / Reactivate */}
                              <button
                                type="button"
                                title={staff.status === 'active' ? 'Suspend access' : 'Reactivate access'}
                                onClick={() => handleToggleStatus(staff.id, staff.status)}
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  background: staff.status === 'active' ? '#FFFBEB' : '#ECFDF5',
                                  color: staff.status === 'active' ? '#B45309' : '#059669',
                                  border: '1px solid transparent',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {staff.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>

                              {/* Remove */}
                              <button
                                type="button"
                                title="Delete from roster"
                                onClick={() => handleRemoveStaff(staff.id, staff.email)}
                                style={{
                                  padding: '0.35rem 0.45rem',
                                  background: '#FEF2F2',
                                  color: '#EF4444',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
