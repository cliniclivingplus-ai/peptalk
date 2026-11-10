'use client';

import React, { useState, useMemo } from 'react';
import { Compound, KbTabType } from '@/types';
import { Search } from 'lucide-react';

interface KnowledgeBaseViewProps {
  corePeptides: Compound[];
  vaultItems: Compound[];
  onSelectCompound: (c: Compound) => void;
}

export default function KnowledgeBaseView({
  corePeptides,
  vaultItems,
  onSelectCompound,
}: KnowledgeBaseViewProps) {
  const [activeTab, setActiveTab] = useState<KbTabType>('core');
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const activeDataset = useMemo(() => {
    if (activeTab === 'core') return corePeptides;
    if (activeTab === 'vault_peptide') return vaultItems.filter((i) => i.kind === 'peptide');
    if (activeTab === 'vault_supplement') return vaultItems.filter((i) => i.kind === 'supplement');
    if (activeTab === 'vault_cosmetic') return vaultItems.filter((i) => i.kind === 'cosmetic');
    if (activeTab === 'vault_goal') return vaultItems.filter((i) => i.kind === 'goal');
    return [];
  }, [activeTab, corePeptides, vaultItems]);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    activeDataset.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).slice(0, 10);
  }, [activeDataset]);

  const filteredCompounds = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activeDataset.filter((c) => {
      if (category !== 'All' && c.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      if (q) {
        const nameMatch = c.name.toLowerCase().includes(q);
        const akaMatch = c.fullName?.toLowerCase().includes(q) || c.aka?.toLowerCase().includes(q);
        const overMatch = c.overview?.toLowerCase().includes(q) || c.body?.toLowerCase().includes(q);
        return nameMatch || akaMatch || overMatch;
      }
      return true;
    });
  }, [activeDataset, category, search]);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">
            Curated peptide monographs, full clinical mechanisms, reconstitution guidelines, and research papers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="library-tabs-bar">
        <button
          className={`library-tab ${activeTab === 'core' ? 'active' : ''}`}
          onClick={() => { setActiveTab('core'); setCategory('All'); }}
        >
          <span>Core Peptides</span>
          <span className="tab-badge-count">{corePeptides.length}</span>
        </button>

        <button
          className={`library-tab ${activeTab === 'vault_peptide' ? 'active' : ''}`}
          onClick={() => { setActiveTab('vault_peptide'); setCategory('All'); }}
        >
          <span>Peptide Vault</span>
          <span className="tab-badge-count">{vaultItems.filter((i) => i.kind === 'peptide').length}</span>
        </button>

        <button
          className={`library-tab ${activeTab === 'vault_supplement' ? 'active' : ''}`}
          onClick={() => { setActiveTab('vault_supplement'); setCategory('All'); }}
        >
          <span>Supplement Vault</span>
          <span className="tab-badge-count">{vaultItems.filter((i) => i.kind === 'supplement').length}</span>
        </button>

        <button
          className={`library-tab ${activeTab === 'vault_cosmetic' ? 'active' : ''}`}
          onClick={() => { setActiveTab('vault_cosmetic'); setCategory('All'); }}
        >
          <span>Cosmetic Vault</span>
          <span className="tab-badge-count">{vaultItems.filter((i) => i.kind === 'cosmetic').length}</span>
        </button>

        <button
          className={`library-tab ${activeTab === 'vault_goal' ? 'active' : ''}`}
          onClick={() => { setActiveTab('vault_goal'); setCategory('All'); }}
        >
          <span>Goal Stacks</span>
          <span className="tab-badge-count">{vaultItems.filter((i) => i.kind === 'goal').length}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="search-container">
        <Search className="search-icon-pos" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search across ${activeDataset.length} compounds...`}
          className="search-input-field"
        />
      </div>

      {/* Category Chips */}
      <div className="filter-chips-list">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            <span>{cat}</span>
            {cat !== 'All' && (
              <span className="tab-badge-count">
                {activeDataset.filter((c) => c.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="compounds-grid">
        {filteredCompounds.map((item, idx) => {
          const overviewText =
            item.overview ||
            (item.body
              ? item.body.split('\n').find((l) => l.trim().length > 25) || item.body.slice(0, 120)
              : 'Complete clinical peptide monograph, dosing parameters, and research context.');

          return (
            <div
              key={item.id || item.name + idx}
              className="compound-item-card"
              onClick={() => onSelectCompound(item)}
            >
              <h3 className="compound-item-title">{item.name}</h3>
              <p className="compound-item-subtitle">{item.fullName || item.aka || item.category}</p>
              <p className="compound-item-overview">{overviewText}</p>
              <div className="compound-item-footer">
                <span className="badge-tag">{item.category}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem' }}>
                  View Monograph →
                </span>
              </div>
            </div>
          );
        })}

        {filteredCompounds.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No compounds found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
