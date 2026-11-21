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
  Check,
  ShieldAlert,
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
      setErrorMessage('Please enter your weekly password.');
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
        setErrorMessage(data.error || 'Authentication failed. Please check your email and weekly password.');
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
      padding: '1.25rem',
      position: 'relative',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      boxSizing: 'border-box'
    }}>
      {/* ==================================================================== */}
      {/* FLOATING PEPTIDE BACKGROUND PARTICLES                                */}
      {/* ==================================================================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
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

        {/* Subtle Watermarks */}
        <div style={{
          position: 'absolute',
          top: '6%',
          left: '5%',
          color: '#7F66FF',
          opacity: 0.35,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-slow">
          <Dna size={38} strokeWidth={1.75} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7F66FF' }}>
            BPC-157
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '6%',
          right: '6%',
          color: '#00BFA5',
          opacity: 0.35,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-reverse">
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00BFA5' }}>
            CJC-1295
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN AUTHENTICATION CARD                                             */}
      {/* ==================================================================== */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '960px',
        maxHeight: 'min(620px, 94vh)',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid rgba(127, 102, 255, 0.18)',
        boxShadow: '0 24px 64px -14px rgba(127, 102, 255, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* ------------------------------------------------------------------ */}
        {/* LEFT PANEL: PEPTALK + ULTRA-SIMPLE 4-STEP ACCESS GUIDE             */}
        {/* ------------------------------------------------------------------ */}
        <div style={{
          width: '375px',
          flexShrink: 0,
          background: 'linear-gradient(155deg, #1A123E 0%, #251660 50%, #0F132B 100%)',
          color: '#FFFFFF',
          padding: '2rem 1.85rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(127, 102, 255, 0.35) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Brand Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.28rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              fontSize: '0.67rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#A7F3D0',
              marginBottom: '1rem'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              ClinicLivingPlus Security
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
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
                fontSize: '1.45rem',
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
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.45,
              margin: '0.2rem 0 1.25rem 0'
            }}>
              Clinical Peptide Intelligence & Masterclass Archive for authorized practitioners.
            </p>

            {/* STEP-BY-STEP SIMPLE GUIDE (UNDERSTANDABLE BY A 5-YEAR OLD) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0.9rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#A594FD',
                marginBottom: '0.1rem'
              }}>
                How To Sign In · Step-by-Step
              </div>

              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(127, 102, 255, 0.25)',
                  border: '1px solid rgba(127, 102, 255, 0.5)',
                  color: '#C4B5FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  1
                </div>
                <div>
                  <div style={{ fontSize: '0.79rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Enter your clinic email
                  </div>
                  <div style={{ fontSize: '0.71rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.35, marginTop: '1px' }}>
                    Type your official <strong style={{ color: '#E0E7FF' }}>@cliniclivingplus.com</strong> address.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(0, 210, 180, 0.22)',
                  border: '1px solid rgba(0, 210, 180, 0.45)',
                  color: '#6EE7B7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  2
                </div>
                <div>
                  <div style={{ fontSize: '0.79rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Open your email inbox
                  </div>
                  <div style={{ fontSize: '0.71rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.35, marginTop: '1px' }}>
                    Find the email with subject: <em style={{ color: '#E0E7FF' }}>&quot;Weekly PepTalk Access Code&quot;</em>.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.22)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  color: '#FCD34D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: '0.79rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Copy & paste the password
                  </div>
                  <div style={{ fontSize: '0.71rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.35, marginTop: '1px' }}>
                    Paste this week&apos;s active password into the box and click Sign In.
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.22)',
                  border: '1px solid rgba(59, 130, 246, 0.45)',
                  color: '#93C5FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  4
                </div>
                <div>
                  <div style={{ fontSize: '0.79rem', fontWeight: 700, color: '#FFFFFF' }}>
                    New password every Sunday
                  </div>
                  <div style={{ fontSize: '0.71rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.35, marginTop: '1px' }}>
                    Every Sunday night at 11:30 PM, a fresh code arrives for the next week.
                  </div>
                </div>
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
        {/* RIGHT PANEL: CLEAN, MINIMAL, ULTRA-SPACIOUS LOGIN FORM            */}
        {/* ------------------------------------------------------------------ */}
        <div style={{
          flex: 1,
          padding: '2.25rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}>
          <div>
            {/* Top Bar with Admin Access Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7F66FF' }}>
                Clinic Portal
              </span>
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.65rem',
                  background: '#F1EEFE',
                  border: '1px solid rgba(127, 102, 255, 0.25)',
                  borderRadius: '7px',
                  color: '#583EDB',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                <ShieldAlert size={13} />
                <span>Admin Roster & Passwords</span>
              </button>
            </div>

            {/* Clean Title */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#111116',
                margin: '0 0 0.35rem 0',
                letterSpacing: '-0.025em'
              }}>
                Sign In
              </h1>
              <p style={{
                fontSize: '0.86rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.4
              }}>
                Enter your clinic email and this week&apos;s password to continue.
              </p>
            </div>

            {/* Inline Error Alerts */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                color: '#B91C1C',
                fontSize: '0.8rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Clean Login Form */}
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Work Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.35rem' }}>
                  Work Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
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
                      padding: '0.75rem 0.95rem 0.75rem 2.6rem',
                      fontSize: '0.9rem',
                      borderRadius: '11px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                    <CheckCircle2 size={13} color="#059669" />
                    Verified ClinicLivingPlus Domain
                  </div>
                )}

                {isOtherDomain && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '0.35rem' }}>
                    <AlertCircle size={13} color="#DC2626" />
                    Only @cliniclivingplus.com work emails are permitted
                  </div>
                )}
              </div>

              {/* Weekly Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.35rem' }}>
                  This Week&apos;s Clinical Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
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
                    placeholder="Enter password from your email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.8rem 0.75rem 2.6rem',
                      fontSize: '0.9rem',
                      borderRadius: '11px',
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
                      right: '12px',
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Workstation Remember Me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '15px',
                    height: '15px',
                    accentColor: '#7F66FF',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.79rem', color: '#55586B', cursor: 'pointer', userSelect: 'none' }}>
                  Keep me signed in on this workstation (7 days)
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
                  padding: '0.82rem',
                  borderRadius: '11px',
                  background: isLoading
                    ? '#A594FD'
                    : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 18px -3px rgba(127, 102, 255, 0.4)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  marginTop: '0.5rem'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Clinical Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Clean Micro Footer */}
          <div style={{
            fontSize: '0.74rem',
            color: '#8A8D9F',
            borderTop: '1px solid #F0F1F6',
            paddingTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={13} color="#10B981" />
              <span>Strict Clinic Domain Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Modal */}
      <AdminPortalModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
