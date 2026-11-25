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
import SupplementDetailView from '@/components/SupplementDetailView';
import CompoundDetailView from '@/components/CompoundDetailView';
import ProtocolsView from '@/components/ProtocolsView';
import ProtocolDetailView from '@/components/ProtocolDetailView';
import ClassroomView from '@/components/ClassroomView';
import CourseReaderView from '@/components/CourseReaderView';
import CalculatorView from '@/components/CalculatorView';
import ResearchView from '@/components/ResearchView';
import LoginView from '@/components/LoginView';
import AdminPortalModal from '@/components/AdminPortalModal';
import { MessageSquare, LogOut, UserCheck, Dna } from 'lucide-react';

const SESSIONS_STORAGE_KEY = 'peptalk_ai_chat_sessions_v2';
const LEGACY_STORAGE_KEY = 'peptalk_ai_chat_history_v2';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<{ email: string; domain: string } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

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
  const [hasServerKey, setHasServerKey] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Check auth status on initial load
  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch((err) => {
        console.warn('Could not verify auth status:', err);
        setCurrentUser(null);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setCurrentUser(null);
  };

  // Restore client-side API key from localStorage and check if server environment has GEMINI_API_KEY
  useEffect(() => {
    const raw = localStorage.getItem('peptalk_gemini_api_key') || localStorage.getItem('peppal_gemini_api_key') || '';
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
    if (cleaned) setApiKey(cleaned);

    fetch('/api/chat')
      .then((res) => res.json())
      .then((data) => {
        if (data?.hasServerKey) {
          setHasServerKey(true);
        }
      })
      .catch((err) => console.warn('Could not verify server API key status:', err));
  }, []);

  const isKeyActive = !!apiKey.trim() || hasServerKey;
  const effectiveApiKey = apiKey || (hasServerKey ? 'server_configured' : '');

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

  if (isAuthChecking) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF9FE',
        gap: '1rem',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #7F66FF 0%, #583EDB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          boxShadow: '0 8px 24px rgba(127, 102, 255, 0.35)'
        }}>
          <Dna size={28} color="#FFFFFF" strokeWidth={2.2} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#5E6070', fontSize: '0.92rem', fontWeight: 600 }}>
          <div className="spin-slow" style={{ width: '16px', height: '16px', border: '2.5px solid #7F66FF', borderTopColor: 'transparent', borderRadius: '50%' }} />
          <span>Authenticating ClinicLivingPlus Access...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0] || null;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onNewChat={handleNewChat}
        apiKey={effectiveApiKey}
        compoundCount={allCompounds.length}
        courseCount={courses.length}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
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
              {currentUser && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#F1EEFE',
                  border: '1px solid #D8D1FC',
                  borderRadius: '20px',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--primary)'
                }}>
                  <UserCheck size={13} />
                  <span>{currentUser.email}</span>
                </div>
              )}


            </div>
          </header>
        )}

        {/* Dynamic View Body - Custom isolated viewport for chat with zero outer scroll */}
        <div className={currentView === 'chat' ? 'chat-viewport-container' : 'content-scrollable'}>
          {currentView === 'chat' && (
            <ChatView
              apiKey={effectiveApiKey}
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
            selectedCompound.kind === 'supplement' ? (
              <SupplementDetailView
                supplement={selectedCompound}
                onBack={() => setCurrentView('knowledge')}
                onAskAi={handleAskAiAboutCompound}
              />
            ) : (
              <CompoundDetailView
                compound={selectedCompound}
                onBack={() => setCurrentView('knowledge')}
                onAskAi={handleAskAiAboutCompound}
                onOpenCalculator={handleOpenCalculator}
                allPapers={researchPapers}
                allProtocols={protocols}
                onSelectProtocol={handleSelectProtocol}
              />
            )
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

      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        geminiKey={apiKey}
        hasServerKey={hasServerKey}
        onSaveGeminiKey={handleSaveApiKey}
      />
    </div>
  );
}
