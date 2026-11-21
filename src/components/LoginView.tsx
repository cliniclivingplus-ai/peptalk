'use strict';
'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Dna,
  FlaskConical,
  Check,
  ShieldAlert,
  Info,
  Sparkles,
} from 'lucide-react';
import AdminPortalModal from './AdminPortalModal';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; domain: string }) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Real-time domain validation check
  const trimmedEmail = email.trim().toLowerCase();
  const hasAt = trimmedEmail.includes('@');
  const isClinicDomain = trimmedEmail.endsWith('@cliniclivingplus.com');
  const isOtherDomain = hasAt && !isClinicDomain && trimmedEmail.split('@')[1]?.includes('.');

  const resetMessages = () => {
    setErrorMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setErrorMessage('Please enter your clinic email address.');
      return;
    }

    if (!isClinicDomain) {
      setErrorMessage('Access Denied: Only @cliniclivingplus.com email addresses are permitted.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: trimmedEmail,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess({
        email: data.user?.email || trimmedEmail,
        domain: data.user?.domain || 'cliniclivingplus.com',
      });
    } catch (err: any) {
      console.error('Login submit error:', err);
      setErrorMessage('Network or server connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      maxHeight: '100vh',
      maxWidth: '100vw',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 10%, #F5F2FE 0%, #FFFFFF 55%, #F0F4FC 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      boxSizing: 'border-box'
    }}>
      {/* ==================================================================== */}
      {/* FLOATING PEPTIDE BACKGROUND PARTICLES & ICONS                         */}
      {/* ==================================================================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Soft glowing color spots */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127, 102, 255, 0.16) 0%, rgba(127, 102, 255, 0) 70%)',
        }} className="peptide-pulse-glow" />

        <div style={{
          position: 'absolute',
          bottom: '-12%',
          right: '12%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 210, 180, 0.14) 0%, rgba(0, 210, 180, 0) 70%)',
        }} className="peptide-pulse-glow" />

        {/* Floating Peptide Icons */}
        <div style={{
          position: 'absolute',
          top: '7%',
          left: '6%',
          color: '#7F66FF',
          opacity: 0.38,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-slow">
          <Dna size={42} strokeWidth={1.75} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7F66FF' }}>
            BPC-157
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '7%',
          right: '7%',
          color: '#00BFA5',
          opacity: 0.35,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-reverse">
          <FlaskConical size={38} strokeWidth={1.75} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00BFA5' }}>
            CJC-1295
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: '10%',
          right: '8%',
          color: '#10B981',
          opacity: 0.35,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-medium">
          <Sparkles size={36} strokeWidth={1.75} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10B981' }}>
            TB-500
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '8%',
          left: '8%',
          color: '#8B5CF6',
          opacity: 0.32,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-slow">
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B5CF6' }}>
            RETATRUTIDE
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN AUTHENTICATION CARD (ZERO-SCROLL VIEWPORT FITTED)                 */}
      {/* ==================================================================== */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '920px',
        maxHeight: 'min(590px, 94vh)',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid rgba(127, 102, 255, 0.18)',
        boxShadow: '0 24px 64px -14px rgba(127, 102, 255, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* ------------------------------------------------------------------ */}
        {/* LEFT PANEL: CLINICAL PEPTIDE BRANDING & TRUST SHOWCASE             */}
        {/* ------------------------------------------------------------------ */}
        <div style={{
          width: '330px',
          flexShrink: 0,
          background: 'linear-gradient(150deg, #1C1344 0%, #29186B 55%, #101633 100%)',
          color: '#FFFFFF',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Subtle background glow circle */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(127, 102, 255, 0.35) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Branding */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#A7F3D0',
              marginBottom: '1.25rem'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              ClinicLivingPlus Security
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(127, 102, 255, 0.45)'
              }}>
                <Dna size={22} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                PepTalk
              </h2>
            </div>

            <p style={{
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.72)',
              lineHeight: 1.45,
              margin: '0.4rem 0 1.35rem 0'
            }}>
              Clinical Peptide Intelligence & Masterclass Archive for authorized practitioners.
            </p>

            {/* Scientific Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 0.7rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.07)'
              }}>
                <Dna size={15} color="#A594FD" />
                <span><strong>699</strong> Evidence Monographs</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 0.7rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.07)'
              }}>
                <FlaskConical size={15} color="#34D399" />
                <span><strong>17</strong> Clinical Master Protocols</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 0.7rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.07)'
              }}>
                <ShieldCheck size={15} color="#60A5FA" />
                <span>Domain Restricted Access</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Info */}
          <div style={{
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.55)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>256-bit Cryptographic HMAC</span>
            <span style={{ color: '#A594FD', fontWeight: 700 }}>v2.4</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT PANEL: UNIFIED CLINICAL PRACTITIONER SIGN IN                 */}
        {/* ------------------------------------------------------------------ */}
        <div style={{
          flex: 1,
          padding: '1.6rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}>
          <div>
            {/* Top Bar with Admin Access Pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7F66FF' }}>
                Clinic Access
              </span>
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.22rem 0.6rem',
                  background: '#F1EEFE',
                  border: '1px solid rgba(127, 102, 255, 0.25)',
                  borderRadius: '6px',
                  color: '#583EDB',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ShieldAlert size={12} />
                <span>Admin Roster & Passwords</span>
              </button>
            </div>

            {/* Title & Domain Policy */}
            <div style={{ marginBottom: '0.85rem' }}>
              <h1 style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#111116',
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.02em'
              }}>
                Clinical Practitioner Sign In
              </h1>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.76rem',
                color: '#4B5563',
              }}>
                <ShieldCheck size={14} color="#7F66FF" />
                <span>Strict Domain Policy:</span>
                <span style={{ fontWeight: 700, color: '#583EDB' }}>@cliniclivingplus.com</span>
              </div>
            </div>

            {/* Practitioner Instructions Guide Box */}
            <div style={{
              background: '#F7F6FD',
              border: '1px solid #E4E0FB',
              borderRadius: '10px',
              padding: '0.7rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4F38CA', fontSize: '0.75rem', fontWeight: 700 }}>
                <Info size={14} color="#7F66FF" />
                <span>First-Time & Returning Doctors Login Guide</span>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '1.2rem',
                fontSize: '0.73rem',
                color: '#4B5563',
                lineHeight: 1.45
              }}>
                <li>
                  <strong>No account signup needed:</strong> Simply enter your official <span style={{ color: '#583EDB', fontWeight: 600 }}>@cliniclivingplus.com</span> work email below.
                </li>
                <li>
                  <strong>Weekly Password:</strong> Enter this week&apos;s active clinical passcode dispatched to your email inbox.
                </li>
                <li>
                  <strong>Automatic Weekly Rotation:</strong> Passwords rotate and are re-emailed every Sunday at 11:30 PM IST.
                </li>
              </ul>
            </div>

            {/* Inline Error Alerts */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '0.78rem',
                marginBottom: '0.75rem'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Sign In Form */}
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.25rem' }}>
                  Work Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: isClinicDomain ? '#10B981' : isOtherDomain ? '#EF4444' : '#8A8D9F',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="doctor@cliniclivingplus.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.35rem',
                      fontSize: '0.86rem',
                      borderRadius: '10px',
                      border: isClinicDomain
                        ? '1.5px solid #10B981'
                        : isOtherDomain
                        ? '1.5px solid #EF4444'
                        : '1.5px solid #E2E4EB',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#111116',
                      boxSizing: 'border-box',
                      boxShadow: isClinicDomain
                        ? '0 0 0 3px rgba(16, 185, 129, 0.12)'
                        : isOtherDomain
                        ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                        : 'none',
                    }}
                  />
                </div>

                {isClinicDomain && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                    <CheckCircle2 size={12} color="#059669" />
                    Verified ClinicLivingPlus Domain
                  </div>
                )}

                {isOtherDomain && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#DC2626', fontWeight: 600, marginTop: '0.2rem' }}>
                    <AlertCircle size={12} color="#DC2626" />
                    Restricted: Only @cliniclivingplus.com is accepted
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.25rem' }}>
                  Weekly Clinical Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#8A8D9F',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter this week's active password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.6rem 0.65rem 2.35rem',
                      fontSize: '0.86rem',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E4EB',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#111116',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
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
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Workstation Remember Me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '14px',
                    height: '14px',
                    accentColor: '#7F66FF',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.76rem', color: '#55586B', cursor: 'pointer', userSelect: 'none' }}>
                  Keep signed in on this clinical workstation (7 days)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: isLoading
                    ? '#A594FD'
                    : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 18px -3px rgba(127, 102, 255, 0.4)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  marginTop: '0.15rem'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Clinical Portal</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card micro-footer */}
          <div style={{
            fontSize: '0.72rem',
            color: '#8A8D9F',
            borderTop: '1px solid #F0F1F6',
            paddingTop: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={12} color="#10B981" />
              <span>Verified Organization Access</span>
            </div>
            <span>Support: it@cliniclivingplus.com</span>
          </div>
        </div>
      </div>

      {/* Admin Management Modal */}
      <AdminPortalModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
