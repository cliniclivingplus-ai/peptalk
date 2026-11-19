'use client';

import React, { useState, useEffect } from 'react';
import { ViewMode, Compound, Protocol, Course, ChatSession } from '@/types';
import { corePeptides, vaultItems, allCompounds } from '@/lib/data/compounds';
import { protocols } from '@/lib/data/protocols';
import { courses } from '@/lib/data/courses';
import { researchPapers } from '@/lib/data/research';
import { clinicalGuides } from '@/lib/data/guides';

import Sidebar from '@/components/Sidebar';
import ApiKeyModal from '@/components/ApiKeyModal';
import ChatView from '@/components/ChatView';
import KnowledgeBaseView from '@/components/KnowledgeBaseView';
import CompoundDetailView from '@/components/CompoundDetailView';
import ProtocolsView from '@/components/ProtocolsView';
import ProtocolDetailView from '@/components/ProtocolDetailView';
import ClassroomView from '@/components/ClassroomView';
import CourseReaderView from '@/components/CourseReaderView';
import CalculatorView from '@/components/CalculatorView';
import ResearchView from '@/components/ResearchView';

const SESSIONS_STORAGE_KEY = 'peptalk_ai_chat_sessions_v2';
const LEGACY_STORAGE_KEY = 'peptalk_ai_chat_history_v2';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [calcCompoundName, setCalcCompoundName] = useState<string>('');
  const [chatPrompt, setChatPrompt] = useState<string>('');

  // Multi-conversation Chat History State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);

  // Restore API key
  useEffect(() => {
    const raw = localStorage.getItem('peptalk_gemini_api_key') || localStorage.getItem('peppal_gemini_api_key') || '';
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
    if (cleaned) setApiKey(cleaned);
  }, []);

  // Restore & initialize saved chat sessions from localStorage
  useEffect(() => {
    try {
      const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (rawSessions) {
        const parsed = JSON.parse(rawSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }

      // Check legacy single-chat storage to migrate existing history
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacyMsgs = JSON.parse(legacyRaw);
        if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
          const firstUserMsg = legacyMsgs.find((m: any) => m.role === 'user');
          const title = firstUserMsg ? firstUserMsg.content.slice(0, 36) : 'Saved Chat';
          const migratedSession: ChatSession = {
            id: `session_${Date.now()}`,
            title,
            messages: legacyMsgs,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setChatSessions([migratedSession]);
          setActiveSessionId(migratedSession.id);
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([migratedSession]));
          return;
        }
      }

      // Default fresh session
      const freshSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChatSessions([freshSession]);
      setActiveSessionId(freshSession.id);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([freshSession]));
    } catch (e) {
      console.warn('Failed to initialize chat sessions:', e);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    const cleaned = key.trim().replace(/^['"]|['"]$/g, '');
    setApiKey(cleaned);
    localStorage.setItem('peptalk_gemini_api_key', cleaned);
    localStorage.setItem('peppal_gemini_api_key', cleaned);
  };

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
  };

  const handleSelectCompound = (c: Compound) => {
    setSelectedCompound(c);
    setCurrentView('compound_detail');
  };

  const handleSelectProtocol = (p: Protocol) => {
    setSelectedProtocol(p);
    setCurrentView('protocol_detail');
  };

  const handleSelectCourse = (c: Course) => {
    setSelectedCourse(c);
    setCurrentView('course_viewer');
  };

  const handleAskAiAboutCompound = (compoundName: string) => {
    setChatPrompt(`Provide a comprehensive clinical monograph for ${compoundName}: mechanism of action, evidence-based research contexts, dosing protocols, reconstitution instructions, and safety profile.`);
    setCurrentView('chat');
  };

  const handleOpenCalculator = (name?: string) => {
    if (name) setCalcCompoundName(name);
    setCurrentView('calculator');
  };

  // Chat Session Actions
  const handleNewChat = () => {
    // If active session is already empty, just switch to chat
    const current = chatSessions.find((s) => s.id === activeSessionId);
    if (current && current.messages.length === 0) {
      setCurrentView('chat');
      return;
    }

    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextSessions = [newSession, ...chatSessions];
    setChatSessions(nextSessions);
    setActiveSessionId(newSession.id);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
    } catch (e) {
      console.warn('Failed to save new chat session:', e);
    }
    setCurrentView('chat');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentView('chat');
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = chatSessions.filter((s) => s.id !== id);
    if (filtered.length === 0) {
      const fresh: ChatSession = {
        id: `session_${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChatSessions([fresh]);
      setActiveSessionId(fresh.id);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([fresh]));
    } else {
      setChatSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
    }
  };

  const handleUpdateActiveSession = (updatedSession: ChatSession) => {
    setChatSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedSession.id);
      let nextSessions: ChatSession[];
      if (idx !== -1) {
        nextSessions = [...prev];
        nextSessions[idx] = updatedSession;
      } else {
        nextSessions = [updatedSession, ...prev];
      }
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
      } catch (e) {
        console.warn('Failed to save updated chat session:', e);
      }
      return nextSessions;
    });
  };

  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0] || null;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onNewChat={handleNewChat}
        apiKey={apiKey}
        compoundCount={allCompounds.length}
        courseCount={courses.length}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      <main className="main-viewport">
        {/* Top Navbar: only displayed in reference/library views to keep AI Chat 100% immersive and distraction-free */}
        {currentView !== 'chat' && (
          <header className="top-navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {currentView === 'knowledge' && 'Peptide & Vault Monograph Library'}
                {currentView === 'compound_detail' && (selectedCompound?.name || 'Compound Monograph')}
                {currentView === 'protocols' && 'Vetted Clinical Protocols'}
                {currentView === 'protocol_detail' && (selectedProtocol?.name || 'Protocol Guidelines')}
                {currentView === 'classroom' && 'Masterclass Classroom'}
                {currentView === 'course_viewer' && (selectedCourse?.clean_title || selectedCourse?.title || 'Course Reader')}
                {currentView === 'calculator' && 'Reconstitution Syringe Calculator'}
                {currentView === 'research' && 'PubMed & Pharmacology Studies'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setIsApiKeyOpen(true)}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                <span>{apiKey ? 'Gemini Key Ready' : 'Add Gemini Key'}</span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: apiKey ? 'var(--accent-teal)' : '#F59E0B',
                  }}
                ></span>
              </button>
            </div>
          </header>
        )}

        {/* Dynamic View Body - Custom isolated viewport for chat with zero outer scroll */}
        <div className={currentView === 'chat' ? 'chat-viewport-container' : 'content-scrollable'}>
          {currentView === 'chat' && (
            <ChatView
              apiKey={apiKey}
              onOpenApiKey={() => setIsApiKeyOpen(true)}
              compounds={allCompounds}
              protocols={protocols}
              courses={courses}
              initialPrompt={chatPrompt}
              onClearInitialPrompt={() => setChatPrompt('')}
              activeSession={activeSession}
              onUpdateSession={handleUpdateActiveSession}
              onNewChat={handleNewChat}
            />
          )}

          {currentView === 'knowledge' && (
            <KnowledgeBaseView
              corePeptides={corePeptides}
              vaultItems={vaultItems}
              clinicalGuides={clinicalGuides}
              onSelectCompound={handleSelectCompound}
            />
          )}

          {currentView === 'compound_detail' && selectedCompound && (
            <CompoundDetailView
              compound={selectedCompound}
              onBack={() => setCurrentView('knowledge')}
              onAskAi={handleAskAiAboutCompound}
              onOpenCalculator={handleOpenCalculator}
              allPapers={researchPapers}
              allProtocols={protocols}
              onSelectProtocol={handleSelectProtocol}
            />
          )}

          {currentView === 'protocols' && (
            <ProtocolsView
              protocols={protocols}
              onSelectProtocol={handleSelectProtocol}
            />
          )}

          {currentView === 'protocol_detail' && selectedProtocol && (
            <ProtocolDetailView
              protocol={selectedProtocol}
              onBack={() => setCurrentView('protocols')}
              onOpenCalculator={() => handleOpenCalculator()}
            />
          )}

          {currentView === 'classroom' && (
            <ClassroomView
              courses={courses}
              onSelectCourse={handleSelectCourse}
            />
          )}

          {currentView === 'course_viewer' && selectedCourse && (
            <CourseReaderView
              course={selectedCourse}
              onBack={() => setCurrentView('classroom')}
            />
          )}

          {currentView === 'calculator' && (
            <CalculatorView initialCompoundName={calcCompoundName} />
          )}

          {currentView === 'research' && (
            <ResearchView papers={researchPapers} />
          )}
        </div>
      </main>

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}
