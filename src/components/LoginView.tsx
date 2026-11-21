'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  Building2,
  Sparkles
} from 'lucide-react';

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

  // Real-time domain validation check
  const trimmedEmail = email.trim().toLowerCase();
  const hasAt = trimmedEmail.includes('@');
  const isClinicDomain = trimmedEmail.endsWith('@cliniclivingplus.com');
  const isOtherDomain = hasAt && !isClinicDomain && trimmedEmail.split('@')[1]?.includes('.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your clinic email address.');
      return;
    }

    if (!isClinicDomain) {
      setErrorMessage('Access Denied: Only @cliniclivingplus.com email addresses are permitted. Personal and unauthorized email accounts cannot sign in.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your clinical staff access passcode.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      onLoginSuccess(data.user);
    } catch (err: any) {
      console.error('Login submit error:', err);
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
        maxWidth: '460px',
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

        <div style={{ padding: '2.5rem 2.25rem 2.25rem 2.25rem' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(127, 102, 255, 0.35)',
              marginBottom: '1rem'
            }}>
              <Building2 size={28} strokeWidth={2.2} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#7F66FF',
                background: '#F1EEFE',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={11} />
                ClinicLivingPlus Staff Portal
              </span>
            </div>

            <h1 style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#111116',
              letterSpacing: '-0.025em',
              margin: '0 0 0.35rem 0'
            }}>
              PepTalk Clinical Access
            </h1>
            <p style={{
              fontSize: '0.9rem',
              color: '#5E6070',
              lineHeight: 1.5,
              margin: 0
            }}>
              Sign in with your verified organization account
            </p>
          </div>

          {/* Strict Domain Security Callout */}
          <div style={{
            background: '#FAF9FE',
            border: '1px solid #E6E1FC',
            borderRadius: '14px',
            padding: '0.85rem 1rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={18} color="#7F66FF" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#333644', lineHeight: 1.5 }}>
              <strong style={{ color: '#111116', fontWeight: 700 }}>Domain Policy: </strong>
              Only <strong>@cliniclivingplus.com</strong> email addresses are authorized to access monographs, protocols, and AI chat.
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              color: '#991B1B',
              fontSize: '0.84rem',
              lineHeight: 1.45,
              animation: 'fadeIn 0.2s ease-in'
            }}>
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#1E202A',
                marginBottom: '0.45rem'
              }}>
                Work Email Address
              </label>

              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isClinicDomain ? '#10B981' : (isOtherDomain ? '#EF4444' : '#94A3B8'),
                  transition: 'color 0.2s ease'
                }} />
                
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="doctor@cliniclivingplus.com"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.78rem 1rem 0.78rem 2.6rem',
                    fontSize: '0.92rem',
                    borderRadius: '12px',
                    border: `1.5px solid ${isClinicDomain ? '#10B981' : (isOtherDomain ? '#EF4444' : '#E2E4EC')}`,
                    outline: 'none',
                    background: '#FFFFFF',
                    color: '#111116',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s ease',
                    boxShadow: isClinicDomain ? '0 0 0 3px rgba(16, 185, 129, 0.12)' : 'none'
                  }}
                />
              </div>

              {/* Dynamic Domain Validation Pill */}
              {isClinicDomain && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  color: '#059669',
                  fontWeight: 600,
                  marginTop: '0.4rem'
                }}>
                  <CheckCircle2 size={13} color="#059669" />
                  <span>Verified ClinicLivingPlus Domain</span>
                </div>
              )}

              {isOtherDomain && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  color: '#DC2626',
                  fontWeight: 600,
                  marginTop: '0.4rem'
                }}>
                  <AlertCircle size={13} color="#DC2626" />
                  <span>Restricted: Only @cliniclivingplus.com is accepted</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#1E202A'
                }}>
                  Clinical Staff Passcode
                </label>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8'
                }} />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter clinic passcode"
                  required
                  style={{
                    width: '100%',
                    padding: '0.78rem 2.75rem 0.78rem 2.6rem',
                    fontSize: '0.92rem',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E4EC',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: '#111116',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.18s ease'
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.35rem' }}>
                Default: <code>ClinicLivingPlus2026!</code> (configurable in .env.local)
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#7F66FF',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="rememberMe"
                style={{
                  fontSize: '0.84rem',
                  color: '#4B5563',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Keep signed in on this clinical workstation (7 days)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '14px',
                background: isClinicDomain 
                  ? 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)' 
                  : '#A5B4FC',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                fontWeight: 700,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                boxShadow: isClinicDomain ? '0 8px 24px rgba(127, 102, 255, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin-slow" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Clinical Portal</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Security Badge */}
        <div style={{
          background: '#F8F9FD',
          borderTop: '1px solid #ECECF4',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.74rem',
          color: '#6B7280',
          fontWeight: 600
        }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>256-bit Cryptographic HMAC Session · ClinicLivingPlus Intelligence</span>
        </div>
      </div>
    </div>
  );
}
