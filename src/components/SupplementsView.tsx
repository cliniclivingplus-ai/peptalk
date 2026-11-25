'use client';

import React, { useState, useMemo } from 'react';
import { Compound, Course, Protocol } from '@/types';
import { Search, Pill, GraduationCap, FileText, Sparkles, ShieldCheck, Layers } from 'lucide-react';

interface SupplementsViewProps {
  supplements: Compound[];
  courses: Course[];
  protocols: Protocol[];
  onSelectSupplement: (c: Compound) => void;
  onSelectCourse: (c: Course) => void;
  onSelectProtocol: (p: Protocol) => void;
}

/**
 * Extract a concise dosing snippet from the structured supplement monograph body
 */
function extractDoseSnippet(body?: string): string | null {
  if (!body) return null;
  const match = body.match(/(?:^|\n)DOSE\s+([^\n]+)/i);
  if (match && match[1]) {
    const cleaned = match[1].trim();
    return cleaned.length > 110 ? cleaned.slice(0, 107) + '…' : cleaned;
  }
  return null;
}

/**
 * Extract the "BEST FOR" snippet from the monograph body
 */
function extractBestFor(body?: string): string | null {
  if (!body) return null;
  const match = body.match(/(?:^|\n)BEST FOR\s+([^\n]+)/i);
  if (match && match[1]) {
    const cleaned = match[1].trim();
    return cleaned.length > 120 ? cleaned.slice(0, 117) + '…' : cleaned;
  }
  return null;
}

export default function SupplementsView({
  supplements,
  courses,
  protocols,
  onSelectSupplement,
  onSelectCourse,
  onSelectProtocol,
}: SupplementsViewProps) {
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // All 14 supplement categories sorted by count (descending)
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    supplements.forEach((s) => {
      if (s.category) {
        counts.set(s.category, (counts.get(s.category) || 0) + 1);
      }
    });
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
    return ['All', ...sorted];
  }, [supplements]);

  const filteredSupplements = useMemo(() => {
    const q = search.toLowerCase().trim();
    return supplements.filter((s) => {
      if (category !== 'All' && s.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      if (q) {
        const nameMatch = s.name.toLowerCase().includes(q);
        const akaMatch = s.fullName?.toLowerCase().includes(q) || s.aka?.toLowerCase().includes(q);
        const catMatch = s.category?.toLowerCase().includes(q);
        const bodyMatch = s.overview?.toLowerCase().includes(q) || s.body?.toLowerCase().includes(q);
        return nameMatch || akaMatch || catMatch || bodyMatch;
      }
      return true;
    });
  }, [supplements, category, search]);

  // Related supplement course & adjunct protocols
  const supplementCourse = useMemo(
    () => courses.find((c) => (c.title || '').toLowerCase().includes('supplement')),
    [courses]
  );

  const supplementProtocols = useMemo(
    () =>
      protocols.filter((p) => {
        const n = (p.name || '').toLowerCase();
        return n.includes('nad+') || n.includes('glutathione');
      }),
    [protocols]
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Pill size={26} style={{ color: 'var(--primary)' }} />
            <span>Supplements</span>
          </h1>
          <p className="page-subtitle">
            Complete clinical directory of {supplements.length} evidence-based supplements with forms, mechanisms, trial evidence, dosing protocols, and safety interactions.
          </p>
        </div>
      </div>

      {/* Summary Stats & Quick Links Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '0.9rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#F1EEFE',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Pill size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {supplements.length}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Supplement Monographs
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '0.9rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {categories.length - 1}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Clinical Categories
            </div>
          </div>
        </div>

        {supplementCourse && (
          <button
            type="button"
            onClick={() => onSelectCourse(supplementCourse)}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(127, 102, 255, 0.25)',
              borderRadius: '14px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>
                Vitamins / Supplements Course →
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {supplementCourse.lesson_count || supplementCourse.lessons?.length || 5} lessons in Classroom
              </div>
            </div>
          </button>
        )}

        {supplementProtocols.length > 0 && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={12} />
              <span>Adjunct Protocols</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {supplementProtocols.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProtocol(p)}
                  style={{
                    background: '#F8F7FE',
                    border: '1px solid #DFD9FC',
                    borderRadius: '8px',
                    padding: '0.22rem 0.55rem',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                  }}
                >
                  {p.name.replace(' Dosing Protocol', '')} →
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="search-container">
        <Search className="search-icon-pos" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${supplements.length} supplements by name, form, benefit, dosing, or safety...`}
          className="search-input-field"
        />
      </div>

      {/* All 14 Category Chips */}
      <div className="filter-chips-list">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            <span>{cat}</span>
            <span className="tab-badge-count">
              {cat === 'All'
                ? supplements.length
                : supplements.filter((s) => s.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Result Count */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem', fontWeight: 600 }}>
        Showing {filteredSupplements.length} of {supplements.length} supplements
        {category !== 'All' ? ` in ${category}` : ''}
        {search.trim() ? ` matching "${search.trim()}"` : ''}
      </div>

      {/* Supplements Grid */}
      <div className="compounds-grid">
        {filteredSupplements.map((item, idx) => {
          const doseSnippet = extractDoseSnippet(item.body);
          const bestFor = extractBestFor(item.body);
          const overviewText =
            item.overview ||
            bestFor ||
            (item.body
              ? item.body.split('\n').find((l) => l.trim().length > 25) || item.body.slice(0, 120)
              : 'Complete clinical supplement monograph with dosing and safety.');

          return (
            <div
              key={item.id || item.name + idx}
              className="compound-item-card"
              onClick={() => onSelectSupplement(item)}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h3 className="compound-item-title" style={{ margin: 0 }}>{item.name}</h3>
                {item.evidence && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#047857',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '9999px',
                      padding: '0.15rem 0.5rem',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={11} />
                    {item.evidence}
                  </span>
                )}
              </div>

              {(item.aka || item.fullName) && (
                <p className="compound-item-subtitle" style={{ margin: 0 }}>
                  {item.aka || item.fullName}
                </p>
              )}

              <p className="compound-item-overview" style={{ margin: '0.15rem 0 0.25rem 0' }}>
                {overviewText}
              </p>

              {doseSnippet && (
                <div
                  style={{
                    fontSize: '0.76rem',
                    color: '#4B5563',
                    background: '#F8F7FE',
                    border: '1px solid #EAE6FE',
                    borderRadius: '8px',
                    padding: '0.45rem 0.65rem',
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: 'var(--primary)' }}>Dose:</strong> {doseSnippet}
                </div>
              )}

              <div className="compound-item-footer" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                <span className="badge-tag">{item.category}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700, fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles size={13} />
                  Full Details →
                </span>
              </div>
            </div>
          );
        })}

        {filteredSupplements.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No supplements found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
