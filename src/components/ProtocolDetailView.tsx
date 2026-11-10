'use client';

import React from 'react';
import { Protocol } from '@/types';
import { ArrowLeft, FileText, Droplet, Lightbulb, FlaskConical, Table as TableIcon, Clock } from 'lucide-react';

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
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div 
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Protocols</span>
      </div>

      <div className="compound-item-card" style={{ padding: '2rem', marginBottom: '1.75rem', cursor: 'default' }}>
        <span className="badge-tag" style={{ marginBottom: '0.5rem' }}>Clinical Protocol</span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          {protocol.name}
        </h1>
        {protocol.subtitle && (
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.2rem' }}>
            {protocol.subtitle}
          </p>
        )}
      </div>

      {protocol.corePrinciple && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Lightbulb size={18} style={{ color: 'var(--primary)' }} />
            <span>Core Clinical Principle</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {protocol.corePrinciple}
          </p>
        </div>
      )}

      {protocol.instructions && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <FlaskConical size={18} style={{ color: 'var(--primary)' }} />
            <span>Reconstitution & Dosing Instructions</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {protocol.instructions}
          </p>
        </div>
      )}

      {protocol.tableRows && protocol.tableRows.length > 0 && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <TableIcon size={18} style={{ color: 'var(--primary)' }} />
            <span>Dosing & Reconstitution Reference Table</span>
          </h3>
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
                {protocol.tableRows.map((row, idx) => (
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
        </div>
      )}

      {protocol.cycleInfo && (
        <div className="compound-item-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            <span>Cycle & Titration Protocol</span>
          </h3>
          <p style={{ color: '#3A3D4D', lineHeight: 1.7, fontSize: '0.96rem' }}>
            {protocol.cycleInfo}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button onClick={onOpenCalculator} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <Droplet size={17} />
          <span>Open Reconstitution Calculator</span>
        </button>
      </div>
    </div>
  );
}
