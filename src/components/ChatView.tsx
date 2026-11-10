'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Compound, Protocol, Course } from '@/types';
import { Send, Sparkles, Bot, User, ArrowRight } from 'lucide-react';

interface ChatViewProps {
  apiKey: string;
  onOpenApiKey: () => void;
  compounds: Compound[];
  protocols: Protocol[];
  courses: Course[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export default function ChatView({
  apiKey,
  onOpenApiKey,
  compounds,
  protocols,
  courses,
  initialPrompt,
  onClearInitialPrompt,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendPrompt(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Client-side RAG search
  const performRAGSearch = (query: string) => {
    const q = query.toLowerCase();
    const scoredDocs: { score: number; text: string; title: string }[] = [];

    // Search Compounds
    compounds.forEach((c) => {
      let score = 0;
      if (c.name.toLowerCase().includes(q)) score += 10;
      if (c.fullName && c.fullName.toLowerCase().includes(q)) score += 6;
      if (c.overview && c.overview.toLowerCase().includes(q)) score += 3;
      if (score > 0) {
        scoredDocs.push({
          score,
          title: c.name,
          text: `Compound: ${c.name} (${c.fullName || ''})\nCategory: ${c.category}\nOverview: ${c.overview || ''}\nMechanism: ${c.mechanism || ''}\nDosing: ${c.dosing || ''}`,
        });
      }
    });

    // Search Protocols
    protocols.forEach((p) => {
      let score = 0;
      if (p.name.toLowerCase().includes(q)) score += 9;
      if (p.instructions && p.instructions.toLowerCase().includes(q)) score += 4;
      if (score > 0) {
        scoredDocs.push({
          score,
          title: p.name,
          text: `Protocol: ${p.name}\nPrinciple: ${p.corePrinciple || ''}\nInstructions: ${p.instructions || ''}\nCycle: ${p.cycleInfo || ''}`,
        });
      }
    });

    // Search Courses
    courses.forEach((c) => {
      let score = 0;
      if (c.title.toLowerCase().includes(q)) score += 7;
      if (c.category.toLowerCase().includes(q)) score += 3;
      if (score > 0) {
        scoredDocs.push({
          score,
          title: c.clean_title || c.title,
          text: `Masterclass: ${c.clean_title || c.title}\nTopic: ${c.topic}\nLessons: ${(c.lessons || []).map((l) => l.clean_title || l.title).slice(0, 5).join(', ')}`,
        });
      }
    });

    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, 4);
  };

  const handleSendPrompt = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_' + Date.now(),
            role: 'assistant',
            content:
              '⚠️ A Google Gemini API key is required to answer clinical inquiries with the AI model. Click the button below to add your free Gemini API key.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      const relevantDocs = performRAGSearch(text);
      const contextStr = relevantDocs.map((d) => `### Source: ${d.title}\n${d.text}`).join('\n\n');

      const systemPrompt = `You are PepTalk, a high-precision clinical peptide intelligence assistant.
Answer the user's question accurately using the clinical knowledge base provided below. Always format responses clearly with markdown headings, bullet points, and clinical clarity. Maintain strict educational orientation.

RELEVANT CLINICAL SOURCES:
${contextStr || 'No direct matching source found in database. Answer with standard clinical peptide literature knowledge.'}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUSER QUESTION:\n${text}` }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      const json = await res.json();
      const reply =
        json.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I was unable to generate an answer at this time. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: relevantDocs.map((d) => d.title),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content: `Error communicating with Gemini API: ${err.message || 'Network error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.25rem' }}>
            <Sparkles size={32} />
          </div>
          <h1 className="editorial-title" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            How can PepTalk <span style={{ color: 'var(--primary)' }}>help your research?</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '580px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Evidence-based clinical intelligence across peptides, protocols, reconstitution ratios, and masterclass archives.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', width: '100%', maxWidth: '780px' }}>
            <div
              className="compound-item-card"
              style={{ padding: '1.25rem', textAlign: 'left' }}
              onClick={() => handleSendPrompt('How much BAC water for Tirzepatide (10mg)? Provide reconstitution math, syringe tick draw table, and titration schedule.')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <span>💉</span> <span>Tirzepatide BAC & Dosing</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Reconstitution volumes, syringe units, and 4-step titration ladder.
              </p>
            </div>

            <div
              className="compound-item-card"
              style={{ padding: '1.25rem', textAlign: 'left' }}
              onClick={() => handleSendPrompt('Explain the tissue repair synergy and dosing protocol for the BPC-157 and TB-500 Wolverine stack.')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <span>🧬</span> <span>Wolverine Stack Synergy</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                BPC-157 + TB-500 repair mechanisms and joint healing timelines.
              </p>
            </div>

            <div
              className="compound-item-card"
              style={{ padding: '1.25rem', textAlign: 'left' }}
              onClick={() => handleSendPrompt('What is the optimal dosing, reconstitution, and cycling schedule for GHK-Cu in skin and tissue remodeling?')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <span>✨</span> <span>GHK-Cu Copper Peptide</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Dosing guidelines, injection dilution, and sting minimization tips.
              </p>
            </div>

            <div
              className="compound-item-card"
              style={{ padding: '1.25rem', textAlign: 'left' }}
              onClick={() => handleSendPrompt('Provide a clinical breakdown of Retatrutide: triple receptor mechanism (GLP-1/GIP/GCGR) and optimal starting doses.')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <span>📈</span> <span>Retatrutide (GLP-3RT)</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Triple receptor activation profile and metabolic escalation rules.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: m.role === 'user' ? '80%' : '100%',
              }}
            >
              {m.role === 'assistant' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  background: m.role === 'user' ? 'var(--primary)' : '#FFFFFF',
                  color: m.role === 'user' ? '#FFFFFF' : 'var(--text-main)',
                  padding: '1.15rem 1.4rem',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-card)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  lineHeight: 1.65,
                  fontSize: '0.94rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
                {m.sources && m.sources.length > 0 && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>SOURCES:</span>
                    {m.sources.map((s, idx) => (
                      <span key={idx} className="badge-tag" style={{ fontSize: '0.72rem', padding: '0.1rem 0.5rem' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EAEAF2', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} />
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-pill-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                <span>Consulting clinical peptide database...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input row */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        {!apiKey && (
          <div style={{ padding: '0.55rem 1rem', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', fontSize: '0.84rem', color: '#92400E', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Add a Google Gemini API Key to enable AI responses.</span>
            <button onClick={onOpenApiKey} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Set Key →</button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PepTalk about compounds, dosing, reconstitution math, or protocols..."
            style={{
              flex: 1,
              padding: '0.95rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              background: '#FFFFFF',
              fontSize: '0.94rem',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn btn-primary"
            style={{ borderRadius: '16px', padding: '0.95rem 1.4rem' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
