'use client';

import React from 'react';
import { Compound, ReconstitutionGuide } from '@/types';
import { ArrowLeft, MessageSquare, Droplet, ExternalLink, AlertTriangle, Shield } from 'lucide-react';

interface CompoundDetailViewProps {
  compound: Compound;
  onBack: () => void;
  onAskAi: (name: string) => void;
  onOpenCalculator: (compoundName: string) => void;
}

export default function CompoundDetailView({
  compound,
  onBack,
  onAskAi,
  onOpenCalculator,
}: CompoundDetailViewProps) {
  const recon = typeof compound.reconstitution === 'object' ? (compound.reconstitution as ReconstitutionGuide) : null;
  const papers = compound.publishedPapers || compound.papers || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Back button */}
      <div 
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Knowledge Base</span>
      </div>

      {/* Header */}
      <div className="compound-item-card" style={{ padding: '2rem', marginBottom: '1.75rem', cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge-tag" style={{ marginBottom: '0.5rem' }}>{compound.category}</span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              {compound.name}
            </h1>
            {compound.fullName && (
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.2rem' }}>
                {compound.fullName}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onAskAi(compound.name)}
              className="btn btn-primary"
              style={{ fontSize: '0.88rem', padding: '0.55rem 1.15rem' }}
            >
              <MessageSquare size={16} />
              <span>Ask PepTalk</span>
            </button>
            <button
              onClick={() => onOpenCalculator(compound.name)}
              className="btn btn-outline"
              style={{ fontSize: '0.88rem', padding: '0.55rem 1.15rem' }}
            >
              <Droplet size={16} style={{ color: 'var(--primary)' }} />
              <span>Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '16px', padding: '1.15rem 1.4rem', marginBottom: '1.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.88rem', color: '#92400E', lineHeight: 1.55 }}>
          <strong>PepTalk Research Assistant:</strong> All information is provided for educational and biomedical research reference only and does not constitute medical advice or clinical prescribing instructions. Peptides discussed are not approved for human consumption unless prescribed by a licensed medical professional.
        </p>
      </div>

      {/* Overview */}
      <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🧬</span> <span>Overview</span>
        </h3>
        <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
          {compound.overview || compound.body || 'Clinical monograph data in compilation.'}
        </p>
      </div>

      {/* Mechanism */}
      {compound.mechanism && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔬</span> <span>Mechanism of Action</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {compound.mechanism}
          </p>
        </div>
      )}

      {/* Contexts */}
      {compound.contexts && compound.contexts.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎯</span> <span>Primary Research Contexts</span>
          </h3>
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            {compound.contexts.map((ctx, i) => (
              <span key={i} className="chip" style={{ cursor: 'default', background: '#F8F9FD' }}>{ctx}</span>
            ))}
          </div>
        </div>
      )}

      {/* Dosing Guidelines */}
      {compound.dosing && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💉</span> <span>Dosing Guidelines</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {compound.dosing}
          </p>
        </div>
      )}

      {/* Reconstitution */}
      <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💧</span> <span>Reconstitution & Mixing Guidelines</span>
        </h3>
        {recon ? (
          <div>
            {recon.instructions && <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem', marginBottom: '1rem' }}>{recon.instructions}</p>}
            {recon.table && recon.table.length > 0 && (
              <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-light)', borderBottom: '2px solid var(--primary-border)' }}>
                      <th style={{ padding: '0.65rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>Vial Size</th>
                      <th style={{ padding: '0.65rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>BAC Water</th>
                      <th style={{ padding: '0.65rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>Concentration</th>
                      <th style={{ padding: '0.65rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>Dose Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recon.table.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{row.vialSize}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.bacWater}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>{row.concentration}</td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)' }}>{row.doseRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {recon.note && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}><em>{recon.note}</em></p>}
          </div>
        ) : (
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {typeof compound.reconstitution === 'string'
              ? compound.reconstitution
              : 'Reconstitution math depends on dosing — consult the calculator or vetted protocols.'}
          </p>
        )}
      </div>

      {/* Storage & Stability */}
      {compound.storage && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>❄️</span> <span>Storage & Stability</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
            {compound.storage.before && (
              <div style={{ background: '#F8F9FD', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Before Reconstitution</strong>
                <p style={{ fontSize: '0.92rem', color: '#4A4C5A', marginTop: '0.35rem' }}>{compound.storage.before}</p>
              </div>
            )}
            {compound.storage.after && (
              <div style={{ background: '#F8F9FD', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase' }}>After Reconstitution</strong>
                <p style={{ fontSize: '0.92rem', color: '#4A4C5A', marginTop: '0.35rem' }}>{compound.storage.after}</p>
              </div>
            )}
            {compound.storage.halfLife && (
              <div style={{ background: '#F8F9FD', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Pharmacokinetics / Half-life</strong>
                <p style={{ fontSize: '0.92rem', color: '#4A4C5A', marginTop: '0.35rem' }}>{compound.storage.halfLife}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Published Research Papers */}
      {papers.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '2rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📚</span> <span>Published Clinical Research ({papers.length} Papers)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {papers.map((paper, idx) => (
              <div key={idx} style={{ padding: '1.25rem', borderRadius: '14px', background: '#F8F9FD', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge-tag" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{paper.topic || compound.category}</span>
                  {paper.journal && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{paper.journal} {paper.year && `· ${paper.year}`}</span>}
                </div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.45rem' }}>{paper.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '0.75rem' }}>{paper.summary}</p>
                {paper.url && (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                    <span>Read full scientific article</span> <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
