'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Compound, Protocol, Course, ChatSession } from '@/types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Syringe,
  TrendingUp,
  Key,
  RotateCcw,
  CheckCircle2,
  Plus,
  MessageSquare,
  Clock,
} from 'lucide-react';
import ClinicalMarkdown from './ClinicalMarkdown';

interface ChatViewProps {
  apiKey: string;
  onOpenApiKey: () => void;
  compounds: Compound[];
  protocols: Protocol[];
  courses: Course[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  activeSession: ChatSession | null;
  onUpdateSession: (session: ChatSession) => void;
  onNewChat?: () => void;
}

export default function ChatView({
  apiKey,
  onOpenApiKey,
  initialPrompt,
  onClearInitialPrompt,
  activeSession,
  onUpdateSession,
  onNewChat,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(activeSession?.messages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync messages whenever activeSession switches
  useEffect(() => {
    setMessages(activeSession?.messages || []);
  }, [activeSession?.id]);

  // Auto-resize textarea to fit multi-line paragraphs up to max-height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 220);
      textareaRef.current.style.height = `${Math.max(newHeight, 52)}px`;
    }
  }, [input]);

  // Loading seconds timer for visibility and speed awareness
  useEffect(() => {
    if (isLoading) {
      setLoadingSeconds(0);
      timerRef.current = setInterval(() => {
        setLoadingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  // Smooth scroll down whenever messages change or loading state toggles
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    scrollToBottom();
    const t = setTimeout(scrollToBottom, 80);
    return () => clearTimeout(t);
  }, [messages, isLoading]);

  // Handle incoming initialPrompt from outside views (e.g. "Ask AI About Compound")
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleClearCurrentChat = () => {
    if (!activeSession) return;
    const clearedSession: ChatSession = {
      ...activeSession,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now(),
    };
    setMessages([]);
    onUpdateSession(clearedSession);
  };

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    if (!apiKey) {
      onOpenApiKey();
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    // Auto-title session if it was previously untitled or default
    let sessionTitle = activeSession?.title || 'New Conversation';
    if (!activeSession?.messages || activeSession.messages.length === 0 || sessionTitle === 'New Conversation') {
      sessionTitle = text.slice(0, 36).replace(/\n/g, ' ').trim();
      if (text.length > 36) sessionTitle += '...';
    }

    // Persist user turn immediately into session
    if (activeSession) {
      onUpdateSession({
        ...activeSession,
        title: sessionTitle,
        messages: nextMessages,
        updatedAt: Date.now(),
      });
    }

    try {
      // Build history payload for backend route
      const historyPayload = nextMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        if (data.error === 'MISSING_API_KEY') {
          onOpenApiKey();
          return;
        }

        throw new Error(data.message || `Server returned error (${response.status})`);
      }

      // Successful assistant reply
      const assistantMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: Array.isArray(data.sources) ? data.sources.map((s: any) => s.title || s) : [],
        thoughts: data.thoughts,
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);

      if (activeSession) {
        onUpdateSession({
          ...activeSession,
          title: sessionTitle,
          messages: finalMessages,
          updatedAt: Date.now(),
        });
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: `### Clinical Engine Communication Error\n\n${err.message || 'Network connection failed.'}\n\nPlease check your internet connection or verify your Gemini API key in settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const withErrorMessages = [...nextMessages, errorMsg];
      setMessages(withErrorMessages);

      if (activeSession) {
        onUpdateSession({
          ...activeSession,
          title: sessionTitle,
          messages: withErrorMessages,
          updatedAt: Date.now(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      handleSendMessage(input);
    }
  };

  return (
    <div className="chat-layout-root">
      {/* Top Session Header Bar */}
      <header className="chat-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
          <MessageSquare size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeSession?.title || 'New Conversation'}
          </span>
          {messages.length > 0 && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ({messages.length} messages)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {messages.length > 0 && (
            <button
              onClick={handleClearCurrentChat}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              title="Clear messages in this conversation"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}

          {onNewChat && (
            <button
              onClick={onNewChat}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>New Chat</span>
            </button>
          )}
        </div>
      </header>

      {/* Smooth Scrollable Message Stream */}
      <div className="chat-messages-scroll" ref={scrollContainerRef}>
        <div className="chat-messages-inner">
          {/* Welcome Screen when no messages in active conversation */}
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 1rem 2rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                <Sparkles size={32} />
              </div>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem', letterSpacing: '-0.025em' }}>
                PepTalk Clinical Intelligence
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Instant RAG synthesis across <strong>699 monographs</strong>, <strong>17 vetted protocols</strong>, <strong>75 masterclasses</strong>, and published pharmacology research.
              </p>

              {!apiKey && (
                <div style={{ marginBottom: '2rem' }}>
                  <button onClick={onOpenApiKey} className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.94rem' }}>
                    <Key size={18} />
                    <span>Connect Gemini API Key</span>
                  </button>
                </div>
              )}

              {/* Clinical Quick Starters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem', width: '100%', maxWidth: '780px' }}>
                {[
                  {
                    title: 'Retatrutide Protocol',
                    desc: 'Dosing titration, GI mitigation & cycle schedule',
                    prompt: 'What is the exact clinical titration schedule and cycle protocol for Retatrutide (GLP-3RT)?',
                    icon: <Syringe size={18} color="var(--primary)" />,
                  },
                  {
                    title: 'Wolverine Stack Guidance',
                    desc: 'BPC-157 + TB-500 synergy & reconstitution ratios',
                    prompt: 'How do you reconstitute and dose the Wolverine Stack (BPC-157 + TB-500) for tendon and tissue repair?',
                    icon: <TrendingUp size={18} color="#10B981" />,
                  },
                  {
                    title: 'H. Pylori Eradication Protocol',
                    desc: 'Antimicrobial peptides & mucosal restoration',
                    prompt: 'What peptides are studied for H. Pylori and gut mucosal restoration, and how are they phased?',
                    icon: <CheckCircle2 size={18} color="#F59E0B" />,
                  },
                  {
                    title: 'CJC & Ipamorelin Pre-Labs',
                    desc: 'Essential baseline blood panel & off-cycle rules',
                    prompt: 'What bloodwork and lab tests should you do before starting CJC-1295 and Ipamorelin, and how long to wait before retesting?',
                    icon: <Clock size={18} color="#8B5CF6" />,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="compound-item-card"
                    style={{
                      padding: '1.15rem 1.25rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.16s ease',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                      {item.icon}
                      <strong style={{ fontSize: '0.94rem', color: '#0F172A' }}>{item.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1rem' }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {m.role === 'assistant' && (
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', boxShadow: '0 2px 8px rgba(127, 102, 255, 0.3)' }}>
                      <Bot size={20} />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: m.role === 'user' ? '0.95rem 1.35rem' : '1.45rem 1.65rem',
                      borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                      background: m.role === 'user' ? 'var(--primary)' : '#FFFFFF',
                      color: m.role === 'user' ? '#FFFFFF' : '#0F172A',
                      boxShadow: m.role === 'user' ? '0 2px 10px rgba(127, 102, 255, 0.22)' : '0 2px 12px rgba(0, 0, 0, 0.04)',
                      border: m.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    }}
                  >
                    {m.role === 'user' ? (
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {m.content}
                      </div>
                    ) : (
                      <div>
                        {/* Thinking accordion if model thoughts were captured */}
                        {m.thoughts && (
                          <details
                            style={{
                              marginBottom: '1rem',
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '0.6rem 0.85rem',
                            }}
                          >
                            <summary
                              style={{
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#475569',
                                userSelect: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>🧠 Clinical Reasoning & Intent Analysis</span>
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>(Click to view)</span>
                            </summary>
                            <div
                              style={{
                                marginTop: '0.65rem',
                                paddingTop: '0.65rem',
                                borderTop: '1px solid #E2E8F0',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.55,
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                color: '#475569',
                                maxHeight: '260px',
                                overflowY: 'auto',
                              }}
                            >
                              {m.thoughts}
                            </div>
                          </details>
                        )}

                        <ClinicalMarkdown content={m.content} />

                        {m.sources && m.sources.length > 0 && (
                          <div style={{ marginTop: '1.25rem', paddingTop: '0.9rem', borderTop: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 800, marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                              GROUNDED INTERNAL SOURCES:
                            </div>
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                              {m.sources.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="badge-tag"
                                  style={{
                                    fontSize: '0.74rem',
                                    padding: '0.2rem 0.6rem',
                                    background: '#F8FAFC',
                                    borderColor: '#CBD5E1',
                                    color: '#1E293B',
                                    fontWeight: 600,
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: m.role === 'user' ? 'rgba(255,255,255,0.75)' : '#94A3B8', marginTop: '0.6rem', textAlign: 'right' }}>
                      {m.timestamp}
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EAEAF2', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <User size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Real-time Loading Indicator with live timer */}
          {isLoading && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '1rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={20} />
              </div>
              <div style={{ padding: '1rem 1.4rem', borderRadius: '4px 18px 18px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s infinite' }} />
                  <span className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s infinite 0.2s' }} />
                  <span className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s infinite 0.4s' }} />
                </div>
                <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600 }}>
                  Synthesizing clinical monographs & protocols... ({loadingSeconds}s)
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} style={{ height: '4px' }} />
        </div>
      </div>

      {/* Floating Prompt Input Box */}
      <footer className="chat-input-sticky-footer">
        <form onSubmit={handleSubmit} className="chat-input-inner">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask PepTalk about compounds, dosing protocols, masterclasses, or reconstitution math... (Shift + Enter for new line)"
            style={{
              width: '100%',
              minHeight: '52px',
              maxHeight: '180px',
              padding: '0.95rem 3.6rem 0.95rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              outline: 'none',
              fontSize: '0.95rem',
              lineHeight: 1.55,
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
              color: '#0F172A',
              resize: 'none',
              fontFamily: 'inherit',
              overflowY: input.length > 120 ? 'auto' : 'hidden',
              display: 'block',
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              position: 'absolute',
              right: '9px',
              bottom: '8px',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: input.trim() && !isLoading ? 'var(--primary)' : '#E2E8F0',
              color: input.trim() && !isLoading ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            title="Send prompt (Enter)"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}
