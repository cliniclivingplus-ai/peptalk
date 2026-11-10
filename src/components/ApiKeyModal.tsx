'use client';

import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSave,
}: ApiKeyModalProps) {
  const [val, setVal] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const sanitizeKey = (key: string) => key.trim().replace(/^['"]|['"]$/g, '');

  const handleTestKey = async () => {
    const cleaned = sanitizeKey(val);
    if (!cleaned) {
      setStatus({ type: 'error', message: 'Please enter a Gemini API key first.' });
      return;
    }

    setTesting(true);
    setStatus(null);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleaned}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        setStatus({
          type: 'error',
          message: json.error?.message || `Google rejected this key with HTTP ${res.status}`,
        });
      } else {
        setStatus({
          type: 'success',
          message: 'API Key verified successfully! Gemini models are active.',
        });
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: `Network error verifying key: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const cleaned = sanitizeKey(val);
    onSave(cleaned);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Key size={18} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Google Gemini API Key</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '1.25rem' }}>
          Enter your free Google Gemini API key to activate AI chat and live RAG querying across the clinical library and 75 masterclasses.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
              if (status) setStatus(null);
            }}
            placeholder="AIzaSy..."
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              border: status?.type === 'error' ? '1px solid #EF4444' : '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '0.92rem',
              outline: 'none',
              fontFamily: 'monospace',
            }}
          />
        </div>

        {/* Status Feedback */}
        {status && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontSize: '0.84rem',
            lineHeight: 1.5,
            background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: status.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          }}>
            {status.type === 'success' ? (
              <CheckCircle2 size={16} style={{ color: '#059669', marginTop: '0.15rem', flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={16} style={{ color: '#DC2626', marginTop: '0.15rem', flexShrink: 0 }} />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <span>Get a free key at Google AI Studio</span>
            <ExternalLink size={13} />
          </a>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handleTestKey}
              disabled={testing || !val.trim()}
              className="btn btn-outline"
              style={{ fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>{testing ? 'Verifying...' : 'Test Key'}</span>
            </button>
            <button 
              onClick={handleSave} 
              className="btn btn-primary"
              style={{ fontSize: '0.86rem' }}
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
