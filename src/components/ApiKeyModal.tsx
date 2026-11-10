'use client';

import React, { useState } from 'react';
import { X, Key } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Key size={18} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Gemini API Key</h2>
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

        <input
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="AIzaSy..."
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '0.92rem',
            marginBottom: '1.5rem',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-outline">Cancel</button>
          <button 
            onClick={() => {
              onSave(val.trim());
              onClose();
            }} 
            className="btn btn-primary"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
