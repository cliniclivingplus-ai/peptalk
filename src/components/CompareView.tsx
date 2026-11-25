'use client';

import React, { useState, useMemo } from 'react';
import { Compound } from '@/types';
import {
  GitCompareArrows,
  Plus,
  X,
  Search,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface CompareViewProps {
  compounds: Compound[];
  onSelectCompound: (c: Compound) => void;
  onAskAiCompare?: (names: string[]) => void;
}

const MAX_COMPARE = 5;

const QUICK_PRESETS: Array<{ label: string; names: string[] }> = [
  { label: 'Semaglutide vs Tirzepatide vs Retatrutide', names: ['Semaglutide', 'Tirzepatide', 'Retatrutide'] },
  { label: 'BPC-157 vs TB-500', names: ['BPC-157', 'TB-500'] },
  { label: 'CJC-1295 vs Ipamorelin vs Tesamorelin', names: ['CJC-1295', 'Ipamorelin', 'Tesamorelin'] },
  { label: 'Selank vs Semax', names: ['Selank', 'Semax'] },
];

function extractField(c: Compound, pattern: RegExp): string | null {
  if (!c.body) return null;
  const m = c.body.match(pattern);
  if (m && m[1]) {
    const cleaned = m[1].replace(/\s+/g, ' ').trim();
    return cleaned.length > 180 ? cleaned.slice(0, 177) + '…' : cleaned;
  }
  return null;
}

function getCompoundSummary(c: Compound) {
  const overview =
    c.overview ||
    extractField(c, /1\s*[·•-]\s*WHAT IT IS\s*\n([^\n]+)/i) ||
    'Clinical peptide/compound monograph.';

  const mechanism =
    c.mechanismOfAction ||
    c.mechanism ||
    extractField(c, /2\s*[·•-]\s*FUNCTION\s*&\s*MECHANISM\s*\n([^\n]+)/i) ||
    '—';

  const route =
    extractField(c, /PRIMARY ROUTE\s+([^\n]+)/i) ||
    extractField(c, /AVAILABLE FORMS\s+([^\n]+)/i) ||
    (c.kind === 'supplement' ? 'Oral' : 'SubQ / See monograph');

  const halfLife =
    c.halfLife ||
    c.storage?.halfLife ||
    extractField(c, /HALF-LIFE\s+([^\n]+)/i) ||
    '—';

  const dosing =
    c.dosageRanges ||
    c.dosing ||
    extractField(c, /(?:^|\n)DOSE\s+([^\n]+)/i) ||
    'See full monograph';

  const safety =
    extractField(c, /(?:4|7)\s*[·•-]\s*SAFETY[^\n]*\n([^\n]+)/i) ||
    'See full monograph for safety & interactions.';

  const evidence =
    c.evidence ||
    extractField(c, /EVIDENCE GRADE\s+([^\n]+)/i) ||
    (c.confidence ? `Confidence ${c.confidence}/10` : 'Clinical / Research');

  return { overview, mechanism, route, halfLife, dosing, safety, evidence };
}

export default function CompareView({
  compounds,
  onSelectCompound,
  onAskAiCompare,
}: CompareViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  // Deduplicate compounds by lowercase name (prefer core peptides / richer entries)
  const uniqueCompounds = useMemo(() => {
    const map = new Map<string, Compound>();
    for (const c of compounds) {
      if (!c.name) continue;
      const key = c.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, c);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [compounds]);

  const selectedCompounds = useMemo(
    () =>
      selectedIds
        .map((id) => uniqueCompounds.find((c) => (c.id || c.name) === id))
        .filter((c): c is Compound => !!c),
    [selectedIds, uniqueCompounds]
  );

  const filteredPicker = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return uniqueCompounds
      .filter((c) => !selectedIds.includes(c.id || c.name))
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (c.aka || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 40);
  }, [uniqueCompounds, selectedIds, pickerQuery]);

  const handleAdd = (c: Compound) => {
    const key = c.id || c.name;
    if (selectedIds.includes(key) || selectedIds.length >= MAX_COMPARE) return;
    setSelectedIds((prev) => [...prev, key]);
    setPickerQuery('');
    if (selectedIds.length + 1 >= MAX_COMPARE) {
      setIsPickerOpen(false);
    }
  };

  const handleRemove = (key: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== key));
  };

  const applyPreset = (names: string[]) => {
    const ids: string[] = [];
    for (const n of names) {
      const match = uniqueCompounds.find((c) => c.name.toLowerCase().includes(n.toLowerCase()));
      if (match) ids.push(match.id || match.name);
    }
    if (ids.length >= 2) {
      setSelectedIds(ids.slice(0, MAX_COMPARE));
      setIsPickerOpen(false);
    }
  };

  const rows: Array<{ label: string; key: keyof ReturnType<typeof getCompoundSummary> }> = [
    { label: 'Evidence / Grade', key: 'evidence' },
    { label: 'Overview', key: 'overview' },
    { label: 'Route / Forms', key: 'route' },
    { label: 'Half-Life', key: 'halfLife' },
    { label: 'Mechanism of Action', key: 'mechanism' },
    { label: 'Dosing / Protocol', key: 'dosing' },
    { label: 'Safety & Key Notes', key: 'safety' },
  ];

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Header */}
      <div className="page-header-row" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitCompareArrows size={25} style={{ color: 'var(--primary)' }} />
            <span>Compare</span>
          </h1>
          <p className="page-subtitle">
            Put 2 to 5 peptides or compounds side by side to compare mechanisms, dosing, half-life, evidence, and safety.
          </p>
        </div>
      </div>

      {/* Picker Controls Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '1rem',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            disabled={selectedIds.length >= MAX_COMPARE}
            onClick={() => setIsPickerOpen((v) => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.05rem',
              borderRadius: '11px',
              border: '1.5px solid var(--primary)',
              background: selectedIds.length >= MAX_COMPARE ? '#F1F5F9' : '#F5F3FF',
              color: selectedIds.length >= MAX_COMPARE ? '#94A3B8' : 'var(--primary)',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: selectedIds.length >= MAX_COMPARE ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Add a compound</span>
          </button>

          {/* Searchable Dropdown */}
          {isPickerOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '320px',
                maxWidth: '88vw',
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                boxShadow: '0 14px 36px rgba(15, 23, 42, 0.14)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '0.65rem', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  autoFocus
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  placeholder="Search peptides or supplements..."
                  style={{
                    width: '100%',
                    padding: '0.48rem 0.7rem 0.48rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredPicker.map((c) => (
                  <button
                    key={c.id || c.name}
                    type="button"
                    onClick={() => handleAdd(c)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.85rem',
                      border: 'none',
                      borderBottom: '1px solid #F1F5F9',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {c.category}
                    </span>
                  </button>
                ))}
                {filteredPicker.length === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    No matching compounds found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {selectedCompounds.length} of {MAX_COMPARE}
        </span>

        {/* Selected Pills */}
        {selectedCompounds.map((c) => {
          const key = c.id || c.name;
          return (
            <span
              key={key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.38rem 0.75rem',
                borderRadius: '9999px',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <span>{c.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(key)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={13} />
              </button>
            </span>
          );
        })}

        {selectedCompounds.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear all
          </button>
        )}

        {selectedCompounds.length >= 2 && onAskAiCompare && (
          <button
            type="button"
            onClick={() => onAskAiCompare(selectedCompounds.map((c) => c.name))}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.52rem 0.95rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} />
            <span>Ask AI Deep Comparison</span>
          </button>
        )}
      </div>

      {/* Quick Presets */}
      {selectedCompounds.length < 2 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.35rem' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.2rem' }}>
            Popular comparisons:
          </span>
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.names)}
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--primary)',
                background: '#F5F3FF',
                border: '1px solid #E4DEFF',
                borderRadius: '9999px',
                padding: '0.3rem 0.75rem',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty State or Side-by-Side Table */}
      {selectedCompounds.length < 2 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px dashed var(--border)',
            borderRadius: '16px',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.94rem',
            fontWeight: 600,
          }}
        >
          Select at least 2 peptides or compounds to see a side-by-side comparison table.
        </div>
      ) : (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflowX: 'auto',
            boxShadow: '0 4px 18px rgba(17, 17, 22, 0.05)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FAF9FE', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem 1.1rem', width: '165px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Attribute
                </th>
                {selectedCompounds.map((c) => (
                  <th key={c.id || c.name} style={{ padding: '1rem 1.1rem', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.45rem' }}>
                      {c.category}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectCompound(c)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        background: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '0.2rem 0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Full Monograph</span>
                      <ExternalLink size={11} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', verticalAlign: 'top', background: '#FCFBFD' }}>
                    {row.label}
                  </td>
                  {selectedCompounds.map((c) => {
                    const summary = getCompoundSummary(c);
                    return (
                      <td key={c.id || c.name} style={{ padding: '0.9rem 1.1rem', fontSize: '0.86rem', color: '#2B2D3A', lineHeight: 1.55, verticalAlign: 'top' }}>
                        {summary[row.key]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Research Disclaimer */}
      <div
        style={{
          marginTop: '1.5rem',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '0.9rem 1.2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem',
          fontSize: '0.8rem',
          color: '#92400E',
          lineHeight: 1.55,
        }}
      >
        <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
        <span>
          PepTalk is a clinical research assistant. All information is provided for educational and research purposes only and is not medical advice.
        </span>
      </div>
    </div>
  );
}
