'use client';

import React, { useMemo, useState } from 'react';
import { Compound } from '@/types';
import {
  ArrowLeft,
  Info,
  FlaskConical,
  Syringe,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface SupplementDetailViewProps {
  supplement: Compound;
  onBack: () => void;
  onAskAi?: (name: string) => void;
}

interface ParsedSupplement {
  summary: string;
  form: string;
  category: string;
  bestFor: string;
  clinicalEvidence: string;
  correlativeUse: string;
  theoretical: string;
  evidenceFallback: string;
  dose: string;
  practicalNote: string;
  dosingFallback: string;
  safetyParagraphs: string[];
}

function cleanBlock(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function splitParagraphs(text: string): string[] {
  if (!text) return [];
  // Normalize single newlines inside sentences vs paragraph breaks
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  let current = '';

  for (const line of lines) {
    if (!current) {
      current = line;
    } else if (/[.!?]$/.test(current)) {
      paragraphs.push(current);
      current = line;
    } else {
      current += ' ' + line;
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

function parseSupplementBody(supplement: Compound): ParsedSupplement {
  const body = (supplement.body || '').replace(/\r\n/g, '\n');

  // Split into the 4 main numbered sections
  const sec1Match = body.match(/1\s*[·•-]\s*WHAT IT IS([\s\S]*?)(?=2\s*[·•-]\s*EVIDENCE|$)/i);
  const sec2Match = body.match(/2\s*[·•-]\s*EVIDENCE([\s\S]*?)(?=3\s*[·•-]\s*DOSING\s*&\s*PROTOCOL|$)/i);
  const sec3Match = body.match(/3\s*[·•-]\s*DOSING\s*&\s*PROTOCOL([\s\S]*?)(?=4\s*[·•-]\s*SAFETY|$)/i);
  const sec4Match = body.match(/4\s*[·•-]\s*SAFETY[^\n]*([\s\S]*?)$/i);

  // --- Section 1: What it is ---
  const sec1 = sec1Match ? sec1Match[1].trim() : '';
  let summary = supplement.overview || '';
  let form = supplement.aka || supplement.fullName || '';
  let category = supplement.category || '';
  let bestFor = '';

  if (sec1) {
    const formMatch = sec1.match(/FORM\s+([\s\S]*?)(?=\s+CATEGORY\s+|\nCATEGORY\s+|\nBEST FOR\s+|$)/i);
    if (formMatch && formMatch[1].trim()) form = formMatch[1].replace(/\s+/g, ' ').trim();

    const catMatch = sec1.match(/CATEGORY\s+([^\n]+)/i);
    if (catMatch && catMatch[1].trim()) category = catMatch[1].trim();

    const bestForMatch = sec1.match(/BEST FOR\s+([\s\S]*?)$/i);
    if (bestForMatch && bestForMatch[1].trim()) {
      bestFor = bestForMatch[1].replace(/\s+/g, ' ').trim();
    }

    if (!summary) {
      const preForm = sec1.split(/\n?FORM\s+/i)[0]?.trim();
      if (preForm) summary = preForm.replace(/\s+/g, ' ').trim();
    }
  }

  // --- Section 2: Evidence ---
  const sec2 = sec2Match ? sec2Match[1].trim() : '';
  let clinicalEvidence = '';
  let correlativeUse = '';
  let theoretical = '';
  let evidenceFallback = '';

  if (sec2) {
    const clinMatch = sec2.match(
      /CLINICAL\s*\/\s*TRIAL EVIDENCE\s*([\s\S]*?)(?=CORRELATIVE\s*&\s*REAL-WORLD USE|THEORETICAL\s*&\s*MECHANISTIC|$)/i
    );
    const corrMatch = sec2.match(
      /CORRELATIVE\s*&\s*REAL-WORLD USE\s*([\s\S]*?)(?=THEORETICAL\s*&\s*MECHANISTIC|$)/i
    );
    const theoMatch = sec2.match(/THEORETICAL\s*&\s*MECHANISTIC\s*([\s\S]*?)$/i);

    if (clinMatch) clinicalEvidence = cleanBlock(clinMatch[1]);
    if (corrMatch) correlativeUse = cleanBlock(corrMatch[1]);
    if (theoMatch) theoretical = cleanBlock(theoMatch[1]);

    if (!clinicalEvidence && !correlativeUse && !theoretical) {
      evidenceFallback = cleanBlock(sec2);
    }
  }

  // --- Section 3: Dosing & protocol ---
  const sec3 = sec3Match ? sec3Match[1].trim() : '';
  let dose = '';
  let practicalNote = '';
  let dosingFallback = '';

  if (sec3) {
    const pracMatch = sec3.match(/Practical note\.?\s*([\s\S]*?)$/i);
    if (pracMatch) {
      practicalNote = pracMatch[1].replace(/\s+/g, ' ').trim();
    }
    const beforePrac = pracMatch ? sec3.slice(0, pracMatch.index).trim() : sec3;
    const doseMatch = beforePrac.match(/^DOSE\s+([\s\S]*?)$/i);
    if (doseMatch) {
      dose = doseMatch[1].replace(/\s+/g, ' ').trim();
    } else if (beforePrac) {
      dosingFallback = beforePrac.replace(/\s+/g, ' ').trim();
    }
  }

  // --- Section 4: Safety & interactions ---
  const sec4 = sec4Match ? sec4Match[1].trim() : '';
  const safetyParagraphs = splitParagraphs(sec4);

  return {
    summary,
    form,
    category,
    bestFor,
    clinicalEvidence,
    correlativeUse,
    theoretical,
    evidenceFallback,
    dose: dose || dosingFallback,
    practicalNote,
    dosingFallback,
    safetyParagraphs,
  };
}

const NAV_ITEMS = [
  { id: 'supp-what-it-is', label: 'What it is' },
  { id: 'supp-evidence', label: 'Evidence' },
  { id: 'supp-dosing', label: 'Dosing & protocol' },
  { id: 'supp-safety', label: 'Safety & interactions' },
];

export default function SupplementDetailView({
  supplement,
  onBack,
  onAskAi,
}: SupplementDetailViewProps) {
  const [activeSection, setActiveSection] = useState<string>('supp-what-it-is');
  const parsed = useMemo(() => parseSupplementBody(supplement), [supplement]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
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
            onClick={() => onAskAi(supplement.name)}
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
            <span>Ask AI about {supplement.name}</span>
          </button>
        )}
      </div>

      {/* Hero Header Card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 12px rgba(17, 17, 22, 0.04)',
        }}
      >
        <div style={{ padding: '1.75rem 2rem 1.5rem 2rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '0.45rem',
            }}
          >
            Supplements · {parsed.category || supplement.category}
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.025em',
              margin: '0 0 0.3rem 0',
              lineHeight: 1.15,
            }}
          >
            {supplement.name}
          </h1>

          {(supplement.aka || parsed.form) && (
            <div
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginBottom: '0.9rem',
              }}
            >
              Also known as {supplement.aka || parsed.form}
            </div>
          )}

          {parsed.summary && (
            <p
              style={{
                fontSize: '0.96rem',
                color: '#374151',
                lineHeight: 1.65,
                margin: '0 0 1.1rem 0',
                maxWidth: '780px',
              }}
            >
              {parsed.summary}
            </p>
          )}

          <span
            style={{
              display: 'inline-block',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#047857',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '9999px',
              padding: '0.28rem 0.8rem',
            }}
          >
            {supplement.evidence ? `${supplement.evidence} evidence` : 'Clinical evidence'}
          </span>
        </div>

        {/* Dose Strip at Bottom of Hero Card */}
        {parsed.dose && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              background: '#FAF9FE',
              padding: '1rem 2rem',
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '0.25rem',
              }}
            >
              Dose
            </div>
            <div
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                lineHeight: 1.45,
              }}
            >
              {parsed.dose}
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Body: Sticky TOC + 4 Structured Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px minmax(0, 1fr)',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left Sticky "On this page" Nav */}
        <aside style={{ position: 'sticky', top: '1rem' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              padding: '0 0.75rem 0.55rem 0.75rem',
            }}
          >
            On this page
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.52rem 0.8rem',
                    borderRadius: '9px',
                    border: 'none',
                    background: isActive ? '#F1EEFE' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          {/* 1. What it is */}
          <section
            id="supp-what-it-is"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem 1.75rem',
              scrollMarginTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.15rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Info size={16} />
              </div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                What it is
              </h2>
            </div>

            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Row 1: Form | Category */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderBottom: parsed.bestFor ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    padding: '0.85rem 1.1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '1rem',
                    borderRight: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                    Form
                  </span>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, textAlign: 'right' }}>
                    {parsed.form || '—'}
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.85rem 1.1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                    Category
                  </span>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, textAlign: 'right' }}>
                    {parsed.category || supplement.category}
                  </span>
                </div>
              </div>

              {/* Row 2: Best for */}
              {parsed.bestFor && (
                <div
                  style={{
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '1.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                    Best for
                  </span>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, textAlign: 'right', lineHeight: 1.5 }}>
                    {parsed.bestFor}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 2. Evidence */}
          <section
            id="supp-evidence"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem 1.75rem',
              scrollMarginTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.15rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FlaskConical size={16} />
              </div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Evidence
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {parsed.clinicalEvidence && (
                <div>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                    Clinical / trial evidence
                  </h3>
                  {splitParagraphs(parsed.clinicalEvidence).map((p, i) => (
                    <p key={i} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65, margin: '0 0 0.5rem 0' }}>
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {parsed.correlativeUse && (
                <div>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                    Correlative &amp; real-world use
                  </h3>
                  {splitParagraphs(parsed.correlativeUse).map((p, i) => (
                    <p key={i} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65, margin: '0 0 0.5rem 0' }}>
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {parsed.theoretical && (
                <div>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                    Theoretical &amp; mechanistic
                  </h3>
                  {splitParagraphs(parsed.theoretical).map((p, i) => (
                    <p key={i} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65, margin: '0 0 0.5rem 0' }}>
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {parsed.evidenceFallback && (
                <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>
                  {parsed.evidenceFallback}
                </p>
              )}
            </div>
          </section>

          {/* 3. Dosing & protocol */}
          <section
            id="supp-dosing"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem 1.75rem',
              scrollMarginTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.15rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Syringe size={16} />
              </div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Dosing &amp; protocol
              </h2>
            </div>

            {parsed.dose && (
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.95rem 1.15rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '1.5rem',
                  marginBottom: parsed.practicalNote ? '0.95rem' : 0,
                }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                  Dose
                </span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 700, textAlign: 'right', lineHeight: 1.5 }}>
                  {parsed.dose}
                </span>
              </div>
            )}

            {parsed.practicalNote && (
              <div
                style={{
                  background: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  borderRadius: '12px',
                  padding: '0.95rem 1.15rem',
                  fontSize: '0.88rem',
                  color: '#374151',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: 'var(--primary)' }}>Practical note.</strong> {parsed.practicalNote}
              </div>
            )}
          </section>

          {/* 4. Safety & interactions */}
          {parsed.safetyParagraphs.length > 0 && (
            <section
              id="supp-safety"
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                scrollMarginTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.1rem' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={16} />
                </div>
                <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Safety &amp; interactions
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {parsed.safetyParagraphs.map((p, i) => (
                  <p key={i} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Bottom Disclaimer Banner */}
      <div
        style={{
          marginTop: '1.75rem',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '0.95rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          fontSize: '0.8rem',
          color: '#92400E',
          lineHeight: 1.55,
        }}
      >
        <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
        <span>
          Research and educational information only. This is not medical advice, and nothing here is a recommendation to use, purchase, or administer any compound. Speak with a licensed clinician before making health decisions.
        </span>
      </div>
    </div>
  );
}
