'use client';

import React, { useState } from 'react';
import { ViewMode, ChatSession } from '@/types';
import { 
  MessageSquare, 
  Dna, 
  FileText, 
  GraduationCap, 
  Droplet, 
  BookOpen, 
  PenTool,
  Plus,
  KeyRound,
  Trash2,
  Pencil,
  Check,
  LogOut,
  UserCheck,
  ShieldAlert,
  PanelLeftClose
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenApiKey?: () => void;
  onNewChat?: () => void;
  onCollapse?: () => void;
  apiKey?: string;
  compoundCount: number;
  courseCount: number;
  chatSessions?: ChatSession[];
  activeSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string, e: React.MouseEvent) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  currentUser?: { email: string; domain: string } | null;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  onOpenApiKey,
  onNewChat,
  onCollapse,
  apiKey = '',
  compoundCount,
  courseCount,
  chatSessions = [],
  activeSessionId = null,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  currentUser = null,
  onLogout,
  onOpenAdmin,
}: SidebarProps) {
  const isKeyActive = !!apiKey.trim();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatTitle, setEditingChatTitle] = useState<string>('');

  const commitChatRename = (id: string) => {
    const trimmed = editingChatTitle.trim();
    if (trimmed && onRenameSession) {
      onRenameSession(id, trimmed);
    }
    setEditingChatId(null);
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onNavigate('chat'); }} 
          className="brand-logo"
        >
          <div className="brand-icon-box">
            <Dna size={18} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <span className="brand-text">PepTalk</span>
        </a>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            title="Close sidebar"
            aria-label="Close sidebar"
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '8px',
              padding: '5px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F1EEFE';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <PanelLeftClose size={17} />
          </button>
        )}
      </div>

      {/* 1. FIXED TOP NAVIGATION: Always stays at the top of the sidebar */}
      <nav className="sidebar-top-nav" style={{ padding: '0.25rem 0.65rem 0.35rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.12rem', flexShrink: 0 }}>
        <button
          onClick={() => onNavigate('chat')}
          className={`nav-link-btn ${currentView === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={16} />
          <span>AI Chat</span>
        </button>

        <button
          onClick={() => onNavigate('knowledge')}
          className={`nav-link-btn ${currentView === 'knowledge' || currentView === 'compound_detail' ? 'active' : ''}`}
        >
          <Dna size={16} />
          <span>Knowledge Base</span>
          <span className="nav-badge-pill">{compoundCount}</span>
        </button>

        <button
          onClick={() => onNavigate('protocols')}
          className={`nav-link-btn ${currentView === 'protocols' || currentView === 'protocol_detail' ? 'active' : ''}`}
        >
          <FileText size={16} />
          <span>Protocols</span>
        </button>

        <button
          onClick={() => onNavigate('classroom')}
          className={`nav-link-btn ${currentView === 'classroom' || currentView === 'course_viewer' ? 'active' : ''}`}
        >
          <GraduationCap size={16} />
          <span>Classroom</span>
          <span className="nav-badge-pill">{courseCount}</span>
        </button>

        <button
          onClick={() => onNavigate('calculator')}
          className={`nav-link-btn ${currentView === 'calculator' ? 'active' : ''}`}
        >
          <Droplet size={16} />
          <span>Calculator</span>
        </button>

        <button
          onClick={() => onNavigate('research')}
          className={`nav-link-btn ${currentView === 'research' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Research</span>
        </button>

        <button
          onClick={() => onNavigate('content_writer')}
          className={`nav-link-btn ${currentView === 'content_writer' ? 'active' : ''}`}
        >
          <PenTool size={16} />
          <span>Content Studio</span>
        </button>
      </nav>

      {/* Divider between fixed main nav and chat history */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0.85rem', flexShrink: 0 }} />

      {/* 2. CHAT HISTORY SECTION: Grows downwards into the remaining vertical space */}
      <div 
        className="sidebar-chat-section"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0.35rem 0.65rem',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Saved Chats List growing downwards */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="chat-history-label" style={{ padding: '0.15rem 0.35rem 0.35rem 0.35rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Saved Chats</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{chatSessions?.length || 0}</span>
              {onNewChat && (
                <button
                  type="button"
                  onClick={() => {
                    onNewChat();
                    onNavigate('chat');
                  }}
                  title="New Conversation"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          <div 
            className="chat-history-list" 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              maxHeight: 'none',
              padding: '0.1rem 0'
            }}
          >
            {chatSessions && chatSessions.length > 0 ? (
              chatSessions.map((s) => {
                const isEditing = editingChatId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (isEditing) return;
                      if (onSelectSession) onSelectSession(s.id);
                      onNavigate('chat');
                    }}
                    className={`chat-history-item ${activeSessionId === s.id && currentView === 'chat' ? 'active' : ''}`}
                  >
                    <div className="chat-history-title-wrap" style={{ flex: 1, minWidth: 0 }}>
                      <MessageSquare size={12} style={{ flexShrink: 0, opacity: 0.7 }} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingChatTitle}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditingChatTitle(e.target.value)}
                          onBlur={() => commitChatRename(s.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitChatRename(s.id);
                            if (e.key === 'Escape') setEditingChatId(null);
                          }}
                          style={{
                            width: '100%',
                            fontSize: '0.76rem',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            border: '1px solid var(--primary)',
                            outline: 'none',
                            background: '#FFFFFF',
                            color: 'var(--text-main)',
                          }}
                        />
                      ) : (
                        <span className="chat-history-title-text" title={s.title}>
                          {s.title || 'New Conversation'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                      {isEditing ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            commitChatRename(s.id);
                          }}
                          title="Save name"
                          className="chat-history-delete-btn"
                          style={{ color: '#059669', opacity: 1 }}
                        >
                          <Check size={12} />
                        </button>
                      ) : (
                        onRenameSession && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChatId(s.id);
                              setEditingChatTitle(s.title || 'New Conversation');
                            }}
                            title="Rename chat"
                            className="chat-history-delete-btn"
                          >
                            <Pencil size={11} />
                          </button>
                        )
                      )}
                      {onDeleteSession && !isEditing && (
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
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '0.5rem 0.35rem', fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No saved chats yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOOTER: User info and API key */}
      <div className="sidebar-footer" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {currentUser && (
          <div style={{
            background: '#F8F9FD',
            border: '1px solid #EAEAF2',
            borderRadius: '9px',
            padding: '0.35rem 0.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.45rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#EAE6FE',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <UserCheck size={13} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }} title={currentUser.email}>
                  {currentUser.email.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                  @cliniclivingplus.com
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '3px',
                  borderRadius: '5px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        )}

        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="nav-link-btn"
            style={{
              padding: '0.42rem 0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--primary)',
              background: 'rgba(127, 102, 255, 0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(127, 102, 255, 0.18)',
              marginTop: '0.1rem'
            }}
          >
            <ShieldAlert size={15} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Admin Portal</span>
          </button>
        )}
      </div>
    </aside>
  );
}
