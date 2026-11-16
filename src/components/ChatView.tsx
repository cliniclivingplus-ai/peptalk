'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Compound, Protocol, Course } from '@/types';
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
  resetTrigger?: number;
}

const CHAT_STORAGE_KEY = 'peptalk_ai_chat_history_v2';

export default function ChatView({
  apiKey,
  onOpenApiKey,
  initialPrompt,
  onClearInitialPrompt,
  resetTrigger = 0,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore saved chats from localStorage on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved chat history:', e);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  // Handle external reset trigger (e.g. from Sidebar New Chat button)
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setMessages([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [resetTrigger]);

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
    // Immediate scroll + slight timeout to accommodate layout expansion
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

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
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

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history for backend route
      const historyPayload = messages.slice(-6).map((m) => ({
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
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content: `### Clinical Engine Communication Error\n\n${err.message || 'Network connection failed.'}\n\nPlease check your internet connection or verify your Gemini API key in settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-layout-root">
      {/* Pinned Top Bar: Always visible, never scrolls away */}
      <div className="chat-top-session-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
            {messages.length > 0 ? `Clinical Consultation (${messages.length} messages)` : 'Clinical Consultation Session'}
          </span>
          {apiKey ? (
            <span className="badge-tag" style={{ background: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', fontSize: '0.74rem' }}>
              <CheckCircle2 size={12} style={{ marginRight: '4px', display: 'inline' }} />
              API Key Active
            </span>
          ) : (
            <button
              onClick={onOpenApiKey}
              className="badge-tag"
              style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FCD34D', fontSize: '0.74rem', cursor: 'pointer' }}
            >
              <Key size={12} style={{ marginRight: '4px', display: 'inline' }} />
              Add Gemini Key
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleClearChat}
          className="btn btn-outline"
          style={{
            fontSize: '0.82rem',
            padding: '0.35rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 700,
            background: '#FFFFFF',
          }}
        >
          <RotateCcw size={14} />
          <span>+ New Chat</span>
        </button>
      </div>

      {/* Smooth Scrollable Message Stream */}
      <div className="chat-messages-scroll" ref={scrollContainerRef}>
        <div className="chat-messages-inner">
          {/* Welcome Screen when no messages */}
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 1rem 2rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                <Sparkles size={32} />
              </div>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem', letterSpacing: '-0.025em' }}>
                PepTalk Clinical Intelligence
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Instant RAG synthesis across <strong>690 monographs</strong>, <strong>vetted protocols</strong>, <strong>75 masterclasses</strong>, and published pharmacology research.
              </p>

              {!apiKey && (
                <div style={{ marginBottom: '2rem' }}>
                  <button
                    onClick={onOpenApiKey}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.75rem 1.4rem' }}
                  >
                    <Key size={16} />
                    <span>Enter Free Gemini API Key to Start</span>
                  </button>
                </div>
              )}

              {/* Starter Prompt Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                <div
                  className="compound-item-card"
                  style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => handleSendMessage('What is the standard clinical titration schedule, GI tolerance rules, and administration guidelines for Semaglutide (Ozempic)?')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    <Syringe size={16} style={{ color: 'var(--primary)' }} />
                    <span>Semaglutide / Ozempic Protocol</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.5 }}>
                    Exact 4-week titration ladder, GI tolerability increments, and maintenance targets from clinical literature.
                  </p>
                </div>

                <div
                  className="compound-item-card"
                  style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => handleSendMessage('Explain the Retatrutide (GLP-3RT) protocol: triple agonist mechanism, starting dosage, and titration rules.')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                    <span>Retatrutide (GLP-3RT) Triple Agonist</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.5 }}>
                    GLP-1/GIP/GCGR mechanism, step-by-step titration ladder, and reconstitution matrix from the vetted protocol.
                  </p>
                </div>

                <div
                  className="compound-item-card"
                  style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => handleSendMessage('What is the clinical breakdown for BPC-157 and TB-500 in tissue healing, tendon repair, and Wolverine Stack cycling?')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                    <span>BPC-157 & TB-500 Tissue Repair</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.5 }}>
                    Cell migration mechanisms, angiogenesis, synergistic recovery protocols, and masterclass insights.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Chat Message Stream
            messages.map((m) => (
              <div
                key={m.id}
                className="chat-bubble-animated"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: m.role === 'user' ? '82%' : '100%',
                  width: m.role === 'user' ? 'auto' : '100%',
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Bot size={20} />
                  </div>
                )}

                <div
                  style={{
                    background: m.role === 'user' ? 'var(--primary)' : '#FFFFFF',
                    color: m.role === 'user' ? '#FFFFFF' : '#1E293B',
                    padding: m.role === 'user' ? '0.95rem 1.35rem' : '1.35rem 1.65rem',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-card)',
                    border: m.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    lineHeight: 1.65,
                    fontSize: '0.94rem',
                    flex: 1,
                  }}
                >
                  {m.role === 'user' ? (
                    <div style={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>{m.content}</div>
                  ) : (
                    <div>
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
            ))
          )}

          {/* Thinking / Streaming Indicator */}
          {isLoading && (
            <div className="chat-bubble-animated" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={20} />
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.95rem 1.4rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-card)' }}>
                <span className="animate-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                  Synthesizing clinical monograph data & protocols ({loadingSeconds}s)...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} style={{ height: '8px' }} />
        </div>
      </div>

      {/* Sticky Bottom Input Bar: Always pinned at bottom, never scrolls out of view */}
      <footer className="chat-input-sticky-footer">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="chat-input-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={apiKey ? "Ask PepTalk about compounds, dosing protocols, masterclasses, or reconstitution math..." : "Please enter your Gemini API key above to start research..."}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1.05rem 1.35rem',
              paddingRight: '3.75rem',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              outline: 'none',
              fontSize: '0.95rem',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
              color: '#0F172A',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: input.trim() ? 'var(--primary)' : '#E2E8F0',
              color: input.trim() ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}
