'use client';

import React, { useState, useEffect } from 'react';
import { ViewMode, KbTabType, Compound, Protocol, Course, ChatSession } from '@/types';
import { corePeptides, vaultItems, allCompounds } from '@/lib/data/compounds';
import { protocols } from '@/lib/data/protocols';
import { courses } from '@/lib/data/courses';
import { researchPapers } from '@/lib/data/research';
import { clinicalGuides } from '@/lib/data/guides';
import { extraInfoItems } from '@/lib/data/extraInfo';

import Sidebar from '@/components/Sidebar';
import ApiKeyModal from '@/components/ApiKeyModal';
import ChatView from '@/components/ChatView';
import KnowledgeBaseView from '@/components/KnowledgeBaseView';
import SupplementDetailView from '@/components/SupplementDetailView';
import ExtraInfoDetailView from '@/components/ExtraInfoDetailView';
import CompoundDetailView from '@/components/CompoundDetailView';
import ProtocolsView from '@/components/ProtocolsView';
import ProtocolDetailView from '@/components/ProtocolDetailView';
import ClassroomView from '@/components/ClassroomView';
import CourseReaderView from '@/components/CourseReaderView';
import CalculatorView from '@/components/CalculatorView';
import CompareView from '@/components/CompareView';
import ResearchView from '@/components/ResearchView';
import ContentWriterView from '@/components/ContentWriterView';
import LoginView from '@/components/LoginView';
import AdminPortalModal from '@/components/AdminPortalModal';
import ContentProtection from '@/components/ContentProtection';
import { MessageSquare, LogOut, UserCheck, Dna, PanelLeftOpen } from 'lucide-react';

const SESSIONS_STORAGE_KEY = 'peptalk_ai_chat_sessions_v2';
const LEGACY_STORAGE_KEY = 'peptalk_ai_chat_history_v2';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<{ email: string; domain: string } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const [kbActiveTab, setKbActiveTab] = useState<KbTabType>('core');
  const [kbCategory, setKbCategory] = useState<string>('All');
  const [kbSearch, setKbSearch] = useState<string>('');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile viewport so sidebar behaves as a clean slide-over drawer on phones
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Sync browser Back / Forward buttons (window.history) with in-app navigation
  const pushHistory = (state: {
    view: ViewMode;
    kbTab?: KbTabType;
    compoundId?: string | null;
    protocolId?: string | null;
    courseId?: string | null;
  }) => {
    if (typeof window === 'undefined') return;
    try {
      const hash =
        state.view === 'compound_detail' && state.compoundId
          ? `#compound/${encodeURIComponent(state.compoundId)}`
          : state.view === 'protocol_detail' && state.protocolId
          ? `#protocol/${encodeURIComponent(state.protocolId)}`
          : state.view === 'course_viewer' && state.courseId
          ? `#course/${encodeURIComponent(state.courseId)}`
          : state.view === 'knowledge' && state.kbTab
          ? `#knowledge/${state.kbTab}`
          : `#${state.view}`;
      window.history.pushState(state, '', hash);
    } catch {
      // Ignore history errors
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Seed initial history entry
    if (!window.history.state?.view) {
      window.history.replaceState({ view: 'chat', kbTab: 'core' }, '', '#chat');
    }

    const onPopState = (e: PopStateEvent) => {
      const st = e.state;
      if (!st || !st.view) {
        setCurrentView('chat');
        return;
      }
      if (st.kbTab) setKbActiveTab(st.kbTab);
      if (st.view === 'compound_detail' && st.compoundId) {
        const found =
          allCompounds.find((c) => (c.id || c.name) === st.compoundId) ||
          clinicalGuides.find((c) => (c.id || c.name) === st.compoundId) ||
          extraInfoItems.find((c) => (c.id || c.name) === st.compoundId) ||
          null;
        if (found) setSelectedCompound(found);
      } else if (st.view === 'protocol_detail' && st.protocolId) {
        const found = protocols.find((p) => p.id === st.protocolId) || null;
        if (found) setSelectedProtocol(found);
      } else if (st.view === 'course_viewer' && st.courseId) {
        const found = courses.find((c) => c.id === st.courseId) || null;
        if (found) setSelectedCourse(found);
      }
      setCurrentView(st.view);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const trackActivity = (action: string, detail: string) => {
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, detail }),
    }).catch(() => {});
  };

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    if (isMobile) setIsSidebarOpen(false);
    pushHistory({ view, kbTab: kbActiveTab });
    trackActivity('page_view', `Opened ${view}`);
  };

  const handleKbTabChange = (tab: KbTabType) => {
    setKbActiveTab(tab);
    pushHistory({ view: 'knowledge', kbTab: tab });
  };

  const handleSelectCompound = (c: Compound) => {
    setSelectedCompound(c);
    setCurrentView('compound_detail');
    pushHistory({ view: 'compound_detail', kbTab: kbActiveTab, compoundId: c.id || c.name });
    trackActivity('compound_view', `${c.name} (${c.category})`);
  };

  const handleSelectProtocol = (p: Protocol) => {
    setSelectedProtocol(p);
    setCurrentView('protocol_detail');
    pushHistory({ view: 'protocol_detail', protocolId: p.id });
    trackActivity('protocol_view', p.name);
  };

  const handleSelectCourse = (c: Course) => {
    setSelectedCourse(c);
    setCurrentView('course_viewer');
    pushHistory({ view: 'course_viewer', courseId: c.id });
    trackActivity('course_view', c.clean_title || c.title);
  };

  const handleAskAiAboutCompound = (compoundName: string) => {
    setChatPrompt(`Provide a comprehensive clinical monograph for ${compoundName}: mechanism of action, evidence-based research contexts, dosing protocols, reconstitution instructions, and safety profile.`);
    setCurrentView('chat');
    pushHistory({ view: 'chat' });
  };

  const handleOpenCalculator = (name?: string) => {
    if (name) setCalcCompoundName(name);
    setCurrentView('calculator');
    pushHistory({ view: 'calculator' });
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

  const handleRenameSession = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setChatSessions((prev) => {
      const nextSessions = prev.map((s) =>
        s.id === id ? { ...s, title: trimmed, updatedAt: Date.now() } : s
      );
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
      } catch (e) {
        console.warn('Failed to save renamed chat session:', e);
      }
      return nextSessions;
    });
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
    <div style={{ display: 'flex', width: '100vw', height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      <ContentProtection userEmail={currentUser.email} />
      {isMobile && isSidebarOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {isSidebarOpen && (
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenApiKey={() => setIsApiKeyOpen(true)}
          onNewChat={handleNewChat}
          onCollapse={() => setIsSidebarOpen(false)}
          apiKey={effectiveApiKey}
          compoundCount={allCompounds.length}
          courseCount={courses.length}
          chatSessions={chatSessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            handleSelectSession(id);
            if (isMobile) setIsSidebarOpen(false);
          }}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAdmin={() => {
            setIsAdminOpen(true);
            if (isMobile) setIsSidebarOpen(false);
          }}
        />
      )}

      <main className="main-viewport" style={{ position: 'relative' }}>
        {/* Top Navbar: only displayed in reference/library views to keep AI Chat 100% immersive and distraction-free */}
        {currentView !== 'chat' && (
          <header className="top-navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {!isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Open sidebar"
                  aria-label="Open sidebar"
                  style={{
                    background: '#F5F3FF',
                    border: '1px solid #DDD6FE',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <PanelLeftOpen size={16} />
                  <span>Menu</span>
                </button>
              )}
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {currentView === 'knowledge' && 'Peptide & Vault Monograph Library'}
                {currentView === 'compound_detail' && (selectedCompound?.name || 'Compound Monograph')}
                {currentView === 'protocols' && 'Vetted Clinical Protocols'}
                {currentView === 'protocol_detail' && (selectedProtocol?.name || 'Protocol Guidelines')}
                {currentView === 'classroom' && 'Masterclass Classroom'}
                {currentView === 'course_viewer' && (selectedCourse?.clean_title || selectedCourse?.title || 'Course Reader')}
                {currentView === 'calculator' && 'Reconstitution Syringe Calculator'}
                {currentView === 'compare' && 'Side-by-Side Compound Comparison'}
                {currentView === 'research' && 'PubMed & Pharmacology Studies'}
                {currentView === 'content_writer' && 'Content Studio'}
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
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          )}

          {currentView === 'knowledge' && (
            <KnowledgeBaseView
              corePeptides={corePeptides}
              vaultItems={vaultItems}
              clinicalGuides={clinicalGuides}
              extraInfoItems={extraInfoItems}
              activeTab={kbActiveTab}
              onTabChange={handleKbTabChange}
              category={kbCategory}
              onCategoryChange={setKbCategory}
              search={kbSearch}
              onSearchChange={setKbSearch}
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
            ) : selectedCompound.kind === 'extra_info' ? (
              <ExtraInfoDetailView
                item={selectedCompound}
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

          {currentView === 'compare' && (
            <CompareView
              compounds={allCompounds}
              onSelectCompound={handleSelectCompound}
              onAskAiCompare={(names) => {
                setChatPrompt(`Provide a detailed clinical side-by-side comparison of ${names.join(' vs ')}: mechanisms of action, efficacy, dosing protocols, half-life, ideal patient profiles, and key safety differences.`);
                setCurrentView('chat');
                pushHistory({ view: 'chat' });
              }}
            />
          )}

          {currentView === 'research' && (
            <ResearchView papers={researchPapers} />
          )}

          {currentView === 'content_writer' && (
            <ContentWriterView
              apiKey={effectiveApiKey}
              onOpenApiKey={() => setIsApiKeyOpen(true)}
            />
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
