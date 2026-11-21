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
  Building2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; domain: string }) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: email -> Step 2: OTP & password

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

  // Cooldown countdown for resending OTP
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

      // Successful login
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
  // FLOW 2 & 3: Request OTP (for First-Time Creation or Forgot Password)
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
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 50% 15%, #F4F1FE 0%, #FFFFFF 65%, #F8F9FD 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Container Card */}
      <div style={{
        width: '100%',
        maxWidth: '470px',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid rgba(127, 102, 255, 0.16)',
        boxShadow: '0 20px 60px -15px rgba(127, 102, 255, 0.14), 0 0 1px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Decorative Clinic Accent Bar */}
        <div style={{
          height: '6px',
          width: '100%',
          background: 'linear-gradient(90deg, #7F66FF 0%, #583EDB 50%, #00D2B4 100%)'
        }} />

        <div style={{ padding: '2.4rem 2.2rem 2.2rem 2.2rem' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(127, 102, 255, 0.35)',
              marginBottom: '0.9rem'
            }}>
              {mode === 'signup' ? (
                <Sparkles size={26} strokeWidth={2.2} />
              ) : mode === 'forgot' ? (
                <KeyRound size={26} strokeWidth={2.2} />
              ) : (
                <Building2 size={26} strokeWidth={2.2} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#7F66FF',
                background: '#F1EEFE',
                padding: '0.22rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(127, 102, 255, 0.2)'
              }}>
                ClinicLivingPlus Staff Portal
              </span>
            </div>

            <h1 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#111116',
              letterSpacing: '-0.025em',
              margin: '0.3rem 0 0.35rem 0'
            }}>
              {mode === 'signin' && 'PepTalk Clinical Access'}
              {mode === 'signup' && 'Create Your Clinical Password'}
              {mode === 'forgot' && 'Reset Clinical Password'}
            </h1>

            <p style={{
              fontSize: '0.84rem',
              color: '#5C5E70',
              margin: 0,
              lineHeight: 1.45
            }}>
              {mode === 'signin' && 'Sign in with your verified clinic account to access monographs & protocols.'}
              {mode === 'signup' && step === 1 && 'First time here? Verify your clinic email with a one-time passcode.'}
              {mode === 'signup' && step === 2 && 'Enter the 6-digit OTP sent to your mail and choose your password.'}
              {mode === 'forgot' && step === 1 && 'Enter your clinic email to receive a password reset verification code.'}
              {mode === 'forgot' && step === 2 && 'Enter the 6-digit OTP and set your new clinical password.'}
            </p>
          </div>

          {/* Domain Enforcement Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            padding: '0.75rem 0.9rem',
            background: '#F8F9FE',
            border: '1px solid rgba(127, 102, 255, 0.15)',
            borderRadius: '12px',
            marginBottom: '1.4rem',
            fontSize: '0.78rem',
            color: '#434759',
            lineHeight: 1.45
          }}>
            <ShieldCheck size={17} style={{ color: '#7F66FF', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#1E202A' }}>Domain Policy:</strong> Only{' '}
              <span style={{
                background: '#EAE5FD',
                color: '#583EDB',
                fontWeight: 700,
                padding: '0.1rem 0.35rem',
                borderRadius: '5px'
              }}>
                @cliniclivingplus.com
              </span>{' '}
              email addresses are authorized.
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.8rem 0.95rem',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              color: '#B91C1C',
              fontSize: '0.82rem',
              lineHeight: 1.4,
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.8rem 0.95rem',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              color: '#047857',
              fontSize: '0.82rem',
              lineHeight: 1.4,
              marginBottom: '1.25rem'
            }}>
              <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Development / Testing OTP Preview Badge */}
          {devOtp && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: '#FFFBEB',
              border: '1.5px dashed #F59E0B',
              borderRadius: '12px',
              color: '#92400E',
              fontSize: '0.82rem',
              marginBottom: '1.25rem'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Local / Setup Mode OTP
                </strong>
                <span>Use code: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: '#B45309' }}>{devOtp}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devOtp)}
                style={{
                  background: '#F59E0B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW 1: SIGN IN                                                  */}
          {/* ================================================================ */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.4rem' }}>
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
                      transition: 'color 0.2s',
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
                      padding: '0.75rem 1rem 0.75rem 2.55rem',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
                      border: isClinicDomain
                        ? '1.5px solid #10B981'
                        : isOtherDomain
                        ? '1.5px solid #EF4444'
                        : '1.5px solid #E2E4EB',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#111116',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.18s, box-shadow 0.18s',
                      boxShadow: isClinicDomain
                        ? '0 0 0 3px rgba(16, 185, 129, 0.12)'
                        : isOtherDomain
                        ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                        : 'none',
                    }}
                  />
                </div>

                {isClinicDomain && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                    <CheckCircle2 size={13} color="#059669" />
                    Verified ClinicLivingPlus Domain
                  </div>
                )}

                {isOtherDomain && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#DC2626', fontWeight: 600, marginTop: '0.35rem' }}>
                    <AlertCircle size={13} color="#DC2626" />
                    Restricted: Only @cliniclivingplus.com is accepted
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E202A' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '0.78rem',
                      color: '#7F66FF',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

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
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.8rem 0.75rem 2.55rem',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#7F66FF',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.8rem', color: '#55586B', cursor: 'pointer', userSelect: 'none' }}>
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
                  gap: '0.55rem',
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: isLoading
                    ? '#A594FD'
                    : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px -3px rgba(127, 102, 255, 0.45)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  marginTop: '0.3rem'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Clinical Portal</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* First Time / Create Password Callout */}
              <div style={{
                textAlign: 'center',
                marginTop: '0.8rem',
                paddingTop: '1.1rem',
                borderTop: '1px solid #ECEEF4',
                fontSize: '0.82rem',
                color: '#63667B'
              }}>
                First time logging in?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#7F66FF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create Password (First Time)
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* VIEW 2: CREATE PASSWORD (FIRST-TIME ACTIVATION)                  */}
          {/* ================================================================ */}
          {mode === 'signup' && (
            <div>
              {step === 1 ? (
                <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.4rem' }}>
                      Your ClinicLivingPlus Work Email
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
                          padding: '0.75rem 1rem 0.75rem 2.55rem',
                          fontSize: '0.9rem',
                          borderRadius: '12px',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                        <CheckCircle2 size={13} color="#059669" />
                        Verified ClinicLivingPlus Domain
                      </div>
                    )}

                    {isOtherDomain && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#DC2626', fontWeight: 600, marginTop: '0.35rem' }}>
                        <AlertCircle size={13} color="#DC2626" />
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
                      gap: '0.55rem',
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      background: isLoading
                        ? '#A594FD'
                        : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 20px -3px rgba(127, 102, 255, 0.45)',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code (OTP)</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {/* Email reminder */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#55586B',
                    background: '#F8F9FE',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Sending code to: <strong>{trimmedEmail}</strong></span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{ background: 'none', border: 'none', color: '#7F66FF', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  </div>

                  {/* 6-digit OTP input */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E202A' }}>
                        6-Digit Verification Code (OTP)
                      </label>
                      <button
                        type="button"
                        disabled={cooldown > 0 || isLoading}
                        onClick={handleRequestOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.76rem',
                          color: cooldown > 0 ? '#9CA3AF' : '#7F66FF',
                          fontWeight: 600,
                          cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      required
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        letterSpacing: '8px',
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: '1.5px solid #7F66FF',
                        outline: 'none',
                        background: '#FBFBFF',
                        color: '#583EDB',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.4rem' }}>
                      Choose Your Password (min. 8 characters)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8A8D9F' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create strong password"
                        required
                        minLength={8}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.8rem 0.75rem 2.55rem',
                          fontSize: '0.9rem',
                          borderRadius: '12px',
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
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8A8D9F', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.4rem' }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8A8D9F' }} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        minLength={8}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.8rem 0.75rem 2.55rem',
                          fontSize: '0.9rem',
                          borderRadius: '12px',
                          border: '1.5px solid #E2E4EB',
                          outline: 'none',
                          background: '#FFFFFF',
                          color: '#111116',
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8A8D9F', cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      background: isLoading ? '#A594FD' : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 20px -3px rgba(127, 102, 255, 0.45)',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        <span>Activating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate & Sign In</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back to Sign In Link */}
              <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW 3: FORGOT PASSWORD / RESET                                  */}
          {/* ================================================================ */}
          {mode === 'forgot' && (
            <div>
              {step === 1 ? (
                <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.4rem' }}>
                      Enter Your ClinicLivingPlus Email
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
                          padding: '0.75rem 1rem 0.75rem 2.55rem',
                          fontSize: '0.9rem',
                          borderRadius: '12px',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                        <CheckCircle2 size={13} color="#059669" />
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
                      gap: '0.55rem',
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      background: isLoading
                        ? '#A594FD'
                        : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 20px -3px rgba(127, 102, 255, 0.45)',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        <span>Sending Reset Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset OTP</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {/* Email reminder */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#55586B',
                    background: '#F8F9FE',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Resetting for: <strong>{trimmedEmail}</strong></span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{ background: 'none', border: 'none', color: '#7F66FF', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  </div>

                  {/* 6-digit OTP */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E202A' }}>
                        6-Digit Verification Code (OTP)
                      </label>
                      <button
                        type="button"
                        disabled={cooldown > 0 || isLoading}
                        onClick={handleRequestOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.76rem',
                          color: cooldown > 0 ? '#9CA3AF' : '#7F66FF',
                          fontWeight: 600,
                          cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      required
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        letterSpacing: '8px',
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: '1.5px solid #7F66FF',
                        outline: 'none',
                        background: '#FBFBFF',
                        color: '#583EDB',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.4rem' }}>
                      New Password (min. 8 characters)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8A8D9F' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={8}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.8rem 0.75rem 2.55rem',
                          fontSize: '0.9rem',
                          borderRadius: '12px',
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
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8A8D9F', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E202A', marginBottom: '0.4rem' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8A8D9F' }} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        minLength={8}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.8rem 0.75rem 2.55rem',
                          fontSize: '0.9rem',
                          borderRadius: '12px',
                          border: '1.5px solid #E2E4EB',
                          outline: 'none',
                          background: '#FFFFFF',
                          color: '#111116',
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8A8D9F', cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      background: isLoading ? '#A594FD' : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 20px -3px rgba(127, 102, 255, 0.45)',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password & Sign In</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back to Sign In Link */}
              <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div style={{
          padding: '1rem 2.2rem',
          background: '#FAFAFD',
          borderTop: '1px solid #F0F1F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem',
          color: '#8A8D9F'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            <span>256-bit Cryptographic HMAC</span>
          </div>
          <div>ClinicLivingPlus Security</div>
        </div>
      </div>
    </div>
  );
}
