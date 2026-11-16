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
  Plus,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenApiKey: () => void;
  onNewChat?: () => void;
  apiKey?: string;
  compoundCount: number;
  courseCount: number;
}

export default function Sidebar({
  currentView,
  onNavigate,
  onOpenApiKey,
  onNewChat,
  apiKey = '',
  compoundCount,
  courseCount,
}: SidebarProps) {
  const isKeyActive = !!apiKey.trim();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onNavigate('chat'); }} 
          className="brand-logo"
        >
          <div className="brand-icon-box">
            <MessageSquare size={18} color="#FFFFFF" strokeWidth={2.5} />
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

        {/* Dedicated "+ New Chat" Button in Sidebar */}
        <button
          onClick={() => {
            onNavigate('chat');
            if (onNewChat) onNewChat();
          }}
          className="btn btn-primary"
          style={{
            margin: '0.4rem 0.25rem 0.85rem 0.25rem',
            padding: '0.65rem 0.9rem',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            borderRadius: '12px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(127, 102, 255, 0.25)',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Chat</span>
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
          style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.86rem' }}>Gemini API Key</span>
          </div>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isKeyActive ? 'var(--accent-teal)' : '#F59E0B',
            }}
          />
        </button>

        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#F8F9FD', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-teal)' }}></span>
            <span>Clinical Library Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
