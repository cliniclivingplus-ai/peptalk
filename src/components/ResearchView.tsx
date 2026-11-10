'use client';

import React, { useState, useMemo } from 'react';
import { ResearchPaperRef } from '@/types';
import { Search, BookOpen, ExternalLink } from 'lucide-react';

interface ResearchViewProps {
  papers: ResearchPaperRef[];
}

export default function ResearchView({ papers }: ResearchViewProps) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All');

  const topics = useMemo(() => {
    const set = new Set<string>(['All']);
    papers.forEach((p) => {
      if (p.topic) set.add(p.topic);
    });
    return Array.from(set);
  }, [papers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return papers.filter((p) => {
      if (topic !== 'All' && (p.topic || '').toLowerCase() !== topic.toLowerCase()) {
        return false;
      }
      if (q) {
        return (
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          (p.journal || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [papers, topic, search]);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Published Clinical Research</h1>
          <p className="page-subtitle">
            Curated PubMed articles, clinical trials, and pharmacology peer-reviewed studies.
          </p>
        </div>
      </div>

      <div className="search-container">
        <Search className="search-icon-pos" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search research studies by compound, indication, or mechanism..."
          className="search-input-field"
        />
      </div>

      <div className="filter-chips-list">
        {topics.map((t) => (
          <button
            key={t}
            className={`chip ${topic === t ? 'active' : ''}`}
            onClick={() => setTopic(t)}
          >
            <span>{t}</span>
            {t !== 'All' && (
              <span className="tab-badge-count">
                {papers.filter((p) => p.topic === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.map((paper, idx) => (
          <div key={idx} className="compound-item-card" style={{ padding: '1.75rem', cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <span className="badge-tag">{paper.topic || 'Clinical Pharmacology'}</span>
              {paper.journal && (
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {paper.journal} {paper.year && `· ${paper.year}`}
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.65rem', lineHeight: 1.4 }}>
              {paper.title}
            </h3>

            <p style={{ fontSize: '0.92rem', color: '#4A4C5A', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              {paper.summary}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
              {paper.url ? (
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                >
                  <span>Read full study on PubMed</span> <ExternalLink size={14} />
                </a>
              ) : (
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Citation reference indexed</span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No research papers found matching your query.
          </div>
        )}
      </div>
    </div>
  );
}
