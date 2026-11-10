/**
 * PepTalk Client Application Engine
 * Implements exact visual matching for Research, Protocols, Knowledge Base, Calculator,
 * and the Google Gemini-Powered AI Chat with local RAG retrieval across all 707 records.
 */

(function () {
  'use strict';

  const data = window.PEPPAL_DATA || {
    corePeptides: [],
    vaultEntries: [],
    protocols: [],
    researchPapers: [],
    guides: []
  };

  const vaultByKind = {
    peptide: data.vaultEntries.filter(e => e.kind === 'peptide'),
    supplement: data.vaultEntries.filter(e => e.kind === 'supplement'),
    cosmetic: data.vaultEntries.filter(e => e.kind === 'cosmetic'),
    goal: data.vaultEntries.filter(e => e.kind === 'goal')
  };

  const state = {
    currentView: 'chat', // 'chat', 'knowledge', 'research', 'protocols', 'protocol_detail', 'compound_detail', 'calculator', 'classroom', 'course_viewer'
    activeKbTab: 'core',
    kbSearch: '',
    kbCategory: 'All',
    researchSearch: '',
    researchCompound: 'All',
    researchCategory: 'All',
    classroomSearch: '',
    classroomCategory: 'All',
    activeProtocol: null,
    activeCompound: null,
    activeCourse: null,
    geminiApiKey: localStorage.getItem('peptalk_gemini_api_key') || localStorage.getItem('peppal_gemini_api_key') || '',
    activeChatId: null,
    chats: JSON.parse(localStorage.getItem('peptalk_saved_chats') || localStorage.getItem('peppal_saved_chats') || '[]')
  };

  // Expose global navigation
  window.navigateTo = function (view, param) {
    state.currentView = view;

    // Toggle main views
    document.getElementById('view-chat').style.display = view === 'chat' ? 'flex' : 'none';
    document.getElementById('view-knowledge').style.display = view === 'knowledge' ? 'block' : 'none';
    document.getElementById('view-research').style.display = view === 'research' ? 'block' : 'none';
    document.getElementById('view-protocols').style.display = view === 'protocols' ? 'block' : 'none';
    document.getElementById('view-protocol-detail').style.display = view === 'protocol_detail' ? 'block' : 'none';
    document.getElementById('view-compound-detail').style.display = view === 'compound_detail' ? 'block' : 'none';
    document.getElementById('view-calculator').style.display = view === 'calculator' ? 'block' : 'none';
    document.getElementById('view-classroom').style.display = view === 'classroom' ? 'block' : 'none';
    document.getElementById('view-course-viewer').style.display = view === 'course_viewer' ? 'block' : 'none';

    // Update sidebar active links
    document.querySelectorAll('.sub-nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-today')?.classList.toggle('active', view === 'chat');
    document.getElementById('nav-classroom')?.classList.toggle('active', view === 'classroom' || view === 'course_viewer');
    if (view === 'knowledge' || view === 'compound_detail') document.getElementById('subnav-knowledge')?.classList.add('active');
    if (view === 'research') document.getElementById('subnav-research')?.classList.add('active');
    if (view === 'protocols' || view === 'protocol_detail') document.getElementById('subnav-protocols')?.classList.add('active');

    // Scroll to top
    document.getElementById('mainContainer').scrollTop = 0;

    if (view === 'research') renderResearch();
    if (view === 'protocols') renderProtocolsGrid();
    if (view === 'protocol_detail' && param) loadProtocolDetail(param);
    if (view === 'compound_detail' && param) loadCompoundDetail(param);
    if (view === 'knowledge') renderKbCards();
    if (view === 'classroom') renderClassroom();
    if (view === 'course_viewer' && param) loadCourseViewer(param);
  };

  window.askAiAboutCompound = function (compoundName) {
    navigateTo('chat');
    const input = document.getElementById('chatInput');
    input.value = `Provide a comprehensive clinical monograph for ${compoundName}: mechanism of action, evidence-based research contexts, dosing protocols, reconstitution instructions, and safety profile.`;
    handleSendMessage();
  };

  window.navigateToCompound = function (name) {
    navigateTo('compound_detail', name);
  };

  // =========================================================================
  // 1. CHAT & RAG ENGINE (Powered by Google Gemini API)
  // =========================================================================

  window.openApiKeyModal = function () {
    const modal = document.getElementById('apiKeyModal');
    const input = document.getElementById('geminiApiKeyInput');
    input.value = state.geminiApiKey;
    modal.style.display = 'flex';
    input.focus();
  };

  window.closeApiKeyModal = function () {
    document.getElementById('apiKeyModal').style.display = 'none';
  };

  window.saveApiKey = function () {
    const val = document.getElementById('geminiApiKeyInput').value.trim();
    state.geminiApiKey = val;
    localStorage.setItem('peptalk_gemini_api_key', val);
    localStorage.setItem('peppal_gemini_api_key', val);
    closeApiKeyModal();
    alert(val ? 'Gemini API Key saved successfully!' : 'API Key cleared.');
  };

  window.autoGrowTextarea = function (el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  window.startNewChat = function () {
    state.activeChatId = 'chat_' + Date.now();
    navigateTo('chat');
    document.getElementById('chatMessagesArea').innerHTML = `
      <div id="chatWelcomeScreen" style="margin: auto 0; text-align: center; max-width: 680px; align-self: center; padding: 2rem 0;">
        <div class="welcome-hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v7.31"></path>
            <path d="M14 9.3V2"></path>
            <path d="M8.5 2h7"></path>
            <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
            <path d="M5.52 16h12.96"></path>
          </svg>
        </div>
        <h2 class="editorial-title" style="font-size: 2.35rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.6rem;">How can PepTalk <span style="color: var(--primary);">help you today?</span></h2>
        <p style="color: var(--text-secondary); font-size: 0.98rem; margin-bottom: 2.25rem; line-height: 1.6;">
          Ask questions about mechanisms, titration protocols, reconstitution math, safety profiles, or bloodwork interactions.
        </p>

        <!-- Prompt Starters -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; text-align: left;">
          <div class="compound-item-card" onclick="sendPromptFromCard('How much BAC water for Tirzepatide (10mg, 15mg, 20mg)? Provide reconstitution math, syringe tick draw table, 4-step titration ladder, and safety profile.')" style="padding: 1.15rem; cursor: pointer;">
            <strong style="color: var(--text-main); font-size: 0.92rem; display: flex; align-items: center; gap: 0.4rem;"><span>💉</span> <span>Tirzepatide BAC & Dosing</span></strong>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.45;">Reconstitution volumes, syringe units, titration & decision rules</p>
          </div>
          <div class="compound-item-card" onclick="sendPromptFromCard('What is the exact titration schedule, core clinical principle, and 4 decision rules for Retatrutide (GLP-3RT)?')" style="padding: 1.15rem; cursor: pointer;">
            <strong style="color: var(--text-main); font-size: 0.92rem; display: flex; align-items: center; gap: 0.4rem;"><span>📈</span> <span>Retatrutide Titration</span></strong>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.45;">Titration ladder, decision rules & side effect triage</p>
          </div>
          <div class="compound-item-card" onclick="sendPromptFromCard('Explain the mechanism, dosing and tissue repair synergy between BPC-157 and TB-500 Wolverine stack.')" style="padding: 1.15rem; cursor: pointer;">
            <strong style="color: var(--text-main); font-size: 0.92rem; display: flex; align-items: center; gap: 0.4rem;"><span>🩹</span> <span>Wolverine Stack</span></strong>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.45;">BPC-157 + TB-500 synergy, dosing & reconstitution</p>
          </div>
          <div class="compound-item-card" onclick="sendPromptFromCard('What does SANA do, what are its mechanism claims, confidence rating, safety warnings, and expected bloodwork changes?')" style="padding: 1.15rem; cursor: pointer;">
            <strong style="color: var(--text-main); font-size: 0.92rem; display: flex; align-items: center; gap: 0.4rem;"><span>🔬</span> <span>SANA Vault Monograph</span></strong>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.45;">Salicylate / nitroalkene analysis & bloodwork risk</p>
          </div>
        </div>
      </div>
    `;
    document.getElementById('chatInput').value = '';
    document.getElementById('chatInput').focus();
  };

  window.sendPromptFromCard = function (text) {
    document.getElementById('chatInput').value = text;
    handleSendMessage();
  };

  // High-precision Local RAG Retrieval function
  function retrieveLocalKnowledge(query) {
    const q = query.toLowerCase().trim();
    const queryTokens = q.split(/[\s,/?!.-]+/).filter(w => w.length >= 3);
    const scoredMap = new Map();

    function addScoredDoc(key, item) {
      if (!scoredMap.has(key) || scoredMap.get(key).score < item.score) {
        scoredMap.set(key, item);
      }
    }

    // 1. Search Core Peptides (26 compounds)
    data.corePeptides.forEach(item => {
      let score = 0;
      const name = (item.name || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const aka = (item.fullName || '').toLowerCase();

      if (name && q.includes(name)) score += 100;
      else if (id && id.length >= 3 && q.includes(id)) score += 90;
      else if (aka && q.includes(aka)) score += 60;
      else if (queryTokens.some(t => name.includes(t) || id.includes(t))) score += 40;

      if (score > 0) {
        addScoredDoc(`core_${item.id || item.name}`, {
          type: 'Core Peptide Profile',
          name: item.name,
          score,
          text: `Compound: ${item.name} (${item.fullName || ''})\nCategory: ${item.category || 'General'}\nOverview: ${item.overview || ''}\nMechanism: ${item.mechanismOfAction || ''}\nDosing: ${item.dosing || item.dosageRanges || ''}\nReconstitution: ${JSON.stringify(item.reconstitution || {})}\nStorage: ${JSON.stringify(item.storage || {})}\nHalf-life: ${item.halfLife || item.halfLifeAndStability || ''}`
        });
      }
    });

    const hasCoreExactMatch = [...scoredMap.values()].some(d => d.score >= 90);

    // 2. Search Protocols (Strictly matching queried compound or protocol title)
    data.protocols.forEach(item => {
      let score = 0;
      const name = (item.name || '').toLowerCase().trim();
      const id = (item.id || '').toLowerCase().trim();

      // Only match if name or id has at least 3 characters and is present in query
      if (name.length >= 3 && q.includes(name)) {
        score += 120;
      } else if (id.length >= 3 && q.includes(id)) {
        score += 110;
      } else if (!hasCoreExactMatch && queryTokens.some(t => (name.length >= 3 && name.includes(t)) || (id.length >= 3 && id.includes(t)))) {
        score += 50;
      }

      if (score > 0) {
        addScoredDoc(`proto_${item.id || item.name}`, {
          type: 'Official Protocol Guide',
          name: item.name,
          score,
          text: `Protocol: ${item.name}\nSubtitle: ${item.subtitle || ''}\nCycle Structure: ${item.cycleInfo || ''}\nCore Principle: ${item.corePrinciple || ''}\nReconstitution: ${JSON.stringify(item.reconstitution || {})}\nDose Steps: ${JSON.stringify(item.doseSteps || [])}\nDecision Rules: ${JSON.stringify(item.decisionRules || [])}\nSide Effect Management: ${JSON.stringify(item.sideEffects || [])}\nTips: ${JSON.stringify(item.tips || [])}`
        });
      }
    });

    // 3. Search Vault Entries (664 compounds)
    data.vaultEntries.forEach(item => {
      let score = 0;
      const name = (item.name || '').toLowerCase().trim();
      const slug = (item.slug || '').toLowerCase().trim();
      const aka = (item.aka || '').toLowerCase().trim();

      if (name.length >= 3 && q.includes(name)) score += 95;
      else if (slug.length >= 3 && q.includes(slug)) score += 85;
      else if (aka.length >= 3 && q.includes(aka)) score += 50;
      else if (!hasCoreExactMatch && queryTokens.some(t => (name.length >= 3 && name === t) || (slug.length >= 3 && slug === t))) score += 40;

      if (score > 0) {
        addScoredDoc(`vault_${item.slug || item.name}`, {
          type: `Vault ${item.kind || 'Compound'}`,
          name: item.name,
          score,
          text: `Vault Entry: ${item.name} (${item.aka || ''})\nKind: ${item.kind}\nCategory: ${item.category}\nEvidence: ${item.evidence} (Confidence: ${item.confidence}/10)\nDose: ${item.dose}\nFull Monograph:\n${item.body}`
        });
      }
    });

    // 4. Search Classroom Courses (75 courses & 797 lessons)
    const courses = window.PEPTALK_COURSES || [];
    courses.forEach(c => {
      let score = 0;
      const title = (c.title || '').toLowerCase().trim();
      const topic = (c.topic || '').toLowerCase().trim();

      if (title.length >= 4 && q.includes(title)) score += 95;
      else if (queryTokens.some(t => t.length >= 4 && title.includes(t))) score += 40;

      const matchingLessons = (c.lessons || []).filter(l => {
        const lt = (l.title || '').toLowerCase();
        return queryTokens.some(t => t.length >= 4 && lt.includes(t));
      });
      if (matchingLessons.length > 0) score += 35;

      if (score > 0) {
        addScoredDoc(`course_${c.id || c.title}`, {
          type: 'Classroom Course',
          name: c.title,
          score,
          text: `Classroom Course: ${c.title}\nModule: ${c.topic}\nLesson Count: ${c.lesson_count}\nLesson Titles: ${(c.lessons || []).map(l => l.title).slice(0, 10).join('; ')}`
        });
      }
    });

    // Sort by score and take top 2 most relevant documents to maximize prompt speed
    const scored = [...scoredMap.values()];
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 2);
  }

  window.copyChatResponse = function (btn) {
    const bubble = btn.closest('.chat-bubble-assistant');
    if (!bubble) return;
    const textEl = bubble.querySelector('.chat-response-content');
    if (!textEl) return;
    navigator.clipboard.writeText(textEl.innerText || textEl.textContent).then(() => {
      btn.innerHTML = '✓ Copied';
      setTimeout(() => { btn.innerHTML = '📋 Copy'; }, 2000);
    });
  };

  window.handleSendMessage = async function () {
    const input = document.getElementById('chatInput');
    const query = input.value.trim();
    if (!query) return;

    if (!state.geminiApiKey) {
      openApiKeyModal();
      return;
    }

    input.value = '';
    autoGrowTextarea(input);

    const messagesArea = document.getElementById('chatMessagesArea');
    const welcome = document.getElementById('chatWelcomeScreen');
    if (welcome) welcome.remove();

    // 1. Render User Bubble
    const userBubble = document.createElement('div');
    userBubble.style.cssText = 'align-self: flex-end; max-width: 78%; background-color: var(--dark-pill); border: 1px solid var(--dark-pill); color: #FFFFFF; padding: 0.9rem 1.35rem; border-radius: 18px 18px 4px 18px; font-size: 0.95rem; line-height: 1.55; box-shadow: 0 4px 14px rgba(17, 17, 22, 0.15);';
    userBubble.textContent = query;
    messagesArea.appendChild(userBubble);

    // 2. Local RAG Retrieval
    const retrievedDocs = retrieveLocalKnowledge(query);

    // 3. Render Assistant Bubble (Immediate loading feedback)
    const assistantBubble = document.createElement('div');
    assistantBubble.className = 'chat-bubble-assistant';
    assistantBubble.style.cssText = 'align-self: flex-start; max-width: 88%; background-color: #FFFFFF; border: 1px solid var(--border); padding: 1.4rem 1.65rem; border-radius: 18px 18px 18px 4px; color: var(--text-main); font-size: 0.96rem; line-height: 1.7; box-shadow: var(--shadow-card);';
    assistantBubble.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span class="brand-logo-icon" style="width: 24px; height: 24px; border-radius: 7px; font-size: 0.85rem;">🧬</span>
          <span style="color: var(--primary); font-weight: 800; font-size: 0.92rem; letter-spacing: -0.01em;">PepTalk Intelligence</span>
        </div>
        <button class="copy-response-btn" onclick="copyChatResponse(this)" style="display: none;">📋 Copy</button>
      </div>
      <div class="assistant-content">
        <div class="streaming-thinking-loader">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <span class="thinking-status-text">Synthesizing clinical answer from verified PepTalk database...</span>
        </div>
      </div>
    `;
    messagesArea.appendChild(assistantBubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // 4. Construct Clinical System Prompt with Grounding Data
    let contextStr = '';
    if (retrievedDocs.length > 0) {
      contextStr = retrievedDocs.map((d, i) => `=== GROUNDED RECORD ${i + 1} (${d.type}: ${d.name}) ===\n${d.text}`).join('\n\n');
    }

    const systemInstruction = `You are PepTalk AI, an advanced biomedical research and clinical peptide intelligence assistant.
You possess access to PepTalk's complete verified knowledge base (Core Peptides, Vault Monographs, Official Titration Protocols, and FDA Literature).

OFFICIAL PEPTALK GROUNDING KNOWLEDGE:
------------------------------------
${contextStr ? contextStr : "No specific compound exact-match was found. Provide accurate scientific pharmacology and peptide research guidelines based on established biochemical literature."}
------------------------------------

FORMATTING & CLINICAL INSTRUCTIONS:
1. Provide a direct, well-structured clinical answer using exact PepTalk monograph standards.
2. When answering reconstitution questions:
   - Provide the Core Formulas with LaTeX:
     * Resulting Concentration (mg/mL): $$\\text{Concentration (mg/mL)} = \\frac{\\text{Vial Strength (mg)}}{\\text{BAC Water Added (mL)}}$$
     * Concentration per Syringe Unit (mcg/unit): $$\\text{mcg per unit} = \\frac{\\text{Vial Strength (mg)} \\times 1,000}{\\text{Units of BAC Water (1 mL = 100 units)}}$$
     * Syringe Units to Draw: $$\\text{Units to Draw} = \\frac{\\text{Desired Dose (mg)}}{\\text{Concentration (mg/mL)}} \\times 100$$
   - Present a clean Markdown Reference Table with columns: | Vial Strength | BAC Water Added | Concentration (mg/mL) | Syringe Tick Draw for [Standard Doses] |.
   - Detail the 6-step gentle reconstitution technique: 1. Room temp stabilization, 2. Alcohol stopper prep (dry fully), 3. Sterile draw, 4. 45° angle stream down glass wall, 5. Gentle swirl (never shake), 6. Refrigerate 2–8°C protected from light.
3. When answering dosing/titration questions:
   - Provide the titration schedule clearly.
   - Always state the Core Clinical Principle: "There is no fixed timeline; titrate based on tolerability."
   - Detail the 4 Decision Rules: **Advance**, **Hold**, **Reduce**, **Stay**.
4. When discussing safety:
   - Detail specific bloodwork monitoring markers (e.g. HbA1c, CMP, Lipids, Ferritin, Thyroid panel, Amylase/Lipase).
   - Detail contraindications (e.g. MTC, MEN2, pancreatitis) and emergency warning signals.
5. Render clean Markdown tables and KaTeX math. End with a 1-line educational disclaimer.`;

    const modelName = document.getElementById('chatModelSelect')?.value || 'gemini-3.8-flash';
    const contentContainer = assistantBubble.querySelector('.assistant-content');
    const copyBtn = assistantBubble.querySelector('.copy-response-btn');

    const sourcesHtml = retrievedDocs.length > 0 ? `
      <div style="margin-top: 1.25rem; padding-top: 0.85rem; border-top: 1px solid var(--border-light); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Sources Grounded:</span>
        ${retrievedDocs.map(d => `<span class="compound-pill" style="font-size: 0.76rem;">${escapeHtml(d.name)}</span>`).join('')}
      </div>
    ` : '';

    let accumulatedText = '';
    let hasReceivedFirstToken = false;

    // Fast streaming generator with low thinking latency
    async function streamGenerate(selectedModel, useLowThinking = true) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?alt=sse&key=${encodeURIComponent(state.geminiApiKey)}`;
      
      const genConfig = {
        temperature: 0.15,
        maxOutputTokens: 2500
      };

      if (useLowThinking) {
        genConfig.thinkingConfig = {
          thinkingLevel: 'low'
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: query }]
            }
          ],
          generationConfig: genConfig
        })
      });
      return res;
    }

    try {
      let response = await streamGenerate(modelName, true);

      // Fallback without thinkingConfig if model rejects thinkingLevel
      if (response.status === 400) {
        console.warn('Retrying stream without thinkingConfig...');
        response = await streamGenerate(modelName, false);
      }

      // Fallback if model not found (404)
      if (response.status === 404 && modelName !== 'gemini-3.8-flash') {
        console.warn(`Model ${modelName} returned 404, falling back to gemini-3.8-flash...`);
        response = await streamGenerate('gemini-3.8-flash', true);
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep remainder

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              // Filter out thought parts and extract text chunks immediately
              const parts = parsed.candidates?.[0]?.content?.parts || [];
              let textChunk = '';
              for (const p of parts) {
                if (p.text && !p.thought) {
                  textChunk += p.text;
                }
              }

              if (textChunk) {
                if (!hasReceivedFirstToken) {
                  hasReceivedFirstToken = true;
                  if (copyBtn) copyBtn.style.display = 'inline-flex';
                }
                accumulatedText += textChunk;
                contentContainer.innerHTML = `
                  <div class="chat-response-content">${renderMarkdown(accumulatedText)}<span class="streaming-cursor">▋</span></div>
                  ${sourcesHtml}
                `;
                messagesArea.scrollTop = messagesArea.scrollHeight;
              }
            } catch (e) {
              // Partial JSON, continue buffering
            }
          }
        }
      }

      // Final render without cursor
      contentContainer.innerHTML = `
        <div class="chat-response-content">${renderMarkdown(accumulatedText || 'No response content returned.')}</div>
        ${sourcesHtml}
      `;
      if (copyBtn) copyBtn.style.display = 'inline-flex';
    } catch (err) {
      contentContainer.innerHTML = `
        <div style="color: #f87171; line-height: 1.6;">
          <strong>Error generating response:</strong><br>
          ${escapeHtml(err.message)}<br><br>
          <button class="btn btn-outline" onclick="openApiKeyModal()" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">Check Gemini API Key</button>
        </div>
      `;
    }

    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  // Bullet-Proof Markdown & KaTeX Math Renderer (Placeholder Pattern)
  function renderMarkdown(md) {
    if (!md) return '';

    let text = md;
    const mathPlaceholders = [];

    // 1. Extract and render LaTeX Block Math $$...$$
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, expr) => {
      let rendered = expr.trim();
      try {
        if (window.katex && typeof window.katex.renderToString === 'function') {
          rendered = window.katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
        }
      } catch (e) {
        console.warn('KaTeX block error:', e);
      }
      const idx = mathPlaceholders.length;
      mathPlaceholders.push('<div class="math-block">' + rendered + '</div>');
      return `\n\n@@@MATH_BLOCK_${idx}@@@\n\n`;
    });

    // 2. Extract and render LaTeX Inline Math $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
      let rendered = expr.trim();
      try {
        if (window.katex && typeof window.katex.renderToString === 'function') {
          rendered = window.katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
        }
      } catch (e) {
        console.warn('KaTeX inline error:', e);
      }
      const idx = mathPlaceholders.length;
      mathPlaceholders.push(rendered);
      return `@@@MATH_INLINE_${idx}@@@`;
    });

    // 3. Render Markdown Tables, Lists, Headings via marked.js
    let html = '';
    if (window.marked && typeof window.marked.parse === 'function') {
      try {
        html = window.marked.parse(text);
      } catch (e) {
        console.warn('Marked parse error:', e);
        html = text;
      }
    } else {
      html = escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>');
    }

    // 4. Restore math placeholders cleanly without marked interference
    html = html.replace(/<p>\s*@@@MATH_BLOCK_(\d+)@@@\s*<\/p>/g, (match, idx) => {
      return mathPlaceholders[parseInt(idx, 10)] || '';
    });
    html = html.replace(/@@@MATH_(?:BLOCK|INLINE)_(\d+)@@@/g, (match, idx) => {
      return mathPlaceholders[parseInt(idx, 10)] || '';
    });

    return html;
  }

  // =========================================================================
  // 2. RESEARCH VIEW (Screenshot 1 & 2)
  // =========================================================================

  function initResearch() {
    const select = document.getElementById('researchCompoundSelect');
    const compounds = new Set();
    data.researchPapers.forEach(p => {
      (p.peptides || []).forEach(cp => compounds.add(cp));
    });
    [...compounds].sort().forEach(cp => {
      const opt = document.createElement('option');
      opt.value = cp;
      opt.textContent = cp;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      state.researchCompound = e.target.value;
      renderResearch();
    });

    document.querySelectorAll('#researchCategoryChips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#researchCategoryChips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.researchCategory = chip.getAttribute('data-rcat');
        renderResearch();
      });
    });

    document.getElementById('researchSearchInput').addEventListener('input', (e) => {
      state.researchSearch = e.target.value.toLowerCase().trim();
      renderResearch();
    });
  }

  function renderResearch() {
    const feed = document.getElementById('researchFeed');
    const q = state.researchSearch;
    const comp = state.researchCompound;
    const cat = state.researchCategory;

    const filtered = data.researchPapers.filter(p => {
      if (cat !== 'All' && (p.category || '').toLowerCase() !== cat.toLowerCase()) return false;
      if (comp !== 'All' && !(p.peptides || []).includes(comp)) return false;
      if (q) {
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchSumm = (p.summary || '').toLowerCase().includes(q);
        const matchSource = (p.source || '').toLowerCase().includes(q);
        const matchPeps = (p.peptides || []).some(cp => cp.toLowerCase().includes(q));
        return matchTitle || matchSumm || matchSource || matchPeps;
      }
      return true;
    });

    feed.innerHTML = '';
    if (filtered.length === 0) {
      feed.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-muted);">No research papers match your filter criteria.</div>`;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'research-card';

      const compoundPills = (p.peptides || []).map(cp => `
        <span class="compound-pill" style="cursor: pointer;" onclick="navigateToCompound('${escapeHtml(cp)}')" title="View ${escapeHtml(cp)} Monograph">${escapeHtml(cp)}</span>
      `).join('');

      card.innerHTML = `
        <div class="research-meta">
          ${p.category ? `<span class="badge-tag">${escapeHtml(p.category)}</span>` : ''}
          <span>${escapeHtml(p.source || 'Journal')}</span>
          <span>·</span>
          <span>${p.year || 'Recent'}</span>
        </div>
        <h2 class="research-title">${escapeHtml(p.title)}</h2>
        <p class="research-summary">${escapeHtml(p.summary || '')}</p>
        <div class="research-footer">
          <div class="research-compounds-list">
            ${compoundPills}
          </div>
          ${p.url ? `
            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="read-article-link">
              <span>Read full article</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ` : ''}
        </div>
      `;
      feed.appendChild(card);
    });
  }

  // =========================================================================
  // 3. PROTOCOL DETAIL VIEW (Screenshot 3, 4, 5)
  // =========================================================================

  function loadProtocolDetail(protoId) {
    const proto = data.protocols.find(p => p.id === protoId || p.slug === protoId) || data.protocols[0];
    if (!proto) return;

    state.activeProtocol = proto;

    document.getElementById('pDetailName').textContent = proto.name || 'Protocol';
    document.getElementById('pDetailSubtitle').textContent = proto.subtitle || '';
    document.getElementById('pDetailCycleInfo').textContent = proto.cycleInfo || proto.tagline || '';

    const pdfBtn = document.getElementById('pDetailPdfBtn');
    if (proto.pdfUrl) {
      pdfBtn.style.display = 'inline-flex';
      pdfBtn.href = `peppal_scraped_data/protocols/pdf/${proto.pdfUrl.split('/').pop()}`;
    } else {
      pdfBtn.style.display = 'none';
    }

    const blocksContainer = document.getElementById('protocolDetailBlocks');
    let html = '';

    // 1. Reconstitution Protocol Block
    if (proto.reconstitution) {
      const r = proto.reconstitution;
      const rows = (r.table || []).map(row => `
        <tr>
          <td><strong>${escapeHtml(row.vial || '')}</strong></td>
          <td>${escapeHtml(row.water || '')}</td>
          <td>${escapeHtml(row.concentration || '')}</td>
          <td>${escapeHtml(row.reference || '')}</td>
        </tr>
      `).join('');

      html += `
        <div class="protocol-card-block">
          <div class="block-title">
            <span style="color: var(--accent-blue);">🧪</span>
            <span>Reconstitution Protocol</span>
          </div>
          <p class="block-text">${escapeHtml(r.instructions || '')}</p>
          ${rows ? `
            <table class="protocol-table">
              <thead>
                <tr>
                  <th>Vial Size</th>
                  <th>Bac Water</th>
                  <th>Concentration</th>
                  <th>Dose Reference</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          ` : ''}
          ${r.note ? `<p class="table-italics-note">${escapeHtml(r.note)}</p>` : ''}
        </div>
      `;
    }

    // 2. Core Principle Block
    if (proto.corePrinciple) {
      html += `
        <div class="protocol-card-block" style="border-left: 3px solid var(--accent-blue);">
          <div class="block-title">
            <span style="color: #f43f5e;">♡</span>
            <span>Core Principle</span>
          </div>
          <p class="block-text">${escapeHtml(proto.corePrinciple)}</p>
        </div>
      `;
    }

    // 3. Dose Escalation Ladder Block
    if (proto.doseSteps && proto.doseSteps.length > 0) {
      const stepRows = proto.doseSteps.map(s => `
        <tr>
          <td><strong style="color: var(--accent-blue);">${s.step}</strong></td>
          <td><span class="compound-pill" style="font-size: 0.88rem;">${escapeHtml(s.dose || '')}</span></td>
          <td>${escapeHtml(s.notes || '')}</td>
        </tr>
      `).join('');

      html += `
        <div class="protocol-card-block">
          <div class="block-title">
            <span style="color: var(--accent-blue);">📈</span>
            <span>Dose Escalation Ladder</span>
          </div>
          ${proto.doseEscalationNote ? `<p class="block-subtitle">${escapeHtml(proto.doseEscalationNote)}</p>` : ''}
          <table class="protocol-table">
            <thead>
              <tr>
                <th style="width: 70px;">Step</th>
                <th style="width: 140px;">Dose</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>${stepRows}</tbody>
          </table>
        </div>
      `;
    }

    // 4. Decision Rules Block
    if (proto.decisionRules && proto.decisionRules.length > 0) {
      const ruleRows = proto.decisionRules.map(r => {
        let ruleClass = 'rule-advance';
        if (r.label === 'Hold') ruleClass = 'rule-hold';
        if (r.label === 'Reduce') ruleClass = 'rule-reduce';
        if (r.label === 'Stay') ruleClass = 'rule-stay';

        return `
          <div class="decision-rule-row">
            <span class="rule-badge ${ruleClass}">${escapeHtml(r.label)}:</span>
            <span style="color: var(--text-main); font-size: 0.93rem;">${escapeHtml(r.description)}</span>
          </div>
        `;
      }).join('');

      html += `
        <div class="protocol-card-block">
          <div class="block-title">
            <span style="color: var(--accent-blue);">✏️</span>
            <span>Decision Rules</span>
          </div>
          ${ruleRows}
        </div>
      `;
    }

    // 5. Side Effect Management Block
    if (proto.sideEffects && proto.sideEffects.length > 0) {
      const seRows = proto.sideEffects.map(se => `
        <tr>
          <td><strong>${escapeHtml(se.effect)}</strong></td>
          <td><span style="color: var(--text-muted); font-size: 0.88rem;">${escapeHtml(se.severity)}</span></td>
          <td>${escapeHtml(se.action)}</td>
        </tr>
      `).join('');

      html += `
        <div class="protocol-card-block">
          <div class="block-title">
            <span style="color: #f87171;">⚠️</span>
            <span>Side Effect Management</span>
          </div>
          <table class="protocol-table">
            <thead>
              <tr>
                <th style="width: 180px;">Side Effect</th>
                <th style="width: 150px;">Severity</th>
                <th>What To Do</th>
              </tr>
            </thead>
            <tbody>${seRows}</tbody>
          </table>
          ${proto.sideEffectWarning ? `<p class="side-effect-warning-note">${escapeHtml(proto.sideEffectWarning)}</p>` : ''}
        </div>
      `;
    }

    // 6. Tips for Better Tolerability
    if (proto.tips && proto.tips.length > 0) {
      const tipItems = proto.tips.map(t => `<li>${escapeHtml(t)}</li>`).join('');
      html += `
        <div class="protocol-card-block">
          <div class="block-title">
            <span style="color: var(--accent-blue);">🛡️</span>
            <span>Tips for Better Tolerability</span>
          </div>
          <ul class="bullet-tips-list">
            ${tipItems}
          </ul>
        </div>
      `;
    }

    blocksContainer.innerHTML = html;
  }

  function renderProtocolsGrid() {
    const grid = document.getElementById('protocolsGrid');
    grid.innerHTML = '';
    data.protocols.forEach(proto => {
      const card = document.createElement('div');
      card.className = 'compound-item-card';
      card.innerHTML = `
        <h3 class="compound-item-title">${escapeHtml(proto.name)}</h3>
        <p class="compound-item-subtitle">${escapeHtml(proto.subtitle || proto.tagline || '')}</p>
        <p class="compound-item-overview">${escapeHtml(proto.cycleInfo || proto.corePrinciple || 'Clinical titration schedule and official dosing guidelines.')}</p>
        <div class="compound-item-footer">
          <span class="compound-pill">Protocol</span>
          ${proto.pdfUrl ? '<span class="badge-tag">PDF Manual</span>' : ''}
          <span style="margin-left: auto; color: var(--accent-blue); font-weight: 600; font-size: 0.88rem;">View Protocol →</span>
        </div>
      `;
      card.addEventListener('click', () => {
        navigateTo('protocol_detail', proto.id || proto.slug);
      });
      grid.appendChild(card);
    });
  }

  // =========================================================================
  // 4. KNOWLEDGE BASE VIEW (Core & Vaults)
  // =========================================================================

  function initKnowledgeBase() {
    document.querySelectorAll('.library-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.library-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeKbTab = tab.getAttribute('data-tab');
        state.kbCategory = 'All';
        renderKbCategoryChips();
        renderKbCards();
      });
    });

    document.getElementById('kbSearchInput').addEventListener('input', (e) => {
      state.kbSearch = e.target.value.toLowerCase().trim();
      renderKbCards();
    });

    renderKbCategoryChips();
    renderKbCards();
  }

  function getActiveKbDataset() {
    if (state.activeKbTab === 'core') return data.corePeptides;
    if (state.activeKbTab === 'vault_peptide') return vaultByKind.peptide;
    if (state.activeKbTab === 'vault_supplement') return vaultByKind.supplement;
    if (state.activeKbTab === 'vault_cosmetic') return vaultByKind.cosmetic;
    if (state.activeKbTab === 'vault_goal') return vaultByKind.goal;
    return [];
  }

  function renderKbCategoryChips() {
    const dataset = getActiveKbDataset();
    const categories = new Set(['All']);
    dataset.forEach(item => {
      if (item.category) categories.add(item.category);
    });

    const container = document.getElementById('kbCategoryChips');
    container.innerHTML = '';
    [...categories].slice(0, 10).forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `chip ${state.kbCategory === cat ? 'active' : ''}`;
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        state.kbCategory = cat;
        renderKbCategoryChips();
        renderKbCards();
      });
      container.appendChild(btn);
    });
  }

  function renderKbCards() {
    const dataset = getActiveKbDataset();
    const q = state.kbSearch;
    const cat = state.kbCategory;
    const grid = document.getElementById('kbCardsGrid');

    const filtered = dataset.filter(item => {
      if (cat !== 'All' && (item.category || '').toLowerCase() !== cat.toLowerCase()) {
        return false;
      }
      if (q) {
        const name = (item.name || '').toLowerCase();
        const aka = (item.fullName || item.aka || '').toLowerCase();
        const over = (item.overview || item.body || '').toLowerCase();
        return name.includes(q) || aka.includes(q) || over.includes(q);
      }
      return true;
    });

    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted);">No compounds found matching your search.</div>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'compound-item-card';

      const title = item.name || 'Untitled';
      const subtitle = item.fullName || item.aka || '';
      let overview = item.overview || '';
      if (!overview && item.body) {
        overview = item.body.split('\n').filter(l => l.trim().length > 25)[0] || item.body.slice(0, 120);
      }

      card.innerHTML = `
        <h3 class="compound-item-title">${escapeHtml(title)}</h3>
        <p class="compound-item-subtitle">${escapeHtml(subtitle)}</p>
        <p class="compound-item-overview">${escapeHtml(overview)}</p>
        <div class="compound-item-footer">
          ${item.category ? `<span class="badge-tag">${escapeHtml(item.category)}</span>` : ''}
          ${item.evidence ? `<span class="compound-pill">${escapeHtml(item.evidence)}</span>` : ''}
          ${item.confidence ? `<span style="font-size: 0.8rem; color: #4ade80;">${item.confidence}/10 Conf</span>` : ''}
        </div>
      `;
      card.addEventListener('click', () => {
        navigateTo('compound_detail', item);
      });
      grid.appendChild(card);
    });
  }

  // =========================================================================
  // 5. COMPOUND DETAIL VIEW (Full Page Monograph — Replaces Popups)
  // =========================================================================

  function findCompoundItem(param) {
    if (typeof param === 'object' && param !== null) return param;
    const q = String(param).toLowerCase().trim();
    // 1. Exact match in core peptides
    let found = data.corePeptides.find(p => 
      (p.slug && p.slug.toLowerCase() === q) || 
      (p.id && String(p.id).toLowerCase() === q) || 
      (p.name && p.name.toLowerCase() === q)
    );
    if (found) return found;
    // 2. Exact match in vault entries
    found = data.vaultEntries.find(v => 
      (v.slug && v.slug.toLowerCase() === q) || 
      (v.id && String(v.id).toLowerCase() === q) || 
      (v.name && v.name.toLowerCase() === q)
    );
    if (found) return found;
    // 3. Fallback partial name match
    found = data.corePeptides.find(p => p.name.toLowerCase().includes(q)) || 
            data.vaultEntries.find(v => v.name.toLowerCase().includes(q));
    return found || data.corePeptides[0];
  }

  function loadCompoundDetail(param) {
    const item = findCompoundItem(param);
    if (!item) return;

    state.activeCompound = item;

    // Header updates
    document.getElementById('cDetailName').textContent = item.name || 'Untitled';
    document.getElementById('cDetailCategory').textContent = item.category || item.kind || 'Compound';
    document.getElementById('cDetailSubtitle').textContent = item.fullName || item.aka || '';

    const blocksContainer = document.getElementById('compoundDetailBlocks');
    let html = '';

    // Core Peptide Structured Blocks (100% exact match to Peppal)
    if (item.overview && item.mechanismOfAction) {
      const reconst = item.reconstitution || {};
      const storage = item.storage || {};
      const contextsStr = (item.researchContexts || []).join(' • ');

      // 1. Overview
      html += `
        <div class="protocol-card-block">
          <div class="block-title">Overview</div>
          <p class="block-text">${escapeHtml(item.overview)}</p>
        </div>
      `;

      // 2. Mechanism of Action
      html += `
        <div class="protocol-card-block">
          <div class="block-title">Mechanism of Action</div>
          <p class="block-text">${escapeHtml(item.mechanismOfAction)}</p>
        </div>
      `;

      // 3. Research Contexts
      if (contextsStr) {
        html += `
          <div class="protocol-card-block">
            <div class="block-title">Research Contexts</div>
            <p class="block-text">${escapeHtml(contextsStr)}</p>
          </div>
        `;
      }

      // 4. Dosing (PepPal Protocol)
      html += `
        <div class="protocol-card-block">
          <div class="block-title">Dosing (PepPal Protocol)</div>
          <p class="block-text">PepPal only publishes dosing from our vetted protocol PDFs. For peptides without an official PepPal protocol, see the Protocols page.</p>
          ${item.dosageRanges ? `<p class="block-text" style="margin-top: 0.65rem;">${escapeHtml(item.dosageRanges)}</p>` : ''}
        </div>
      `;

      // 5. Reconstitution Guide
      html += `
        <div class="protocol-card-block">
          <div class="block-title">Reconstitution Guide</div>
          <p class="block-text"><strong>Vial size:</strong> ${escapeHtml(reconst.typicalVialSize || 'See PepPal protocol (not yet available for this peptide)')}</p>
          <p class="block-text" style="margin-top: 0.35rem;"><strong>Water volume:</strong> ${escapeHtml(reconst.waterVolume || 'See PepPal protocol (not yet available for this peptide)')}</p>
          <p class="block-text" style="margin-top: 0.35rem;"><strong>Concentration:</strong> ${escapeHtml(reconst.resultingConcentration || 'See PepPal protocol (not yet available for this peptide)')}</p>
          <p class="block-text" style="margin-top: 0.65rem;">${escapeHtml(reconst.instructions || 'Reconstitution math depends on dosing — and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols.')}</p>
        </div>
      `;

      // 6. Storage Guidelines
      html += `
        <div class="protocol-card-block">
          <div class="block-title">Storage Guidelines</div>
          <p class="block-text"><strong>Before reconstitution:</strong> ${escapeHtml(storage.beforeReconstitution || 'General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.')}</p>
          <p class="block-text" style="margin-top: 0.5rem;"><strong>After reconstitution:</strong> ${escapeHtml(storage.afterReconstitution || 'General peptide guidance: refrigerate at 2–8°C. Specific guidance only published for peptides with an official PepPal protocol.')}</p>
        </div>
      `;

      // 7. Half-Life & Stability
      html += `
        <div class="protocol-card-block">
          <div class="block-title">Half-Life & Stability</div>
          <p class="block-text"><strong>Half-life:</strong> ${escapeHtml(item.halfLife || 'Not published here — PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.')}</p>
          <p class="block-text" style="margin-top: 0.5rem;"><strong>Stability:</strong> ${escapeHtml(item.stability || 'PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols.')}</p>
        </div>
      `;
    } else if (item.body) {
      // Vault Entry Monograph Block
      html += `
        <div class="protocol-card-block">
          <div style="white-space: pre-wrap; color: var(--text-main); line-height: 1.8; font-size: 0.96rem;">
            ${escapeHtml(item.body)}
          </div>
        </div>
      `;
    }

    blocksContainer.innerHTML = html;
  }

  // =========================================================================
  // 6. RECONSTITUTION CALCULATOR
  // =========================================================================

  function initCalculator() {
    const calcMg = document.getElementById('calcMg');
    const calcMl = document.getElementById('calcMl');
    const calcDoseVal = document.getElementById('calcDoseVal');
    const calcUnitSelect = document.getElementById('calcUnitSelect');
    const calcUnitsDisplay = document.getElementById('calcUnitsDisplay');
    const calcConcDisplay = document.getElementById('calcConcDisplay');

    function compute() {
      const mg = parseFloat(calcMg.value) || 0;
      const ml = parseFloat(calcMl.value) || 0;
      const dose = parseFloat(calcDoseVal.value) || 0;
      const unit = calcUnitSelect.value;

      if (mg <= 0 || ml <= 0 || dose <= 0) {
        calcUnitsDisplay.textContent = '--';
        calcConcDisplay.textContent = 'Concentration: --';
        return;
      }

      const conc = mg / ml;
      const doseInMg = unit === 'mcg' ? dose / 1000 : dose;
      const volMl = doseInMg / conc;
      const units = volMl * 100;

      calcUnitsDisplay.textContent = units.toFixed(1).replace(/\.0$/, '');
      calcConcDisplay.textContent = `Concentration: ${conc.toFixed(2)} mg/mL (${(conc * 1000).toLocaleString()} mcg/mL)`;
    }

    [calcMg, calcMl, calcDoseVal, calcUnitSelect].forEach(el => {
      el.addEventListener('input', compute);
      el.addEventListener('change', compute);
    });

    compute();
  }

  // =========================================================================
  // 7. CLASSROOM & MASTERCLASS VIEWER (75 Courses · 797 Lessons)
  // =========================================================================

  function initClassroom() {
    const searchInput = document.getElementById('classroomSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.classroomSearch = e.target.value.toLowerCase().trim();
        renderClassroomGrid();
      });
    }
  }

  function renderClassroom() {
    renderClassroomTopicChips();
    renderClassroomGrid();
  }

  function renderClassroomTopicChips() {
    const courses = window.PEPTALK_COURSES || [];
    const orderedCategories = [
      'All',
      'Foundations',
      'Dosing & Safety',
      'GLP-1 & Weight',
      'Growth Hormone & Muscle',
      'Longevity & Energy',
      'Cognition & Sleep',
      'Hormones, Skin & Hair',
      'Immune & Health',
      'Nutrition & Recipes',
      'Evidence & Community'
    ];

    const container = document.getElementById('classroomTopicChips');
    if (!container) return;
    container.innerHTML = '';

    orderedCategories.forEach(cat => {
      const count = cat === 'All' ? courses.length : courses.filter(c => c.category === cat).length;
      if (cat !== 'All' && count === 0) return;

      const btn = document.createElement('button');
      btn.className = `chip ${state.classroomCategory === cat ? 'active' : ''}`;
      btn.innerHTML = `<span>${escapeHtml(cat)}</span> <span class="tab-badge-count" style="margin-left: 0.35rem; font-size: 0.76rem; padding: 0.1rem 0.45rem;">${count}</span>`;
      btn.addEventListener('click', () => {
        state.classroomCategory = cat;
        renderClassroomTopicChips();
        renderClassroomGrid();
      });
      container.appendChild(btn);
    });
  }

  function renderClassroomGrid() {
    const courses = window.PEPTALK_COURSES || [];
    const q = state.classroomSearch;
    const cat = state.classroomCategory;
    const grid = document.getElementById('classroomGrid');
    if (!grid) return;

    const filtered = courses.filter(c => {
      if (cat !== 'All' && (c.category || '').toLowerCase() !== cat.toLowerCase()) {
        return false;
      }
      if (q) {
        const matchTitle = (c.title || '').toLowerCase().includes(q) || (c.clean_title || '').toLowerCase().includes(q);
        const matchTopic = (c.topic || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q);
        const matchLessons = (c.lessons || []).some(l => (l.title || '').toLowerCase().includes(q));
        return matchTitle || matchTopic || matchLessons;
      }
      return true;
    });

    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted);">No courses found matching your search.</div>`;
      return;
    }

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'compound-item-card';

      // Clean, readable lesson previews without raw emojis
      const lessonTitles = (c.lessons || [])
        .slice(0, 3)
        .map(l => (l.clean_title || l.title || '').replace(/^[^\w\s]+/, '').trim())
        .filter(Boolean);

      const overviewText = lessonTitles.length > 0
        ? 'Lessons: ' + lessonTitles.join(' • ') + (c.lessons.length > 3 ? ` (+${c.lessons.length - 3} more)` : '')
        : 'Comprehensive masterclass curriculum, deep-dive notes, and protocols.';

      const cleanTopic = (c.topic || '').replace(/^\d+\s*[-–]\s*/, '').trim();

      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; gap: 0.5rem;">
          <span class="badge-tag">${escapeHtml(c.category || 'Course')}</span>
          <span class="compound-pill" style="font-size: 0.76rem; padding: 0.15rem 0.6rem; background: #F3F4F8; color: #555768; border-color: #E2E4EC;">${c.lesson_count} ${c.lesson_count === 1 ? 'Lesson' : 'Lessons'}</span>
        </div>
        <h3 class="compound-item-title" style="font-size: 1.18rem; margin-bottom: 0.3rem;">${escapeHtml(c.clean_title || c.title)}</h3>
        <p class="compound-item-subtitle" style="font-size: 0.85rem; margin-bottom: 0.75rem; color: var(--text-secondary);">${escapeHtml(cleanTopic)}</p>
        <p class="compound-item-overview" style="font-size: 0.88rem; color: #555768; line-height: 1.55; margin-bottom: 1.25rem;">
          ${escapeHtml(overviewText)}
        </p>
        <div class="compound-item-footer" style="margin-top: auto; padding-top: 0.65rem; border-top: 1px solid var(--border-light); display: flex; align-items: center; justify-content: flex-end;">
          <span style="color: var(--primary); font-weight: 700; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 0.35rem;">
            <span>View Course</span> <span>→</span>
          </span>
        </div>
      `;

      card.addEventListener('click', () => {
        navigateTo('course_viewer', c);
      });

      grid.appendChild(card);
    });
  }

  function loadCourseViewer(param) {
    const courses = window.PEPTALK_COURSES || [];
    let course = null;
    if (typeof param === 'object' && param !== null) {
      course = param;
    } else {
      const q = String(param).toLowerCase().trim();
      course = courses.find(c => c.id === param || c.title.toLowerCase() === q || c.title.toLowerCase().includes(q)) || courses[0];
    }
    if (!course) return;

    state.activeCourse = course;

    document.getElementById('courseViewerTitle').textContent = course.title;
    document.getElementById('courseViewerTopic').textContent = course.category || course.topic || 'Masterclass';
    document.getElementById('courseViewerCount').textContent = `${course.lesson_count} lessons`;

    // Local file path
    const fileUrl = 'Peptalk_Classroom_Archive/' + course.local_file.split('/').map(encodeURIComponent).join('/');
    document.getElementById('courseIframe').src = fileUrl;
    document.getElementById('courseViewerExternalBtn').href = fileUrl;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    initResearch();
    initKnowledgeBase();
    initClassroom();
    initCalculator();
    navigateTo('chat'); // Open directly into AI Chat!
  });
})();
