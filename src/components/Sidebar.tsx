'use client';

import React from 'react';
import { ViewMode } from '@/types';
import { 
  MessageSquare, 
  Dna, 
  FileText, 
  GraduationCap, 
  Droplet, 
  BookOpen, 
  KeyRound 
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenApiKey: () => void;
  compoundCount: number;
  courseCount: number;
}

export default function Sidebar({
  currentView,
  onNavigate,
  onOpenApiKey,
  compoundCount,
  courseCount,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onNavigate('chat'); }} 
          className="brand-logo"
        >
          <div className="brand-icon-box">
            <span style={{ fontSize: '1.2rem' }}>💬</span>
          </div>
          <span className="brand-text">PepTalk</span>
        </a>
      </div>

      <nav className="sidebar-nav">
        <button
          onClick={() => onNavigate('chat')}
          className={`nav-link-btn ${currentView === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={18} />
          <span>AI Chat</span>
        </button>

        <button
          onClick={() => onNavigate('knowledge')}
          className={`nav-link-btn ${currentView === 'knowledge' || currentView === 'compound_detail' ? 'active' : ''}`}
        >
          <Dna size={18} />
          <span>Knowledge Base</span>
          <span className="nav-badge-pill">{compoundCount}</span>
        </button>

        <button
          onClick={() => onNavigate('protocols')}
          className={`nav-link-btn ${currentView === 'protocols' || currentView === 'protocol_detail' ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Protocols</span>
        </button>

        <button
          onClick={() => onNavigate('classroom')}
          className={`nav-link-btn ${currentView === 'classroom' || currentView === 'course_viewer' ? 'active' : ''}`}
        >
          <GraduationCap size={18} />
          <span>Classroom</span>
          <span className="nav-badge-pill">{courseCount}</span>
        </button>

        <button
          onClick={() => onNavigate('calculator')}
          className={`nav-link-btn ${currentView === 'calculator' ? 'active' : ''}`}
        >
          <Droplet size={18} />
          <span>Calculator</span>
        </button>

        <button
          onClick={() => onNavigate('research')}
          className={`nav-link-btn ${currentView === 'research' ? 'active' : ''}`}
        >
          <BookOpen size={18} />
          <span>Research</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={onOpenApiKey}
          className="nav-link-btn"
          style={{ padding: '0.65rem 0.85rem' }}
        >
          <KeyRound size={17} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.88rem' }}>Gemini API Key</span>
        </button>

        <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: '#F8F9FD', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-teal)' }}></span>
            <span>Local Clinical DB Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
