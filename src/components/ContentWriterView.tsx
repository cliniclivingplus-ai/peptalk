'use client';

import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Users,
  Wand2,
  BookOpen,
  AlertCircle,
  Send,
} from 'lucide-react';
import ClinicalMarkdown from './ClinicalMarkdown';

interface ContentWriterViewProps {
  apiKey: string;
  onOpenApiKey: () => void;
}

const CONTENT_FORMATS = [
  'Blog / Educational Article',
  'Instagram / LinkedIn Post',
  'YouTube / Reel / Short Script',
  'Carousel Slides',
  'Patient Education Sheet',
  'Newsletter / Email',
];

const TARGET_AUDIENCES = [
  'Patients & General Public',
  'Physicians & Clinicians',
  'Fitness & Longevity Enthusiasts',
  'Clinic Social Media Followers',
];

const TONE_OPTIONS = [
  'Clear, Engaging & Trustworthy',
  'Authoritative & Clinical',
  'Warm, Empathetic & Simple',
  'Scroll-Stopping & Conversational',
];

const STARTER_IDEAS = [
  'Explain how BPC-157 supports tendon and gut recovery, including what human vs animal evidence actually shows',
  'Compare Semaglutide, Tirzepatide, and Retatrutide in simple language for patients considering weight loss therapy',
  'Why bloodwork (IGF-1, fasting insulin, HbA1c) matters before starting CJC-1295 / Ipamorelin',
  'Myth vs Fact about GHK-Cu copper peptide for skin rejuvenation and collagen synthesis',
];

export default function ContentWriterView({ apiKey, onOpenApiKey }: ContentWriterViewProps) {
  const [idea, setIdea] = useState('');
  const [format, setFormat] = useState(CONTENT_FORMATS[0]);
  const [audience, setAudience] = useState(TARGET_AUDIENCES[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [sources, setSources] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [refinement, setRefinement] = useState('');

  const handleGenerate = async (isRefinement = false) => {
    if (!idea.trim() || isLoading) return;
    if (!apiKey) {
      onOpenApiKey();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/content-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          format,
          audience,
          tone,
          refinement: isRefinement ? refinement.trim() : '',
          previousDraft: isRefinement ? generatedContent : '',
          apiKey: apiKey && apiKey !== 'server_configured' ? apiKey.trim() : '',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.error === 'MISSING_API_KEY') {
          onOpenApiKey();
        }
        setError(data.message || 'Failed to generate content.');
        setIsLoading(false);
        return;
      }

      setGeneratedContent(data.reply || '');
      setSources(data.sources || []);
      if (isRefinement) setRefinement('');
    } catch (err: any) {
      setError(err.message || 'Network error generating content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Page Header */}
      <div className="page-header-row" style={{ marginBottom: '1.35rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PenTool size={25} style={{ color: 'var(--primary)' }} />
            <span>Peptide Content Studio</span>
          </h1>
          <p className="page-subtitle">
            Drop in any rough topic or idea — PepTalk analyzes your Knowledge Base + peer-reviewed science and crafts publication-ready copy with hooks, phrasing, and citations.
          </p>
        </div>
      </div>

      {/* Input & Configuration Card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 12px rgba(17, 17, 22, 0.04)',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
          }}
        >
          What do you want to write about?
        </label>

        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          placeholder="Explain your idea in plain words... e.g., 'I want to write a 60-second Instagram reel explaining how MOTS-c works for mitochondrial energy and who should consider it, in simple patient-friendly language.'"
          style={{
            width: '100%',
            padding: '0.9rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid var(--border)',
            fontSize: '0.93rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            background: '#FAF9FE',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />

        {/* Quick Starter Ideas */}
        <div style={{ marginTop: '0.7rem', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
            Quick starter ideas:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {STARTER_IDEAS.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdea(starter)}
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: '#F5F3FF',
                  border: '1px solid #E4DEFF',
                  borderRadius: '9999px',
                  padding: '0.3rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {starter.length > 68 ? starter.slice(0, 65) + '…' : starter}
              </button>
            ))}
          </div>
        </div>

        {/* Format, Audience, Tone Selectors */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.9rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              <FileText size={14} style={{ color: 'var(--primary)' }} />
              <span>Content Format</span>
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                background: '#FFFFFF',
              }}
            >
              {CONTENT_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              <Users size={14} style={{ color: 'var(--primary)' }} />
              <span>Target Audience</span>
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                background: '#FFFFFF',
              }}
            >
              {TARGET_AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              <Wand2 size={14} style={{ color: 'var(--primary)' }} />
              <span>Tone &amp; Framing</span>
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                background: '#FFFFFF',
              }}
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Combines PepTalk Knowledge Base + peer-reviewed clinical evidence + copywriting frameworks.
          </span>

          <button
            type="button"
            disabled={!idea.trim() || isLoading}
            onClick={() => handleGenerate(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.72rem 1.4rem',
              borderRadius: '11px',
              background: !idea.trim() || isLoading
                ? '#C4B5FD'
                : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: !idea.trim() || isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 18px rgba(127, 102, 255, 0.28)',
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spin-slow" />
                <span>Researching &amp; Writing...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.1rem',
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            fontSize: '0.86rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Content Output */}
      {generatedContent && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(17, 17, 22, 0.05)',
          }}
        >
          {/* Output Toolbar */}
          <div
            style={{
              padding: '0.9rem 1.5rem',
              background: '#FAF9FE',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span>Generated Content Package · {format}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.42rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: '#FFFFFF',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.42rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: copied ? '#059669' : 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy All'}</span>
              </button>
            </div>
          </div>

          {/* Grounded Internal Sources Strip */}
          {sources.length > 0 && (
            <div
              style={{
                padding: '0.65rem 1.5rem',
                background: '#F8FAFC',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.45rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <BookOpen size={13} style={{ color: 'var(--primary)' }} />
              <strong style={{ color: 'var(--text-secondary)' }}>Internal sources referenced:</strong>
              {sources.map((src, i) => (
                <span
                  key={i}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.15rem 0.5rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {src}
                </span>
              ))}
            </div>
          )}

          {/* Rendered Markdown Draft */}
          <div style={{ padding: '1.5rem 1.75rem' }}>
            <ClinicalMarkdown content={generatedContent} />
          </div>

          {/* Quick Refinement Bar */}
          <div
            style={{
              padding: '1rem 1.5rem',
              background: '#FAF9FE',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && refinement.trim() && !isLoading) {
                  handleGenerate(true);
                }
              }}
              placeholder="Want to tweak it? e.g. 'Make it shorter and punchier' or 'Add a section on dosing safety'..."
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '0.86rem',
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
            <button
              type="button"
              disabled={!refinement.trim() || isLoading}
              onClick={() => handleGenerate(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                background: !refinement.trim() || isLoading ? '#C4B5FD' : 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: !refinement.trim() || isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={14} />
              <span>Refine</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
