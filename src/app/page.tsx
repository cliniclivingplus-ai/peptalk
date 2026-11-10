'use client';

import React, { useState, useEffect } from 'react';
import { ViewMode, Compound, Protocol, Course } from '@/types';
import { corePeptides, vaultItems, allCompounds } from '@/lib/data/compounds';
import { protocols } from '@/lib/data/protocols';
import { courses } from '@/lib/data/courses';
import { researchPapers } from '@/lib/data/research';

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

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [calcCompoundName, setCalcCompoundName] = useState<string>('');
  const [chatPrompt, setChatPrompt] = useState<string>('');

  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('peptalk_gemini_api_key') || localStorage.getItem('peppal_gemini_api_key') || '';
    if (saved) setApiKey(saved);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('peptalk_gemini_api_key', key);
    localStorage.setItem('peppal_gemini_api_key', key);
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

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        compoundCount={allCompounds.length}
        courseCount={courses.length}
      />

      <main className="main-viewport">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {currentView === 'chat' && 'AI Clinical Chat'}
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
              <span>{apiKey ? 'API Key Active' : 'Set Gemini API Key'}</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: apiKey ? 'var(--accent-teal)' : '#F59E0B' }}></span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="content-scrollable">
          {currentView === 'chat' && (
            <ChatView
              apiKey={apiKey}
              onOpenApiKey={() => setIsApiKeyOpen(true)}
              compounds={allCompounds}
              protocols={protocols}
              courses={courses}
              initialPrompt={chatPrompt}
              onClearInitialPrompt={() => setChatPrompt('')}
            />
          )}

          {currentView === 'knowledge' && (
            <KnowledgeBaseView
              corePeptides={corePeptides}
              vaultItems={vaultItems}
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
