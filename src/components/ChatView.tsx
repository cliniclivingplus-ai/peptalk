'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Compound, Protocol, Course } from '@/types';
import { Send, Sparkles, Bot, User, ArrowRight, Syringe, Dna, TrendingUp, AlertTriangle, Key } from 'lucide-react';

interface ChatViewProps {
  apiKey: string;
  onOpenApiKey: () => void;
  compounds: Compound[];
  protocols: Protocol[];
  courses: Course[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const COMMON_ALIASES: Record<string, string> = {
  ozempic: 'semaglutide',
  wegovy: 'semaglutide',
  rybelsus: 'semaglutide',
  mounjaro: 'tirzepatide',
  zepbound: 'tirzepatide',
};

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

  // Client-side RAG search with multi-word tokenization and alias expansion
  const performRAGSearch = (query: string) => {
    const rawTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const stopWords = new Set(['what', 'will', 'the', 'dose', 'dosing', 'for', 'with', 'and', 'how', 'much', 'about', 'from', 'this', 'that', 'yrs', 'old', 'dose', 'tell']);
    const meaningfulTokens = rawTokens.filter((t) => !stopWords.has(t));

    const expandedTokens = [...meaningfulTokens];
    meaningfulTokens.forEach((t) => {
      if (COMMON_ALIASES[t]) expandedTokens.push(COMMON_ALIASES[t]);
    });

    const scoredDocs: { score: number; text: string; title: string }[] = [];

    // Search Compounds
    compounds.forEach((c) => {
      let score = 0;
      const cName = c.name.toLowerCase();
      const cFull = (c.fullName || '').toLowerCase();
      const cBody = (c.overview || c.mechanism || c.dosing || '').toLowerCase();

      if (cName.includes(query.toLowerCase())) score += 20;

      expandedTokens.forEach((token) => {
        if (cName.includes(token)) score += 10;
        else if (cFull.includes(token)) score += 6;
        else if (cBody.includes(token)) score += 2;
      });

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
      const pName = p.name.toLowerCase();
      const pBody = (p.instructions || p.corePrinciple || '').toLowerCase();

      if (pName.includes(query.toLowerCase())) score += 15;

      expandedTokens.forEach((token) => {
        if (pName.includes(token)) score += 8;
        else if (pBody.includes(token)) score += 3;
      });

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
      const title = (c.clean_title || c.title || '').toLowerCase();
      if (title.includes(query.toLowerCase())) score += 10;

      expandedTokens.forEach((token) => {
        if (title.includes(token)) score += 5;
      });

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

    const cleanKey = apiKey.trim().replace(/^['"]|['"]$/g, '');

    if (!cleanKey) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_' + Date.now(),
            role: 'assistant',
            content:
              'A Google Gemini API key is required to query the clinical peptide intelligence assistant. Click the button below to add or verify your free Gemini API key.',
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

      const systemPrompt = `You are PepTalk, a high-precision educational clinical peptide and pharmacology intelligence assistant.
Answer the user's question accurately using clinical pharmacology literature, published clinical trials, and the PepTalk knowledge base provided below.
Provide clear clinical pharmacology explanations, published titration schedules (e.g. for GLP-1 receptor agonists like Semaglutide/Ozempic or Tirzepatide, cite standard clinical literature protocols: starting at 0.25 mg subcutaneously once weekly for 4 weeks to assess GI tolerability, escalating to 0.5 mg weekly, with maintenance increments up to 1.0 mg or 2.0 mg as documented in prescribing references), reconstitution math, and safety monitoring markers.
Maintain strict educational orientation and note that all dosing is educational reference derived from published clinical literature.
Format responses cleanly using markdown headings, bullet points, and clinical clarity.

RELEVANT CLINICAL SOURCES:
${contextStr || 'No direct matching source found in database. Answer with standard clinical peptide and pharmacology literature knowledge.'}`;

      // 1. Dynamic model discovery with robust fallbacks
      const defaultModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-pro'];
      let modelsToTry = [...defaultModels];

      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
        const listData = await listRes.json();
        if (listData.models && Array.isArray(listData.models)) {
          const discovered = listData.models
            .filter((m: any) => {
              if (!m.supportedGenerationMethods?.includes('generateContent')) return false;
              const name = (m.name || '').toLowerCase();
              // Exclude audio, tts, embedding, vision-only, or image generation models
              if (name.includes('tts') || name.includes('audio') || name.includes('embed') || name.includes('image')) return false;
              return true;
            })
            .map((m: any) => m.name.replace(/^models\//, ''));

          if (discovered.length > 0) {
            const priority = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-pro'];
            modelsToTry = discovered.sort((a: string, b: string) => {
              const idxA = priority.indexOf(a);
              const idxB = priority.indexOf(b);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return 0;
            });
          }
        } else if (listData.error) {
          const errMsg = listData.error.message || 'Key verification failed';
          if (
            errMsg.toLowerCase().includes('api key not valid') ||
            errMsg.toLowerCase().includes('api_key_invalid') ||
            errMsg.toLowerCase().includes('key not found')
          ) {
            throw new Error(`Invalid Gemini API Key: ${errMsg}. Please click "Gemini API Key" in the menu to verify or generate a free key at https://aistudio.google.com/app/apikey.`);
          }
        }
      } catch (listErr: any) {
        if (listErr.message?.startsWith('Invalid Gemini API Key:')) {
          throw listErr;
        }
      }

      // Limit execution to top 3 candidate text models
      const modelsToExecute = modelsToTry.slice(0, 3);
      const errorsCollected: string[] = [];
      let reply = '';

      for (const model of modelsToExecute) {
        const apiVersions = ['v1beta', 'v1'];
        let modelSuccess = false;

        for (const apiVer of apiVersions) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${cleanKey}`,
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
                  safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                  ],
                  generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1500,
                  },
                }),
              }
            );

            const json = await res.json();

            if (!res.ok || json.error) {
              const errMsg = json.error?.message || `HTTP ${res.status}`;
              const isKeyError =
                errMsg.toLowerCase().includes('api key not valid') ||
                errMsg.toLowerCase().includes('api_key_invalid') ||
                errMsg.toLowerCase().includes('key not found') ||
                errMsg.toLowerCase().includes('forbidden');

              if (isKeyError) {
                throw new Error(`Google Gemini Error: API key issue (${errMsg}). Please click "Gemini API Key" in the menu to verify your key or obtain a free key at https://aistudio.google.com/app/apikey.`);
              }
              if (json.error?.status === 'RESOURCE_EXHAUSTED' || res.status === 429) {
                errorsCollected.push(`[${model} (${apiVer})]: Rate limit exceeded (${errMsg})`);
                break;
              }
              errorsCollected.push(`[${model} (${apiVer})]: ${errMsg}`);
              continue;
            }

            if (
              json.candidates?.[0]?.finishReason === 'SAFETY' ||
              json.promptFeedback?.blockReason === 'SAFETY'
            ) {
              errorsCollected.push(`[${model}]: Response restricted by Google safety filters. Please ask in educational terms.`);
              break;
            }

            const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              reply = candidateText;
              modelSuccess = true;
              break;
            }
          } catch (fetchErr: any) {
            if (fetchErr.message?.startsWith('Google Gemini Error:')) throw fetchErr;
            errorsCollected.push(`[${model} (${apiVer})]: ${fetchErr.message}`);
          }
        }

        if (modelSuccess) break;
      }

      if (!reply) {
        reply = `Google Gemini Error: Unable to complete request across candidate models (${modelsToExecute.join(', ')}).\n\nDetails:\n` + errorsCollected.map((e) => `• ${e}`).join('\n');
      }

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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.65rem' }}>
            What would you like to research?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Search across 690 monographs, 75 masterclasses, and vetted clinical protocols with AI-powered synthesis.
          </p>

          {!apiKey && (
            <div style={{ marginBottom: '2rem' }}>
              <button onClick={onOpenApiKey} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF' }}>
                <Key size={16} />
                <span>Configure Free Gemini API Key</span>
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', width: '100%', maxWidth: '780px' }}>
            <div
              className="compound-item-card"
              style={{ padding: '1.25rem', textAlign: 'left' }}
              onClick={() => handleSendPrompt('What is the standard clinical titration schedule and administration protocol for Semaglutide (Ozempic)?')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <Syringe size={16} style={{ color: 'var(--primary)' }} />
                <span>Semaglutide / Ozempic</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Standard clinical trial titration schedule, GI tolerance rules, and dosing steps.
              </p>
            </div>

            <div
              className="compound-item-card"
              style={{ padding: '1.25rem', textAlign: 'left' }}
              onClick={() => handleSendPrompt('What is the optimal dosing, reconstitution, and cycling schedule for GHK-Cu in skin and tissue remodeling?')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span>GHK-Cu Copper Peptide</span>
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
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                <span>Retatrutide (GLP-3RT)</span>
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
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Consulting clinical monograph library...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(input); }} style={{ padding: '1rem 0' }}>
        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PepTalk about compounds, dosing, reconstitution math, or protocols..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '1rem 1.25rem',
              paddingRight: '3.5rem',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              outline: 'none',
              fontSize: '0.94rem',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
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
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: input.trim() ? 'var(--primary)' : '#EAEAF2',
              color: input.trim() ? '#FFFFFF' : 'var(--text-muted)',
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
        </div>
      </form>
    </div>
  );
}
