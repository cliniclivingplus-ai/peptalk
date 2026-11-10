'use client';

import React from 'react';
import { Protocol } from '@/types';
import { FileText, ArrowRight } from 'lucide-react';

interface ProtocolsViewProps {
  protocols: Protocol[];
  onSelectProtocol: (p: Protocol) => void;
}

export default function ProtocolsView({
  protocols,
  onSelectProtocol,
}: ProtocolsViewProps) {
  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Vetted Dosing Protocols</h1>
          <p className="page-subtitle">
            Evidence-grounded peptide dosing guidelines, titration ladders, and reconstitution ratios.
          </p>
        </div>
      </div>

      <div className="compounds-grid">
        {protocols.map((proto) => (
          <div
            key={proto.id || proto.name}
            className="compound-item-card"
            onClick={() => onSelectProtocol(proto)}
          >
            <h3 className="compound-item-title">{proto.name}</h3>
            <p className="compound-item-subtitle">{proto.subtitle || proto.tagline || 'Clinical Protocol'}</p>
            <p className="compound-item-overview">
              {proto.corePrinciple || proto.cycleInfo || proto.instructions || 'Standard dosing titration and reconstitution guidance.'}
            </p>
            <div className="compound-item-footer">
              <span className="compound-pill">Protocol</span>
              {proto.pdfUrl && <span className="badge-tag">PDF Manual</span>}
              <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>View Protocol</span> <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
