'use client';

import React, { useState, useMemo } from 'react';
import { Droplet, Info, ShieldCheck } from 'lucide-react';

interface CalculatorViewProps {
  initialCompoundName?: string;
}

export default function CalculatorView({
  initialCompoundName,
}: CalculatorViewProps) {
  const [mg, setMg] = useState<number>(10);
  const [ml, setMl] = useState<number>(2);
  const [dose, setDose] = useState<number>(2.5);
  const [unit, setUnit] = useState<'mg' | 'mcg'>('mg');

  const { unitsDisplay, concDisplay, volumeMl } = useMemo(() => {
    if (mg <= 0 || ml <= 0 || dose <= 0) {
      return { unitsDisplay: '--', concDisplay: 'Concentration: --', volumeMl: 0 };
    }

    const conc = mg / ml;
    const doseInMg = unit === 'mcg' ? dose / 1000 : dose;
    const vol = doseInMg / conc;
    const units = vol * 100; // U-100 insulin syringe scale

    return {
      unitsDisplay: units.toFixed(1).replace(/\.0$/, ''),
      concDisplay: `Concentration: ${conc.toFixed(2)} mg/mL (${(conc * 1000).toLocaleString()} mcg/mL)`,
      volumeMl: vol,
    };
  }, [mg, ml, dose, unit]);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Reconstitution & Syringe Calculator</h1>
          <p className="page-subtitle">
            Accurate BAC water mixing ratios, concentration calculation, and U-100 insulin syringe tick markers.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {/* Input Parameters */}
        <div className="compound-item-card" style={{ padding: '2rem', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={20} style={{ color: 'var(--primary)' }} />
            <span>Vial & Dose Parameters</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                Vial Peptide Quantity (mg)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={mg || ''}
                onChange={(e) => setMg(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none' }}
                placeholder="e.g. 5, 10, 15"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                Bacteriostatic Water Added (mL)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={ml || ''}
                onChange={(e) => setMl(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none' }}
                placeholder="e.g. 1, 2, 3"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Target Dose
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setUnit('mg')}
                    className={`chip ${unit === 'mg' ? 'active' : ''}`}
                    style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    mg
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('mcg')}
                    className={`chip ${unit === 'mcg' ? 'active' : ''}`}
                    style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    mcg
                  </button>
                </div>
              </div>

              <input
                type="number"
                min="0.01"
                step={unit === 'mcg' ? '50' : '0.25'}
                value={dose || ''}
                onChange={(e) => setDose(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none' }}
                placeholder={unit === 'mcg' ? 'e.g. 250, 500' : 'e.g. 2.5, 5'}
              />
            </div>
          </div>
        </div>

        {/* Calculation Result */}
        <div className="compound-item-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', cursor: 'default' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Draw Measurement
          </h3>

          <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              U-100 Syringe Draw Units
            </span>
            <div style={{ fontSize: '4.2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, margin: '0.5rem 0' }}>
              {unitsDisplay}
            </div>
            <span style={{ fontSize: '0.92rem', color: '#4A4C5A', fontWeight: 600 }}>
              units on standard insulin syringe ({volumeMl.toFixed(3)} mL)
            </span>
          </div>

          <div style={{ background: '#F8F9FD', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>
              <Info size={16} style={{ color: 'var(--primary)' }} />
              <span>{concDisplay}</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} style={{ color: 'var(--accent-teal)' }} />
            <span>Calibrated for standard 100-unit (1 mL) or 50-unit (0.5 mL) U-100 syringes.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
