'use client';

import React, { useState, useMemo } from 'react';
import { Compound, Protocol, ResearchPaperRef, ReconstitutionGuide } from '@/types';
import { parseVaultMonograph } from '@/lib/monographParser';
import { 
  ArrowLeft, 
  MessageSquare, 
  Droplet, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  Shield, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Layers,
  ThermometerSnowflake,
  Dna,
  Target,
  BarChart3,
  Syringe,
  Lightbulb,
  BookOpen
} from 'lucide-react';

interface CompoundDetailViewProps {
  compound: Compound;
  onBack: () => void;
  onAskAi: (name: string) => void;
  onOpenCalculator: (compoundName: string) => void;
  allPapers?: ResearchPaperRef[];
  allProtocols?: Protocol[];
  onSelectProtocol?: (protocol: Protocol) => void;
}

export default function CompoundDetailView({
  compound,
  onBack,
  onAskAi,
  onOpenCalculator,
  allPapers = [],
  allProtocols = [],
  onSelectProtocol,
}: CompoundDetailViewProps) {
  const [showRawMonograph, setShowRawMonograph] = useState(false);

  // Parse vault monograph if body is present
  const parsed = useMemo(() => {
    if (compound.body) {
      return parseVaultMonograph(compound.body);
    }
    return null;
  }, [compound.body]);

  // Find linked research papers
  const linkedPapers = useMemo(() => {
    if (compound.publishedPapers && compound.publishedPapers.length > 0) {
      return compound.publishedPapers;
    }
    if (compound.papers && compound.papers.length > 0) {
      return compound.papers;
    }
    if (!allPapers || allPapers.length === 0) return [];

    const names = [
      compound.name.toLowerCase(),
      (compound.fullName || '').toLowerCase(),
      (compound.aka || '').toLowerCase(),
    ].filter((n) => n.length > 2);

    return allPapers.filter((paper) => {
      const pPeptides = (paper.peptides || []).map((p: string) => p.toLowerCase());
      const pTitle = (paper.title || '').toLowerCase();
      return names.some((n) => pPeptides.some((p) => p.includes(n) || n.includes(p)) || pTitle.includes(n));
    });
  }, [compound, allPapers]);

  // Find matching protocol if any
  const matchedProtocol = useMemo(() => {
    if (!allProtocols || allProtocols.length === 0) return null;
    const qName = compound.name.toLowerCase();
    const qSlug = (compound.slug || compound.id || '').toLowerCase();
    return allProtocols.find((p) => {
      const pName = p.name.toLowerCase();
      const pSlug = (p.slug || p.id || '').toLowerCase();
      return (
        pName.includes(qName) ||
        qName.includes(pName) ||
        pSlug === qSlug ||
        (p.components && p.components.some((c: any) => c.peptide && c.peptide.toLowerCase().includes(qName)))
      );
    }) || null;
  }, [compound, allProtocols]);

  const recon = typeof compound.reconstitution === 'object' ? (compound.reconstitution as ReconstitutionGuide) : null;
  const storage = compound.storage || {};

  // Formatted metadata
  const confidenceScore = compound.confidence || (parsed?.metadata.evidenceGrade?.match(/confidence\s*(\d+)/i) ? parseInt(RegExp.$1, 10) : null);
  const evidenceGrade = compound.evidence || parsed?.metadata.evidenceGrade || (compound.body && compound.body.match(/EVIDENCE GRADE\s+([^\n]+)/i)?.[1]);
  const primaryRoute = parsed?.metadata.primaryRoute || parsed?.dosing.route || (compound.body && compound.body.match(/PRIMARY ROUTE\s+([^\n]+)/i)?.[1]);
  const formsAvailable = parsed?.metadata.availableForms || (compound.body && compound.body.match(/AVAILABLE FORMS\s+([^\n]+)/i)?.[1]);
  const halfLifeVal = compound.halfLife || storage.halfLife || parsed?.metadata.halfLife || (compound.body && compound.body.match(/HALF-LIFE\s+([^\n]+)/i)?.[1]);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Back button */}
      <div 
        onClick={onBack}
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.45rem', 
          cursor: 'pointer', 
          color: 'var(--text-secondary)', 
          fontWeight: 600, 
          fontSize: '0.92rem', 
          marginBottom: '1.25rem' 
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Knowledge Base</span>
      </div>

      {/* Header Card */}
      <div className="compound-item-card" style={{ padding: '2rem', marginBottom: '1.5rem', cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ flex: '1 1 450px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
              <span className="badge-tag">{compound.category}</span>
              {compound.kind && (
                <span className="compound-pill" style={{ textTransform: 'capitalize' }}>
                  {compound.kind}
                </span>
              )}
              {confidenceScore && (
                <span 
                  className="compound-pill" 
                  style={{ 
                    background: confidenceScore >= 7 ? '#ECFDF5' : '#FFFBEB', 
                    color: confidenceScore >= 7 ? '#065F46' : '#92400E',
                    borderColor: confidenceScore >= 7 ? '#A7F3D0' : '#FDE68A',
                    fontWeight: 700 
                  }}
                >
                  Confidence: {confidenceScore}/10
                </span>
              )}
              {evidenceGrade && (
                <span className="compound-pill" style={{ background: '#F8F9FD', color: '#4B5563' }}>
                  Grade: {evidenceGrade.replace(/\s+/g, ' ').slice(0, 40)}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              {compound.name}
            </h1>

            {(compound.fullName || compound.aka) && (
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.35rem' }}>
                {compound.fullName || compound.aka}
              </p>
            )}

            {compound.source && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                Source: <code>{compound.source}</code>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
            {matchedProtocol && onSelectProtocol && (
              <button
                onClick={() => onSelectProtocol(matchedProtocol)}
                className="btn btn-outline"
                style={{ fontSize: '0.88rem', padding: '0.55rem 1.15rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <FileText size={16} />
                <span>View Protocol</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Specs Bar */}
        {(formsAvailable || halfLifeVal || primaryRoute) && (
          <div 
            style={{ 
              marginTop: '1.4rem', 
              paddingTop: '1.15rem', 
              borderTop: '1px solid var(--border)', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}
          >
            {formsAvailable && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  Available Forms
                </span>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.2rem' }}>
                  {formsAvailable}
                </p>
              </div>
            )}
            {primaryRoute && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  Primary Route
                </span>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.2rem' }}>
                  {primaryRoute}
                </p>
              </div>
            )}
            {halfLifeVal && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  Half-Life / Kinetics
                </span>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.2rem' }}>
                  {halfLifeVal}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Protocol Available Banner */}
      {matchedProtocol && onSelectProtocol && (
        <div 
          onClick={() => onSelectProtocol(matchedProtocol)}
          style={{ 
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', 
            border: '1px solid #DDD6FE', 
            borderRadius: '16px', 
            padding: '1.15rem 1.4rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.98rem', color: '#4C1D95' }}>Official PepPal Clinical Dosing Protocol Available</strong>
              <p style={{ fontSize: '0.85rem', color: '#6D28D9', marginTop: '0.15rem' }}>
                {matchedProtocol.name} · Step-by-step titration schedules, reconstitution math & injection timing.
              </p>
            </div>
          </div>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem' }}>Open Protocol →</span>
        </div>
      )}

      {/* Research Disclaimer */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '16px', padding: '1.15rem 1.4rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.88rem', color: '#92400E', lineHeight: 1.55 }}>
          <strong>PepTalk Clinical Research Assistant:</strong> All information is provided for educational and biomedical research reference only and does not constitute medical advice or clinical prescribing instructions. Peptides discussed are not approved for human consumption unless prescribed by a licensed medical professional.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: WHAT IT IS & OVERVIEW */}
      {/* ========================================================================= */}
      <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
        <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <Dna size={18} style={{ color: 'var(--primary)' }} />
          <span>1 · What It Is & Where It Sits</span>
        </h3>
        
        {parsed?.whatItIs ? (
          <div style={{ whiteSpace: 'pre-line', color: '#2B2D3A', lineHeight: 1.75, fontSize: '0.96rem' }}>
            {parsed.whatItIs}
          </div>
        ) : (
          <p style={{ color: '#2B2D3A', lineHeight: 1.75, fontSize: '0.96rem' }}>
            {compound.overview || 'Clinical monograph overview in compilation.'}
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: FUNCTION & MECHANISM OF ACTION */}
      {/* ========================================================================= */}
      {(compound.mechanismOfAction || parsed?.mechanism || compound.mechanism) && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            <span>2 · Function & Mechanism of Action</span>
          </h3>
          <div style={{ whiteSpace: 'pre-line', color: '#2B2D3A', lineHeight: 1.75, fontSize: '0.96rem' }}>
            {parsed?.mechanism || compound.mechanismOfAction || compound.mechanism}
          </div>
        </div>
      )}

      {/* Research Contexts (Core Peptides) */}
      {(compound.researchContexts || compound.contexts) && (compound.researchContexts || compound.contexts)!.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Target size={18} style={{ color: 'var(--primary)' }} />
            <span>Primary Research Contexts</span>
          </h3>
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            {(compound.researchContexts || compound.contexts)!.map((ctx, i) => (
              <span key={i} className="chip" style={{ cursor: 'default', background: '#F8F9FD' }}>{ctx}</span>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: EVIDENCE & CLINICAL STUDIES */}
      {/* ========================================================================= */}
      {parsed?.evidence?.fullText && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
            <span>3 · Evidence & Clinical Trial Context</span>
          </h3>

          {parsed.evidence.clinicalTrial && (
            <div style={{ background: '#F8F9FD', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.15rem', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clinical & Human Trial Evidence
              </strong>
              <p style={{ fontSize: '0.94rem', color: '#2B2D3A', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                {parsed.evidence.clinicalTrial}
              </p>
            </div>
          )}

          {parsed.evidence.correlative && (
            <div style={{ background: '#F8F9FD', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.15rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Correlative, Animal & Real-World Use
              </strong>
              <p style={{ fontSize: '0.94rem', color: '#2B2D3A', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                {parsed.evidence.correlative}
              </p>
            </div>
          )}

          {!parsed.evidence.clinicalTrial && !parsed.evidence.correlative && (
            <div style={{ whiteSpace: 'pre-line', color: '#2B2D3A', lineHeight: 1.75, fontSize: '0.96rem' }}>
              {parsed.evidence.fullText}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: DOSING & PROTOCOL GUIDELINES */}
      {/* ========================================================================= */}
      {(compound.dosageRanges || compound.dosing || parsed?.dosing?.fullText) && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Syringe size={18} style={{ color: 'var(--primary)' }} />
            <span>4 · Dosing & Protocol Guidelines</span>
          </h3>

          {/* Dosing metric pill bar */}
          {(parsed?.dosing?.dose || parsed?.dosing?.frequency || parsed?.dosing?.weeklyPattern) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {parsed.dosing.dose && (
                <div style={{ background: '#F8F9FD', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reference Dose</span>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '0.2rem' }}>{parsed.dosing.dose}</p>
                </div>
              )}
              {parsed.dosing.frequency && (
                <div style={{ background: '#F8F9FD', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Frequency</span>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '0.2rem' }}>{parsed.dosing.frequency}</p>
                </div>
              )}
              {parsed.dosing.weeklyPattern && (
                <div style={{ background: '#F8F9FD', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pattern</span>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '0.2rem' }}>{parsed.dosing.weeklyPattern}</p>
                </div>
              )}
            </div>
          )}

          <div style={{ whiteSpace: 'pre-line', color: '#2B2D3A', lineHeight: 1.75, fontSize: '0.96rem' }}>
            {parsed?.dosing?.fullText || compound.dosageRanges || compound.dosing}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: RECONSTITUTION & MIXING GUIDELINES */}
      {/* ========================================================================= */}
      {(recon || typeof compound.reconstitution === 'string') && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Droplet size={18} style={{ color: 'var(--primary)' }} />
            <span>5 · Reconstitution & Mixing Guidelines</span>
          </h3>

          {recon ? (
            <div>
              {recon.instructions && (
                <p style={{ color: '#2B2D3A', lineHeight: 1.7, fontSize: '0.96rem', marginBottom: '1rem' }}>
                  {recon.instructions}
                </p>
              )}

              {(recon.typicalVialSize || recon.waterVolume || recon.resultingConcentration) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {recon.typicalVialSize && (
                    <div style={{ background: '#F8F9FD', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vial Size</span>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{recon.typicalVialSize}</p>
                    </div>
                  )}
                  {recon.waterVolume && (
                    <div style={{ background: '#F8F9FD', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>BAC Water Volume</span>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{recon.waterVolume}</p>
                    </div>
                  )}
                  {recon.resultingConcentration && (
                    <div style={{ background: '#F8F9FD', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Concentration</span>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{recon.resultingConcentration}</p>
                    </div>
                  )}
                </div>
              )}

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
                          <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{row.vialSize || row.vial}</td>
                          <td style={{ padding: '0.65rem 1rem' }}>{row.bacWater || row.water}</td>
                          <td style={{ padding: '0.65rem 1rem' }}>{row.concentration}</td>
                          <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)' }}>{row.doseRef || row.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {recon.note && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  <em>{recon.note}</em>
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#2B2D3A', lineHeight: 1.7, fontSize: '0.96rem' }}>
              {compound.reconstitution}
            </p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: THE PRACTICAL TAKE */}
      {/* ========================================================================= */}
      {parsed?.practicalTake && (
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #F5F3FF 0%, #FAF5FF 100%)', 
            border: '1.5px solid #DDD6FE', 
            borderRadius: '16px', 
            padding: '1.75rem', 
            marginBottom: '1.5rem' 
          }}
        >
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#4C1D95', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Lightbulb size={18} style={{ color: '#6D28D9' }} />
            <span>6 · The Practical Take</span>
          </h3>
          <div style={{ whiteSpace: 'pre-line', color: '#3730A3', lineHeight: 1.75, fontSize: '0.96rem', fontWeight: 500 }}>
            {parsed.practicalTake}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: SAFETY PROFILE & RISK MITIGATION */}
      {/* ========================================================================= */}
      {parsed?.safetyProfile?.fullText && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} />
            <span>7 · Safety Profile & Risk Mitigation</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {parsed.safetyProfile.predicted && (
              <div style={{ background: '#F8F9FD', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.15rem' }}>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Predicted From Biological Mechanism
                </strong>
                <p style={{ fontSize: '0.93rem', color: '#3A3D4D', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {parsed.safetyProfile.predicted}
                </p>
              </div>
            )}

            {parsed.safetyProfile.observed && (
              <div style={{ background: '#F8F9FD', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.15rem' }}>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Observed In Real-World Use
                </strong>
                <p style={{ fontSize: '0.93rem', color: '#3A3D4D', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {parsed.safetyProfile.observed}
                </p>
              </div>
            )}

            {parsed.safetyProfile.avoidIf && (
              <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <AlertTriangle size={16} style={{ color: '#E11D48' }} />
                  <strong style={{ fontSize: '0.84rem', color: '#9F1239', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Contraindications (Avoid If)
                  </strong>
                </div>
                <p style={{ fontSize: '0.93rem', color: '#881337', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {parsed.safetyProfile.avoidIf}
                </p>
              </div>
            )}

            {parsed.safetyProfile.whatIsNotKnown && (
              <div style={{ background: '#F8F9FD', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.15rem' }}>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  What Is Not Known (Scientific Gaps)
                </strong>
                <p style={{ fontSize: '0.93rem', color: '#4B5563', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {parsed.safetyProfile.whatIsNotKnown}
                </p>
              </div>
            )}

            {parsed.safetyProfile.howToRunSafely && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#2563EB' }} />
                  <strong style={{ fontSize: '0.84rem', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    How To Run It More Safely
                  </strong>
                </div>
                <p style={{ fontSize: '0.93rem', color: '#1E3A8A', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {parsed.safetyProfile.howToRunSafely}
                </p>
              </div>
            )}

            {parsed.safetyProfile.howToJudgeIt && (
              <div style={{ background: '#F8F9FD', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.15rem' }}>
                <strong style={{ fontSize: '0.84rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  How To Judge Clinical Response
                </strong>
                <p style={{ fontSize: '0.93rem', color: '#3A3D4D', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {parsed.safetyProfile.howToJudgeIt}
                </p>
              </div>
            )}

            {!parsed.safetyProfile.predicted && !parsed.safetyProfile.observed && !parsed.safetyProfile.avoidIf && (
              <div style={{ whiteSpace: 'pre-line', color: '#2B2D3A', lineHeight: 1.75, fontSize: '0.96rem' }}>
                {parsed.safetyProfile.fullText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: BLOODWORK & INTERACTIONS */}
      {/* ========================================================================= */}
      {parsed?.bloodwork?.fullText && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Activity size={20} style={{ color: '#EF4444' }} />
            <span>8 · Bloodwork Markers & Compound Interactions</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {parsed.bloodwork.stacksSameAxis && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.15rem' }}>
                <strong style={{ fontSize: '0.84rem', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Stacks On The Same Axis (Synergies & Additive Load)
                </strong>
                <p style={{ fontSize: '0.93rem', color: '#14532D', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {parsed.bloodwork.stacksSameAxis}
                </p>
              </div>
            )}

            {parsed.bloodwork.bluntsCompound && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '1.15rem' }}>
                <strong style={{ fontSize: '0.84rem', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  What Blunts This Compound
                </strong>
                <p style={{ fontSize: '0.93rem', color: '#78350F', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {parsed.bloodwork.bluntsCompound}
                </p>
              </div>
            )}

            {parsed.bloodwork.addsToEffects && (
              <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '1.15rem' }}>
                <strong style={{ fontSize: '0.84rem', color: '#9F1239', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  What Adds To Its Effects & Side-Effect Burden
                </strong>
                <p style={{ fontSize: '0.93rem', color: '#881337', lineHeight: 1.65, marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {parsed.bloodwork.addsToEffects}
                </p>
              </div>
            )}

            <div style={{ background: '#F8F9FD', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
              <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Biomarker Movements & Panel Schedule
              </strong>
              <div style={{ whiteSpace: 'pre-line', color: '#2B2D3A', lineHeight: 1.7, fontSize: '0.92rem', marginTop: '0.5rem' }}>
                {parsed.bloodwork.fullText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storage & Stability (Core Peptides) */}
      {compound.storage && (compound.storage.before || compound.storage.beforeReconstitution || compound.storage.after || compound.storage.afterReconstitution) && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <ThermometerSnowflake size={18} style={{ color: 'var(--primary)' }} />
            <span>Storage & Stability Guidelines</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
            {(compound.storage.before || compound.storage.beforeReconstitution) && (
              <div style={{ background: '#F8F9FD', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Before Reconstitution</strong>
                <p style={{ fontSize: '0.92rem', color: '#4A4C5A', marginTop: '0.35rem' }}>
                  {compound.storage.before || compound.storage.beforeReconstitution}
                </p>
              </div>
            )}
            {(compound.storage.after || compound.storage.afterReconstitution) && (
              <div style={{ background: '#F8F9FD', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', textTransform: 'uppercase' }}>After Reconstitution</strong>
                <p style={{ fontSize: '0.92rem', color: '#4A4C5A', marginTop: '0.35rem' }}>
                  {compound.storage.after || compound.storage.afterReconstitution}
                </p>
              </div>
            )}
            {(compound.halfLife || compound.storage.halfLife) && (
              <div style={{ background: '#F8F9FD', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Pharmacokinetics / Half-life</strong>
                <p style={{ fontSize: '0.92rem', color: '#4A4C5A', marginTop: '0.35rem' }}>
                  {compound.halfLife || compound.storage.halfLife}
                </p>
              </div>
            )}
            {(compound.stability || compound.storage.stability) && (
              <div style={{ background: '#F8F9FD', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Stability & Cycling</strong>
                <p style={{ fontSize: '0.92rem', color: '#4A4C5A', marginTop: '0.35rem' }}>
                  {compound.stability || compound.storage.stability}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sourcing Section */}
      {parsed?.sourcing && (
        <div className="compound-item-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
            Sourcing & Vetted Supply
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {parsed.sourcing}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNABRIDGED RAW MONOGRAPH ACCORDION (100% of the extracted text) */}
      {/* ========================================================================= */}
      {compound.body && (
        <div className="compound-item-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <div 
            onClick={() => setShowRawMonograph(!showRawMonograph)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)' }}>
                Complete Unabridged Monograph Document ({compound.body.length.toLocaleString()} characters)
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>
              <span>{showRawMonograph ? 'Hide Full Monograph' : 'View Full Text'}</span>
              {showRawMonograph ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {showRawMonograph && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <pre 
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'inherit', 
                  fontSize: '0.92rem', 
                  lineHeight: 1.75, 
                  color: '#1F2937', 
                  background: '#F8F9FD', 
                  padding: '1.25rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)',
                  overflowX: 'auto'
                }}
              >
                {compound.body}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUBLISHED RESEARCH PAPERS (Auto-linked) */}
      {/* ========================================================================= */}
      {linkedPapers.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '2rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            <span>Published Clinical Research ({linkedPapers.length} Papers)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {linkedPapers.map((paper, idx) => (
              <div key={idx} style={{ padding: '1.25rem', borderRadius: '14px', background: '#F8F9FD', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge-tag" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                    {paper.topic || compound.category}
                  </span>
                  {(paper.journal || paper.source) && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {paper.journal || paper.source} {paper.year && `· ${paper.year}`}
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                  {paper.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '0.75rem' }}>
                  {paper.summary}
                </p>
                {paper.url && (
                  <a 
                    href={paper.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      color: 'var(--primary)', 
                      fontWeight: 700, 
                      fontSize: '0.85rem', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.3rem', 
                      textDecoration: 'none' 
                    }}
                  >
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
