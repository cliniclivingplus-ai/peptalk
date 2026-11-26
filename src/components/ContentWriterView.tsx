'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Users,
  Wand2,
  BookOpen,
  AlertCircle,
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import ClinicalMarkdown from './ClinicalMarkdown';

interface ContentWriterViewProps {
  apiKey: string;
  onOpenApiKey: () => void;
}

interface StudioEntry {
  id: string;
  kind: 'draft' | 'refinement' | 'chat_user' | 'chat_ai';
  versionNumber?: number;
  prompt?: string;
  content: string;
  sources?: string[];
  format?: string;
  timestamp: string;
}

interface StudioProject {
  id: string;
  title: string;
  idea: string;
  format: string;
  audience: string;
  tone: string;
  entries: StudioEntry[];
  updatedAt: number;
}

const STORAGE_KEY = 'peptalk_content_studio_projects_v1';

const CONTENT_FORMATS = [
  'Blog / Educational Article',
  'Instagram / LinkedIn Post',
  'YouTube / Reel / Short Script',
  'Carousel Slides',
  'Patient Education Sheet',
  'Newsletter / Email',
];

const TARGET_AUDIENCES = [
  'Patients & General Public',
  'Physicians & Clinicians',
  'Fitness & Longevity Enthusiasts',
  'Clinic Social Media Followers',
];

const TONE_OPTIONS = [
  'Clear, Engaging & Trustworthy',
  'Authoritative & Clinical',
  'Warm, Empathetic & Simple',
  'Scroll-Stopping & Conversational',
];

const STARTER_IDEAS = [
  'Explain how BPC-157 supports tendon and gut recovery, including what human vs animal evidence actually shows',
  'Compare Semaglutide, Tirzepatide, and Retatrutide in simple language for patients considering weight loss therapy',
  'Why bloodwork (IGF-1, fasting insulin, HbA1c) matters before starting CJC-1295 / Ipamorelin',
  'Myth vs Fact about GHK-Cu copper peptide for skin rejuvenation and collagen synthesis',
];

function createEmptyProject(): StudioProject {
  return {
    id: `proj_${Date.now()}`,
    title: 'Untitled Draft',
    idea: '',
    format: CONTENT_FORMATS[0],
    audience: TARGET_AUDIENCES[0],
    tone: TONE_OPTIONS[0],
    entries: [],
    updatedAt: Date.now(),
  };
}

export default function ContentWriterView({ apiKey, onOpenApiKey }: ContentWriterViewProps) {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [followUpText, setFollowUpText] = useState('');
  const [followUpMode, setFollowUpMode] = useState<'refine' | 'chat'>('refine');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectTitle, setEditingProjectTitle] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load saved projects from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          setActiveProjectId(parsed[0].id);
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }
    const initial = createEmptyProject();
    setProjects([initial]);
    setActiveProjectId(initial.id);
  }, []);

  const persistProjects = (next: StudioProject[]) => {
    setProjects(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || createEmptyProject();

  const updateActiveProject = (patch: Partial<StudioProject>) => {
    const next = projects.map((p) =>
      p.id === activeProject.id ? { ...p, ...patch, updatedAt: Date.now() } : p
    );
    persistProjects(next);
  };

  const handleNewProject = () => {
    const fresh = createEmptyProject();
    persistProjects([fresh, ...projects]);
    setActiveProjectId(fresh.id);
    setError(null);
    setFollowUpText('');
  };

  const commitProjectRename = (id: string) => {
    const trimmed = editingProjectTitle.trim();
    if (trimmed) {
      const next = projects.map((p) =>
        p.id === id ? { ...p, title: trimmed, updatedAt: Date.now() } : p
      );
      persistProjects(next);
    }
    setEditingProjectId(null);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = projects.filter((p) => p.id !== id);
    if (remaining.length === 0) {
      const fresh = createEmptyProject();
      persistProjects([fresh]);
      setActiveProjectId(fresh.id);
    } else {
      persistProjects(remaining);
      if (activeProjectId === id) {
        setActiveProjectId(remaining[0].id);
      }
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 80);
  };

  const runAction = async (mode: 'generate' | 'refine' | 'chat') => {
    if (isLoading) return;
    if (mode === 'generate' && !activeProject.idea.trim()) return;
    if ((mode === 'refine' || mode === 'chat') && !followUpText.trim()) return;

    if (!apiKey) {
      onOpenApiKey();
      return;
    }

    setIsLoading(true);
    setError(null);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageToSend = mode === 'generate' ? '' : followUpText.trim();

    // Build history from existing entries in this project
    const historyPayload = activeProject.entries.map((entry) => ({
      role: entry.kind === 'chat_user' ? 'user' : 'assistant',
      content: entry.content,
    }));

    // If chat mode, immediately append the user's chat bubble so it feels responsive
    let workingEntries = [...activeProject.entries];
    if (mode === 'chat') {
      const userBubble: StudioEntry = {
        id: `entry_${Date.now()}_u`,
        kind: 'chat_user',
        content: messageToSend,
        timestamp: nowTime,
      };
      workingEntries = [...workingEntries, userBubble];
      updateActiveProject({ entries: workingEntries });
      setFollowUpText('');
      scrollToBottom();
    }

    try {
      const res = await fetch('/api/content-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: activeProject.idea.trim(),
          format: activeProject.format,
          audience: activeProject.audience,
          tone: activeProject.tone,
          mode,
          message: messageToSend,
          history: historyPayload,
          apiKey: apiKey && apiKey !== 'server_configured' ? apiKey.trim() : '',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.error === 'MISSING_API_KEY') onOpenApiKey();
        setError(data.message || 'Failed to generate response.');
        setIsLoading(false);
        return;
      }

      const existingVersions = workingEntries.filter(
        (e) => e.kind === 'draft' || e.kind === 'refinement'
      ).length;

      const newEntry: StudioEntry =
        mode === 'chat'
          ? {
              id: `entry_${Date.now()}_a`,
              kind: 'chat_ai',
              content: data.reply || '',
              sources: data.sources || [],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : {
              id: `entry_${Date.now()}_v`,
              kind: mode === 'generate' ? 'draft' : 'refinement',
              versionNumber: existingVersions + 1,
              prompt: mode === 'refine' ? messageToSend : undefined,
              format: activeProject.format,
              content: data.reply || '',
              sources: data.sources || [],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

      const nextTitle =
        activeProject.title === 'Untitled Draft' && activeProject.idea.trim()
          ? activeProject.idea.trim().slice(0, 38) + (activeProject.idea.trim().length > 38 ? '…' : '')
          : activeProject.title;

      updateActiveProject({
        title: nextTitle,
        entries: [...workingEntries, newEntry],
      });

      if (mode === 'refine') setFollowUpText('');
      scrollToBottom();
    } catch (err: any) {
      setError(err.message || 'Network error generating content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div className="page-header-row" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PenTool size={25} style={{ color: 'var(--primary)' }} />
            <span>Content Studio</span>
          </h1>
          <p className="page-subtitle">
            Drop in any rough idea — every draft, refinement, and chat reply is saved below so you can compare versions and polish until it&apos;s ready to publish.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewProject}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(127, 102, 255, 0.3)',
            background: '#F5F3FF',
            color: 'var(--primary)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          <span>New Draft</span>
        </button>
      </div>

      {/* Saved Projects Strip */}
      {projects.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            flexWrap: 'wrap',
            marginBottom: '1.15rem',
          }}
        >
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.2rem' }}>
            <Layers size={13} />
            Saved Drafts:
          </span>
          {projects.map((p) => {
            const isActive = p.id === activeProject.id;
            const isEditing = editingProjectId === p.id;
            const vCount = p.entries.filter((e) => e.kind === 'draft' || e.kind === 'refinement').length;
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isEditing) return;
                  setActiveProjectId(p.id);
                  setError(null);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.32rem 0.7rem',
                  borderRadius: '9999px',
                  border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: isActive ? '#F1EEFE' : '#FFFFFF',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '0.77rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editingProjectTitle}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingProjectTitle(e.target.value)}
                    onBlur={() => commitProjectRename(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitProjectRename(p.id);
                      if (e.key === 'Escape') setEditingProjectId(null);
                    }}
                    style={{
                      width: '130px',
                      fontSize: '0.76rem',
                      padding: '1px 5px',
                      borderRadius: '6px',
                      border: '1px solid var(--primary)',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: 'var(--text-main)',
                    }}
                  />
                ) : (
                  <span>{p.title}</span>
                )}
                {!isEditing && vCount > 0 && (
                  <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({vCount}v)</span>
                )}
                {isEditing ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      commitProjectRename(p.id);
                    }}
                    title="Save draft name"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <Check size={12} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProjectId(p.id);
                      setEditingProjectTitle(p.title);
                    }}
                    title="Rename draft"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      opacity: 0.65,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <Pencil size={11} />
                  </button>
                )}
                {!isEditing && projects.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(p.id, e)}
                    title="Delete draft"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      opacity: 0.65,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Input & Configuration Card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 12px rgba(17, 17, 22, 0.04)',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
          }}
        >
          What do you want to write about?
        </label>

        <textarea
          value={activeProject.idea}
          onChange={(e) => updateActiveProject({ idea: e.target.value })}
          rows={3}
          placeholder="Explain your idea in plain words... e.g., 'Write a 60-second Instagram reel explaining how MOTS-c works for mitochondrial energy in simple patient-friendly language.'"
          style={{
            width: '100%',
            padding: '0.9rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid var(--border)',
            fontSize: '0.93rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            background: '#FAF9FE',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />

        {/* Quick Starter Ideas */}
        {activeProject.entries.length === 0 && (
          <div style={{ marginTop: '0.7rem', marginBottom: '1.15rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
              Quick starter ideas:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {STARTER_IDEAS.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateActiveProject({ idea: starter })}
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    background: '#F5F3FF',
                    border: '1px solid #E4DEFF',
                    borderRadius: '9999px',
                    padding: '0.3rem 0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {starter.length > 68 ? starter.slice(0, 65) + '…' : starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Format, Audience, Tone Selectors */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.9rem',
            marginTop: '0.9rem',
            marginBottom: '1.2rem',
          }}
        >
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <FileText size={14} style={{ color: 'var(--primary)' }} />
              <span>Content Format</span>
            </label>
            <select
              value={activeProject.format}
              onChange={(e) => updateActiveProject({ format: e.target.value })}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', background: '#FFFFFF' }}
            >
              {CONTENT_FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <Users size={14} style={{ color: 'var(--primary)' }} />
              <span>Target Audience</span>
            </label>
            <select
              value={activeProject.audience}
              onChange={(e) => updateActiveProject({ audience: e.target.value })}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', background: '#FFFFFF' }}
            >
              {TARGET_AUDIENCES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <Wand2 size={14} style={{ color: 'var(--primary)' }} />
              <span>Tone &amp; Framing</span>
            </label>
            <select
              value={activeProject.tone}
              onChange={(e) => updateActiveProject({ tone: e.target.value })}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', background: '#FFFFFF' }}
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Every new draft or refinement is saved below — earlier versions are never overwritten.
          </span>

          <button
            type="button"
            disabled={!activeProject.idea.trim() || isLoading}
            onClick={() => runAction('generate')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.72rem 1.4rem',
              borderRadius: '11px',
              background: !activeProject.idea.trim() || isLoading
                ? '#C4B5FD'
                : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: !activeProject.idea.trim() || isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 18px rgba(127, 102, 255, 0.28)',
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spin-slow" />
                <span>Researching &amp; Writing...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{activeProject.entries.length > 0 ? 'Generate Another Version' : 'Generate Content'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.1rem',
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            fontSize: '0.86rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Stacked Version History & Chat Thread */}
      {activeProject.entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {activeProject.entries.map((entry) => {
            // User chat bubble
            if (entry.kind === 'chat_user') {
              return (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      maxWidth: '78%',
                      background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                      color: '#FFFFFF',
                      borderRadius: '14px 14px 4px 14px',
                      padding: '0.85rem 1.15rem',
                      fontSize: '0.9rem',
                      lineHeight: 1.55,
                      boxShadow: '0 4px 14px rgba(127, 102, 255, 0.2)',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.25rem', fontWeight: 600 }}>
                      You · {entry.timestamp}
                    </div>
                    <div>{entry.content}</div>
                  </div>
                </div>
              );
            }

            // AI chat reply bubble
            if (entry.kind === 'chat_ai') {
              return (
                <div
                  key={entry.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #DDD6FE',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(17, 17, 22, 0.04)',
                  }}
                >
                  <div
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: '#F5F3FF',
                      borderBottom: '1px solid #EAE6FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                      <MessageSquare size={14} />
                      <span>Content Studio Chat · {entry.timestamp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(entry.id, entry.content)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.28rem 0.65rem',
                        borderRadius: '7px',
                        border: 'none',
                        background: copiedId === entry.id ? '#059669' : '#FFFFFF',
                        color: copiedId === entry.id ? '#FFFFFF' : 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedId === entry.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId === entry.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div style={{ padding: '1.15rem 1.35rem' }}>
                    <ClinicalMarkdown content={entry.content} />
                  </div>
                </div>
              );
            }

            // Full Version Card (Initial Draft or Refinement)
            const isCollapsed = !!collapsedIds[entry.id];
            return (
              <div
                key={entry.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 18px rgba(17, 17, 22, 0.05)',
                }}
              >
                {/* Version Header */}
                <div
                  style={{
                    padding: '0.85rem 1.4rem',
                    background: '#FAF9FE',
                    borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                      }}
                    >
                      Version {entry.versionNumber}
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {entry.kind === 'refinement' ? 'Refined Draft' : 'Generated Draft'} · {entry.format || activeProject.format}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {entry.timestamp}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(entry.id, entry.content)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.38rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: copiedId === entry.id ? '#059669' : 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedId === entry.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedId === entry.id ? 'Copied!' : 'Copy Version'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCollapse(entry.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.38rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: '#FFFFFF',
                        color: 'var(--text-secondary)',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
                    </button>
                  </div>
                </div>

                {/* Refinement instruction banner */}
                {!isCollapsed && entry.prompt && (
                  <div
                    style={{
                      padding: '0.6rem 1.4rem',
                      background: '#F5F3FF',
                      borderBottom: '1px solid #EAE6FE',
                      fontSize: '0.8rem',
                      color: '#4C1D95',
                    }}
                  >
                    <strong>Refinement applied:</strong> &ldquo;{entry.prompt}&rdquo;
                  </div>
                )}

                {/* Sources strip */}
                {!isCollapsed && entry.sources && entry.sources.length > 0 && (
                  <div
                    style={{
                      padding: '0.6rem 1.4rem',
                      background: '#F8FAFC',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <BookOpen size={13} style={{ color: 'var(--primary)' }} />
                    <strong style={{ color: 'var(--text-secondary)' }}>Sources:</strong>
                    {entry.sources.map((src, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          padding: '0.12rem 0.45rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Markdown Body */}
                {!isCollapsed && (
                  <div style={{ padding: '1.4rem 1.65rem' }}>
                    <ClinicalMarkdown content={entry.content} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Refine & Chat Bar (appears once at least 1 draft exists) */}
      {activeProject.entries.length > 0 && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(127, 102, 255, 0.28)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            boxShadow: '0 6px 24px rgba(127, 102, 255, 0.1)',
          }}
        >
          {/* Mode Switcher: Refine vs Chat */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFollowUpMode('refine')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.38rem',
                padding: '0.38rem 0.85rem',
                borderRadius: '9999px',
                border: followUpMode === 'refine' ? 'none' : '1px solid var(--border)',
                background: followUpMode === 'refine' ? 'var(--primary)' : '#F8FAFC',
                color: followUpMode === 'refine' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={13} />
              <span>Refine (New Version Below)</span>
            </button>

            <button
              type="button"
              onClick={() => setFollowUpMode('chat')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.38rem',
                padding: '0.38rem 0.85rem',
                borderRadius: '9999px',
                border: followUpMode === 'chat' ? 'none' : '1px solid var(--border)',
                background: followUpMode === 'chat' ? 'var(--primary)' : '#F8FAFC',
                color: followUpMode === 'chat' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={13} />
              <span>Chat About This Draft</span>
            </button>

            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {followUpMode === 'refine'
                ? 'Creates a new numbered version below while keeping all previous versions'
                : 'Ask questions, brainstorm hooks, or check medical phrasing back-and-forth'}
            </span>
          </div>

          {/* Input + Send */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <input
              type="text"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && followUpText.trim() && !isLoading) {
                  runAction(followUpMode);
                }
              }}
              placeholder={
                followUpMode === 'refine'
                  ? "Describe how to refine the script... e.g. 'Make it 45 seconds, punchier hook, simpler medical terms'"
                  : "Chat about this draft... e.g. 'Is it safe to say BPC-157 heals tendons?' or 'Give me 5 more hooks'"
              }
              style={{
                flex: 1,
                padding: '0.72rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '0.88rem',
                background: '#FAF9FE',
                outline: 'none',
              }}
            />

            <button
              type="button"
              disabled={!followUpText.trim() || isLoading}
              onClick={() => runAction(followUpMode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.72rem 1.2rem',
                borderRadius: '10px',
                border: 'none',
                background: !followUpText.trim() || isLoading
                  ? '#C4B5FD'
                  : 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: !followUpText.trim() || isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? <RefreshCw size={14} className="spin-slow" /> : <Send size={14} />}
              <span>{followUpMode === 'refine' ? 'Create New Version' : 'Send'}</span>
            </button>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
