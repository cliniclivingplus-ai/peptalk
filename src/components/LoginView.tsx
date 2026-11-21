'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Dna,
  Atom,
  Pill,
  FlaskConical,
  Activity,
  Check,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; domain: string }) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Email -> Step 2: OTP + Password

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Real-time domain validation check
  const trimmedEmail = email.trim().toLowerCase();
  const hasAt = trimmedEmail.includes('@');
  const isClinicDomain = trimmedEmail.endsWith('@cliniclivingplus.com');
  const isOtherDomain = hasAt && !isClinicDomain && trimmedEmail.split('@')[1]?.includes('.');

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep(1);
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setDevOtp(null);
    resetMessages();
  };

  // --------------------------------------------------------------------------
  // FLOW 1: Standard Sign In
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // FLOW 2 & 3: Request OTP (First-Time Activation or Forgot Password)
  // --------------------------------------------------------------------------
  const handleRequestOtp = async (e: React.FormEvent) => {
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

    setIsLoading(true);

    try {
      const purpose = mode === 'signup' ? 'signup' : 'reset';
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_otp',
          email: trimmedEmail,
          purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to dispatch verification code.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(data.message || `Verification code sent to ${trimmedEmail}`);
      if (data.simulated && data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep(2);
      setCooldown(60);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Request OTP error:', err);
      setErrorMessage('Network or server connection error. Please try again.');
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // FLOW 2: Complete First-Time Password Creation
  // --------------------------------------------------------------------------
  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_password',
          email: trimmedEmail,
          otp: otp.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to activate account.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess({
        email: data.user?.email || trimmedEmail,
        domain: data.user?.domain || 'cliniclivingplus.com',
      });
    } catch (err: any) {
      console.error('Create password error:', err);
      setErrorMessage('Network or server connection error. Please try again.');
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // FLOW 3: Complete Password Reset
  // --------------------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: trimmedEmail,
          otp: otp.trim(),
          newPassword: password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to reset password.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess({
        email: data.user?.email || trimmedEmail,
        domain: data.user?.domain || 'cliniclivingplus.com',
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
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
        {/* 1. DNA Helix Top-Left */}
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

        {/* 2. Atom Top-Right */}
        <div style={{
          position: 'absolute',
          top: '9%',
          right: '7%',
          color: '#10B981',
          opacity: 0.42,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-medium">
          <Atom size={40} strokeWidth={1.75} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10B981' }}>
            TB-500
          </span>
        </div>

        {/* 3. Peptide Capsule Bottom-Left */}
        <div style={{
          position: 'absolute',
          bottom: '8%',
          left: '8%',
          color: '#583EDB',
          opacity: 0.38,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-fast">
          <Pill size={36} strokeWidth={1.8} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#583EDB' }}>
            Retatrutide
          </span>
        </div>

        {/* 4. Flask Laboratory Bottom-Right */}
        <div style={{
          position: 'absolute',
          bottom: '7%',
          right: '8%',
          color: '#8B5CF6',
          opacity: 0.4,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="peptide-float-medium">
          <FlaskConical size={38} strokeWidth={1.8} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B5CF6' }}>
            CJC-1295
          </span>
        </div>

        {/* 5. Bioactivity Mid-Left */}
        <div style={{
          position: 'absolute',
          top: '48%',
          left: '3%',
          color: '#059669',
          opacity: 0.32,
        }} className="peptide-float-slow">
          <Activity size={32} strokeWidth={1.75} />
        </div>

        {/* 6. Sparkles Mid-Right */}
        <div style={{
          position: 'absolute',
          top: '46%',
          right: '4%',
          color: '#F59E0B',
          opacity: 0.35,
        }} className="peptide-float-fast">
          <Sparkles size={30} strokeWidth={1.75} />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN EXECUTIVE PORTAL CARD (DUAL-PANEL, FIT-TO-VIEWPORT)             */}
      {/* ==================================================================== */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '920px',
        maxHeight: 'min(580px, 94vh)',
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
              marginBottom: '1rem'
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
              margin: '0.4rem 0 1.25rem 0'
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
                padding: '0.45rem 0.65rem',
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
                padding: '0.45rem 0.65rem',
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
                padding: '0.45rem 0.65rem',
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
        {/* RIGHT PANEL: COMPACT AUTH FORM & CLEAR NAVIGATION TABS            */}
        {/* ------------------------------------------------------------------ */}
        <div style={{
          flex: 1,
          padding: '1.5rem 1.85rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}>
          <div>
            {/* Top Navigation Tabs - Completely eliminates hunting for links! */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem',
              background: '#F4F5F9',
              borderRadius: '10px',
              marginBottom: '1rem',
              border: '1px solid #ECEEF4'
            }}>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: mode === 'signin' ? 700 : 600,
                  color: mode === 'signin' ? '#583EDB' : '#6B7280',
                  background: mode === 'signin' ? '#FFFFFF' : 'transparent',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: mode === 'signin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Lock size={13} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('signup')}
                style={{
                  flex: 1.15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: mode === 'signup' ? 700 : 600,
                  color: mode === 'signup' ? '#583EDB' : '#6B7280',
                  background: mode === 'signup' ? '#FFFFFF' : 'transparent',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Sparkles size={13} />
                <span>First-Time Setup</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('forgot')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: mode === 'forgot' ? 700 : 600,
                  color: mode === 'forgot' ? '#583EDB' : '#6B7280',
                  background: mode === 'forgot' ? '#FFFFFF' : 'transparent',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: mode === 'forgot' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <KeyRound size={13} />
                <span>Forgot Pass</span>
              </button>
            </div>

            {/* Compact Header Title */}
            <div style={{ marginBottom: '0.75rem' }}>
              <h1 style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#111116',
                margin: '0 0 0.2rem 0',
                letterSpacing: '-0.02em'
              }}>
                {mode === 'signin' && 'Clinical Workstation Login'}
                {mode === 'signup' && 'Activate Clinical Account'}
                {mode === 'forgot' && 'Reset Staff Passcode'}
              </h1>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.74rem',
                color: '#4B5563',
              }}>
                <ShieldCheck size={13} color="#7F66FF" />
                <span>Strict Domain Policy:</span>
                <span style={{ fontWeight: 700, color: '#583EDB' }}>@cliniclivingplus.com</span>
              </div>
            </div>

            {/* Inline Alerts */}
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

            {successMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                color: '#047857',
                fontSize: '0.78rem',
                marginBottom: '0.75rem'
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Dev / Local Mode OTP Auto-fill Badge */}
            {devOtp && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                background: '#FFFBEB',
                border: '1px dashed #F59E0B',
                borderRadius: '8px',
                color: '#92400E',
                fontSize: '0.76rem',
                marginBottom: '0.75rem'
              }}>
                <div>
                  Local Code: <strong style={{ fontSize: '0.95rem', letterSpacing: '1.5px', color: '#B45309' }}>{devOtp}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  style={{
                    background: '#F59E0B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 1: SIGN IN                                                 */}
            {/* ============================================================== */}
            {mode === 'signin' && (
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E202A' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '0.74rem',
                        color: '#7F66FF',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Forgot?
                    </button>
                  </div>

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
                      placeholder="Enter clinical password"
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Clinical Portal</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* TAB 2: FIRST-TIME ACTIVATION                                   */}
            {/* ============================================================== */}
            {mode === 'signup' && (
              <div>
                {step === 1 ? (
                  <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.25rem' }}>
                        Clinic Work Email
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
                      }}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Dispatching Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code (OTP)</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCreatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#4B5563',
                      background: '#F8F9FE',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Sent to: <strong>{trimmedEmail}</strong></span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{ background: 'none', border: 'none', color: '#7F66FF', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Compact OTP input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="6-digit OTP"
                          required
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            fontSize: '1rem',
                            fontWeight: 800,
                            letterSpacing: '4px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            border: '1.5px solid #7F66FF',
                            outline: 'none',
                            background: '#FBFBFF',
                            color: '#583EDB',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={cooldown > 0 || isLoading}
                        onClick={handleRequestOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '0.72rem',
                          color: cooldown > 0 ? '#9CA3AF' : '#7F66FF',
                          fontWeight: 600,
                          cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
                      </button>
                    </div>

                    {/* Passwords in 2 columns to save height! */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="New password (8+)"
                          required
                          minLength={8}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: '1.5px solid #E2E4EB',
                            outline: 'none',
                            background: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          minLength={8}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: '1.5px solid #E2E4EB',
                            outline: 'none',
                            background: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        background: isLoading ? '#A594FD' : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 6px 18px -3px rgba(127, 102, 255, 0.4)',
                      }}
                    >
                      {isLoading ? <span>Activating...</span> : <span>Activate & Sign In</span>}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: FORGOT PASSWORD                                         */}
            {/* ============================================================== */}
            {mode === 'forgot' && (
              <div>
                {step === 1 ? (
                  <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.25rem' }}>
                        Your Clinic Email
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
                          }}
                        />
                      </div>

                      {isClinicDomain && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                          <CheckCircle2 size={12} color="#059669" />
                          Verified ClinicLivingPlus Domain
                        </div>
                      )}
                    </div>

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
                      }}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Dispatching Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Password Reset OTP</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#4B5563',
                      background: '#F8F9FE',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Resetting for: <strong>{trimmedEmail}</strong></span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{ background: 'none', border: 'none', color: '#7F66FF', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Compact OTP input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="6-digit OTP"
                          required
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            fontSize: '1rem',
                            fontWeight: 800,
                            letterSpacing: '4px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            border: '1.5px solid #7F66FF',
                            outline: 'none',
                            background: '#FBFBFF',
                            color: '#583EDB',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={cooldown > 0 || isLoading}
                        onClick={handleRequestOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '0.72rem',
                          color: cooldown > 0 ? '#9CA3AF' : '#7F66FF',
                          fontWeight: 600,
                          cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
                      </button>
                    </div>

                    {/* Two columns for passwords */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="New password (8+)"
                          required
                          minLength={8}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: '1.5px solid #E2E4EB',
                            outline: 'none',
                            background: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          minLength={8}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.65rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: '1.5px solid #E2E4EB',
                            outline: 'none',
                            background: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        background: isLoading ? '#A594FD' : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 6px 18px -3px rgba(127, 102, 255, 0.4)',
                      }}
                    >
                      {isLoading ? <span>Updating...</span> : <span>Reset Password & Sign In</span>}
                    </button>
                  </form>
                )}
              </div>
            )}
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
    </div>
  );
}
