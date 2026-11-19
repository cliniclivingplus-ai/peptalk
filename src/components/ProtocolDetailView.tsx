'use client';

import React from 'react';
import { Protocol } from '@/types';
import { 
  ArrowLeft, 
  FileText, 
  Droplet, 
  Lightbulb, 
  FlaskConical, 
  Table as TableIcon, 
  Clock, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers,
  ShieldAlert
} from 'lucide-react';

interface ProtocolDetailViewProps {
  protocol: Protocol;
  onBack: () => void;
  onOpenCalculator: () => void;
}

export default function ProtocolDetailView({
  protocol,
  onBack,
  onOpenCalculator,
}: ProtocolDetailViewProps) {
  // Extract reconstitution table items if in protocol.reconstitution.table or protocol.tableRows
  const reconTable = protocol.reconstitution?.table || protocol.tableRows || [];
  const reconInstructions = protocol.reconstitution?.instructions || protocol.instructions;
  const reconNote = protocol.reconstitution?.note || protocol.note;

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div 
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Protocols</span>
      </div>

      {/* Header Banner */}
      <div className="compound-item-card" style={{ padding: '2rem', marginBottom: '1.75rem', cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <span className="badge-tag">Clinical Protocol</span>
          {protocol.tagline && (
            <span className="compound-pill" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
              {protocol.tagline}
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          {protocol.name}
        </h1>
        {protocol.subtitle && (
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.35rem' }}>
            {protocol.subtitle}
          </p>
        )}

        {/* Action Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          {protocol.pdfUrl && (
            <a
              href={protocol.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', textDecoration: 'none' }}
            >
              <Download size={16} />
              <span>Download Official Protocol (PDF)</span>
            </a>
          )}
          <button onClick={onOpenCalculator} className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
            <Droplet size={16} style={{ color: 'var(--primary)' }} />
            <span>Open Reconstitution Calculator</span>
          </button>
        </div>
      </div>

      {/* What is it / Background */}
      {protocol.whatIsIt && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Info size={18} style={{ color: 'var(--primary)' }} />
            <span>What It Is & Mechanism of Action</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem', whiteSpace: 'pre-line' }}>
            {protocol.whatIsIt}
          </p>
        </div>
      )}

      {/* Core Principle */}
      {protocol.corePrinciple && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Lightbulb size={18} style={{ color: 'var(--primary)' }} />
            <span>Core Clinical Principle</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {protocol.corePrinciple}
          </p>
        </div>
      )}

      {/* Titration Steps Ladder */}
      {protocol.doseSteps && protocol.doseSteps.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <span>Titration & Dosing Ladder</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {protocol.doseSteps.map((stepItem: any, idx: number) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '1rem', 
                  padding: '1rem 1.15rem', 
                  background: '#F8F9FD', 
                  borderRadius: '12px',
                  border: '1px solid var(--border)' 
                }}
              >
                <div 
                  style={{ 
                    minWidth: '2.5rem', 
                    height: '2.5rem', 
                    borderRadius: '8px', 
                    background: 'var(--primary)', 
                    color: '#FFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}
                >
                  {stepItem.step || idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {stepItem.dose}
                    </strong>
                  </div>
                  {stepItem.notes && (
                    <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      {stepItem.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {protocol.doseEscalationNote && (
            <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ℹ️ {protocol.doseEscalationNote}
            </p>
          )}
        </div>
      )}

      {/* Decision Rules */}
      {protocol.decisionRules && protocol.decisionRules.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--primary)' }} />
            <span>Titration Decision Rules</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {protocol.decisionRules.map((rule: any, idx: number) => {
              const isAdvance = (rule.label || '').toLowerCase().includes('advance');
              const isHold = (rule.label || '').toLowerCase().includes('hold');
              const isReduce = (rule.label || '').toLowerCase().includes('reduce');
              const isStay = (rule.label || '').toLowerCase().includes('stay');

              const bg = isAdvance ? '#ECFDF5' : isHold ? '#FFFBEB' : isReduce ? '#FEF2F2' : '#EEF2FF';
              const border = isAdvance ? '#A7F3D0' : isHold ? '#FDE68A' : isReduce ? '#FECACA' : '#C7D2FE';
              const textCol = isAdvance ? '#065F46' : isHold ? '#92400E' : isReduce ? '#991B1B' : '#3730A3';

              return (
                <div key={idx} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '1rem 1.15rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: textCol, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    {rule.label}
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.55 }}>
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reconstitution & Dosing Reference Table */}
      {(reconTable.length > 0 || reconInstructions) && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <TableIcon size={18} style={{ color: 'var(--primary)' }} />
            <span>Reconstitution & Measurement Matrix</span>
          </h3>

          {reconInstructions && (
            <p style={{ color: '#3A3D4D', lineHeight: 1.65, fontSize: '0.94rem', marginBottom: '1rem' }}>
              {reconInstructions}
            </p>
          )}

          {reconTable.length > 0 && (
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border)', background: '#FFFFFF', margin: '1rem 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8F9FD', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>Vial Size</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>BAC Water</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>Concentration</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>Syringe Draw / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {reconTable.map((row: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: idx < reconTable.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{row.vial || row.vialSize || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{row.water || row.bacWater || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{row.concentration || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{row.reference || row.doseRef || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reconNote && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              💡 {reconNote}
            </p>
          )}
        </div>
      )}

      {/* Cycle Info */}
      {protocol.cycleInfo && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            <span>Cycle Duration & Frequency</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {protocol.cycleInfo}
          </p>
        </div>
      )}

      {/* Side Effects Mitigation Table */}
      {protocol.sideEffects && protocol.sideEffects.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <ShieldAlert size={18} style={{ color: '#E11D48' }} />
            <span>Side Effect Management & Tolerability</span>
          </h3>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border)', background: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#FFF1F2', borderBottom: '1px solid #FECDD3' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#9F1239', fontWeight: 700, width: '25%' }}>Symptom / Effect</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#9F1239', fontWeight: 700, width: '20%' }}>Severity</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#9F1239', fontWeight: 700, width: '55%' }}>Recommended Clinical Action</th>
                </tr>
              </thead>
              <tbody>
                {protocol.sideEffects.map((se: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: idx < protocol.sideEffects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>{se.effect}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: (se.severity || '').toLowerCase().includes('severe') ? '#FEE2E2' : '#FEF3C7',
                        color: (se.severity || '').toLowerCase().includes('severe') ? '#991B1B' : '#92400E'
                      }}>
                        {se.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#374151', lineHeight: 1.55 }}>{se.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
