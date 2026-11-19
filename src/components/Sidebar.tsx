'use client';

import React from 'react';
import { ViewMode, ChatSession } from '@/types';
import { 
  MessageSquare, 
  Dna, 
  FileText, 
  GraduationCap, 
  Droplet, 
  BookOpen, 
  Plus,
  KeyRound,
  Trash2
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenApiKey: () => void;
  onNewChat?: () => void;
  apiKey?: string;
  compoundCount: number;
  courseCount: number;
  chatSessions?: ChatSession[];
  activeSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string, e: React.MouseEvent) => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  onOpenApiKey,
  onNewChat,
  apiKey = '',
  compoundCount,
  courseCount,
  chatSessions = [],
  activeSessionId = null,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  const isKeyActive = !!apiKey.trim();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
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

      {/* 1. FIXED TOP NAVIGATION: Always stays at the top of the sidebar */}
      <nav className="sidebar-top-nav" style={{ padding: '0.4rem 0.85rem 0.5rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', flexShrink: 0 }}>
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

      {/* Divider between fixed main nav and chat history */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0.35rem 1rem', flexShrink: 0 }} />

      {/* 2. CHAT HISTORY SECTION: Grows downwards into the remaining vertical space */}
      <div 
        className="sidebar-chat-section"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0.5rem 0.85rem',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* "+ New Chat" Dedicated Button */}
        <button
          onClick={() => {
            if (onNewChat) onNewChat();
            onNavigate('chat');
          }}
          className="btn btn-primary"
          style={{
            margin: '0.1rem 0.15rem 0.65rem 0.15rem',
            padding: '0.6rem 0.85rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            borderRadius: '11px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(127, 102, 255, 0.22)',
            flexShrink: 0
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Chat</span>
        </button>

        {/* Saved Chats List growing downwards */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="chat-history-label" style={{ padding: '0.2rem 0.4rem', flexShrink: 0 }}>
            <span>Saved Chats</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{chatSessions?.length || 0}</span>
          </div>

          <div 
            className="chat-history-list" 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              maxHeight: 'none',
              padding: '0.2rem 0'
            }}
          >
            {chatSessions && chatSessions.length > 0 ? (
              chatSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    if (onSelectSession) onSelectSession(s.id);
                    onNavigate('chat');
                  }}
                  className={`chat-history-item ${activeSessionId === s.id && currentView === 'chat' ? 'active' : ''}`}
                >
                  <div className="chat-history-title-wrap">
                    <MessageSquare size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                    <span className="chat-history-title-text" title={s.title}>
                      {s.title || 'New Conversation'}
                    </span>
                  </div>
                  {onDeleteSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id, e);
                      }}
                      title="Delete chat"
                      className="chat-history-delete-btn"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No saved chats yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOOTER: Fixed at bottom */}
      <div className="sidebar-footer" style={{ flexShrink: 0 }}>
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
      </div>
    </aside>
  );
}
