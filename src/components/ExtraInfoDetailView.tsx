'use client';

import React, { useState, useMemo } from 'react';
import { Compound } from '@/types';
import {
  ArrowLeft,
  ExternalLink,
  PlayCircle,
  FileText,
  Download,
  Copy,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';

interface ExtraInfoDetailViewProps {
  item: Compound;
  onBack: () => void;
  onAskAi?: (title: string) => void;
}

export default function ExtraInfoDetailView({
  item,
  onBack,
  onAskAi,
}: ExtraInfoDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  const isVideo = !!item.videoUrl;
  const isPdf = !!item.pdfUrl;

  const handleCopy = () => {
    if (!item.body) return;
    navigator.clipboard.writeText(item.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format transcript into readable paragraphs and optionally filter by search
  const paragraphs = useMemo(() => {
    const raw = (item.body || '').trim();
    if (!raw) return [];
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // Group short transcript lines into clean readable blocks (~450 chars each)
    const grouped: string[] = [];
    let buffer = '';
    for (const line of lines) {
      if (!buffer) {
        buffer = line;
      } else if (buffer.length + line.length < 480) {
        buffer += ' ' + line;
      } else {
        grouped.push(buffer);
        buffer = line;
      }
    }
    if (buffer) grouped.push(buffer);

    const q = transcriptSearch.trim().toLowerCase();
    if (!q) return grouped;
    return grouped.filter((p) => p.toLowerCase().includes(q));
  }, [item.body, transcriptSearch]);

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.25rem 0',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to library</span>
        </button>

        {onAskAi && (
          <button
            type="button"
            onClick={() => onAskAi(item.name)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.48rem 0.95rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(127, 102, 255, 0.25)',
            }}
          >
            <Sparkles size={14} />
            <span>Ask AI about this topic</span>
          </button>
        )}
      </div>

      {/* Header Card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 12px rgba(17, 17, 22, 0.04)',
        }}
      >
        <div style={{ padding: '1.65rem 2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: isVideo ? '#DC2626' : 'var(--primary)',
              background: isVideo ? '#FEF2F2' : '#F1EEFE',
              border: isVideo ? '1px solid #FECACA' : '1px solid #DDD6FE',
              borderRadius: '9999px',
              padding: '0.24rem 0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            {isVideo ? <PlayCircle size={13} /> : <FileText size={13} />}
            <span>Extra Information · {item.category}</span>
          </div>

          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.75rem 0',
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </h1>

          {/* Direct Video Link Banner */}
          {isVideo && item.videoUrl && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                background: '#FAF9FE',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.85rem 1.1rem',
                marginTop: '0.75rem',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  YouTube Video Link
                </div>
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textDecoration: 'underline',
                    wordBreak: 'break-all',
                  }}
                >
                  {item.videoUrl}
                </a>
              </div>

              <a
                href={item.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.52rem 1rem',
                  borderRadius: '10px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                <PlayCircle size={15} />
                <span>Watch on YouTube</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Direct PDF Notice (View-Only Protection) */}
          {isPdf && item.pdfUrl && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.94rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>
                {item.overview}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Embedded YouTube Player */}
      {isVideo && item.videoId && (
        <div
          style={{
            background: '#0F172A',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            aspectRatio: '16 / 9',
            border: '1px solid var(--border)',
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${item.videoId}`}
            title={item.name}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Embedded PDF Viewer */}
      {isPdf && item.pdfUrl && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            height: '78vh',
          }}
        >
          <iframe
            src={`${item.pdfUrl}#toolbar=0&navpanes=0`}
            title={item.name}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      )}

      {/* Full Video Transcript Card */}
      {isVideo && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              background: '#FAF9FE',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <FileText size={17} style={{ color: 'var(--primary)' }} />
              <span>Full Video Transcript</span>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                ({(item.body?.length || 0).toLocaleString()} chars)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="Search inside transcript..."
                  style={{
                    padding: '0.4rem 0.75rem 0.4rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    background: '#FFFFFF',
                    outline: 'none',
                    width: '210px',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: '0.92rem', color: '#2B2D3A', lineHeight: 1.75, margin: 0 }}>
                  {p}
                </p>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No transcript passages match &ldquo;{transcriptSearch}&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
