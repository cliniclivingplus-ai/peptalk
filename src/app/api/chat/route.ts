import { NextRequest, NextResponse } from 'next/server';
import { searchInternalKnowledge, searchSupplementVault, RAGDocument } from '@/lib/ragService';
import { verifySessionToken, isValidClinicEmail, SESSION_COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const serverKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    '';

  return NextResponse.json({
    hasServerKey: !!serverKey.trim(),
    message: serverKey.trim()
      ? 'Permanent Gemini API Key is configured in the server environment (Vercel / .env.local).'
      : 'No server-side Gemini API Key found in environment variables.',
  });
}

export async function POST(req: NextRequest) {
  try {
    // 0. Verify active ClinicLivingPlus session
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session || !isValidClinicEmail(session.email)) {
      return NextResponse.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Access restricted: Please authenticate with your authorized @cliniclivingplus.com email address.',
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, history = [], apiKey: clientApiKey } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'INVALID_INPUT', message: 'Message is required.' }, { status: 400 });
    }

    // 1. Resolve effective API Key (server env takes priority or acts as permanent fallback)
    const sanitizedClientKey =
      clientApiKey && typeof clientApiKey === 'string' && clientApiKey.trim() !== 'server_configured'
        ? clientApiKey.trim()
        : '';

    const rawKey =
      sanitizedClientKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, '');

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'MISSING_API_KEY',
          message: 'A Google Gemini API key is required. Please enter your key in settings to continue.',
        },
        { status: 400 }
      );
    }

    // 2. Perform Deep RAG Search across internal Knowledge Base, Protocols, Classroom Lessons, and Supplement Vault
    const relevantDocs: RAGDocument[] = searchInternalKnowledge(message, 8);
    const relevantSupplements: RAGDocument[] = searchSupplementVault(message, 5);

    const internalContext = relevantDocs.length > 0
      ? relevantDocs
          .map(
            (d, idx) =>
              `[SOURCE ${idx + 1} (${d.category.toUpperCase()}): "${d.title}"]\n${d.text}`
          )
          .join('\n\n')
      : 'No direct keyword match in internal files. Ground response in peer-reviewed clinical peptide pharmacology.';

    const supplementContext = relevantSupplements.length > 0
      ? relevantSupplements
          .map(
            (d, idx) =>
              `[VAULT SUPPLEMENT ${idx + 1}: "${d.title}"]\n${d.text}`
          )
          .join('\n\n')
      : 'No direct keyword match in the Supplement Vault for this query — draw from broader peer-reviewed clinical supplement literature.';

    const systemPrompt = `You are PepTalk, the premier clinical peptide intelligence assistant.
Your mission is to provide deep, actionable, exhaustive, and rigorously data-grounded clinical responses synthesized directly from the internal PepTalk database (compounds, vetted protocols, masterclass curriculum, and published studies).

=== CORE CLINICAL DIRECTIVE: ANSWER THE USER'S SPECIFIC INTENT FIRST ===
Carefully analyze the user's specific prompt, clinical question, and intent before formulating your response. DO NOT force an irrelevant generic 6-part monograph when the user asks a targeted question. Always prioritize the exact data, numbers, and protocols requested:

1. IF ASKING ABOUT TESTS, BLOODWORK, LABS, OR BIOMARKERS (e.g., "What tests should you do before starting CJC, IPA?"):
   - DIRECTLY deliver the comprehensive baseline and monitoring laboratory protocol for those specific compounds.
   - Detail the essential pre-treatment blood panel:
     * Specific markers: **Baseline IGF-1** (to assess somatotroph reserve and establish a pre-cycle benchmark), **Fasting Insulin**, **Fasting Glucose**, and **HbA1c** (essential because elevated baseline insulin blunts GH secretion; growth hormone and insulin act antagonistically), **Comprehensive Metabolic Panel (CMP)** (hepatic transaminases ALT/AST and renal markers BUN/eGFR for clearance), **Lipid Panel**, **Thyroid Panel (TSH, Free T3/T4)**, and **Prolactin / Cortisol** (to verify baseline pituitary homeostasis and confirm secretagogue selectivity).
     * The physiological rationale for each marker specifically tied to that compound mechanism.
     * Testing timelines: Baseline draw, mid-cycle reassessment (at 6–8 or 12 weeks), and the critical **off-cycle clearance rule** (e.g. for CJC-1295 / Ipamorelin or GHRH secretagogues, repeated weekly administration maintains elevated circulating IGF-1 for up to 28 days post-cessation; therefore, wait 4–8 weeks into an off-cycle before testing to establish a true unmedicated baseline and avoid false elevated readings).
     * Lab red flags & contraindications to screen out prior to starting (e.g. active malignancy screening because elevated IGF-1 stimulates mitotic cellular proliferation; unmanaged diabetic hyperglycemia).
     * Grounded testing resources from the internal masterclass data (e.g. AlgoRx basic men's/women's hormone panels, Quest, LabCorp).

2. IF ASKING FOR A PROTOCOL, DOSING, OR CYCLE (e.g., "What's the best protocol for BPC?"):
   - DIRECTLY deliver the exact clinical protocol from the vetted database.
   - Detail the formulation and compound options (e.g. standalone BPC-157 vs the Wolverine Stack with TB-500, oral/systemic vs targeted local SubQ).
   - Exact Reconstitution & Syringe Math: specify bac water volume, concentration per unit, and syringe unit calibrations.
   - Structured Clinical Titration Ladder: table with | Step | Dose | Schedule | Clinical Objective |
   - Cycle Duration & Off-Cycle Periods (e.g. 12–16 weeks on / 2–4 weeks off to preserve receptor sensitivity).
   - Clinical administration pearls (fasting rules for secretagogues, injection site rotation, targeted local delivery for connective tissue).

3. IF ASKING ABOUT A CONDITION, PATHOLOGY, OR HEALTH GOAL (e.g., "What is the best peptides to consider for H. Pylori?"):
   - Directly rank and explain the primary, supportive, and restorative peptide strategies (e.g. Primary antimicrobial LL-37 for membrane pore lysis, Supportive Thymosin Alpha-1 for Th1 mucosal immune activation, Restorative BPC-157 for gastric epithelial ulcer repair).
   - Explain the targeted physiological mechanism against the pathogen/condition.
   - Provide the complete phase-by-phase clinical protocol (Priming, Active Eradication, Consolidation/Restoration).
   - Address key condition-specific cofactors, micronutrient repletion (e.g. ferritin/iron and B12 depleted by H. Pylori hypochlorhydria), and diagnostic verification (urea breath test, stool antigen).

4. IF ASKING FOR A COMPREHENSIVE OVERVIEW / FULL MONOGRAPH OF A COMPOUND:
   - Deliver a full, deep clinical monograph with:
     ### 1. Primary Pharmacology & Molecular Mechanism
     ### 2. Clinical Impact & Targeted Indications (with comparison table)
     ### 3. Patient & Lifestyle Considerations (tailored to that compound - NEVER apply GLP-1 specific rules like delayed gastric emptying to non-GLP-1 peptides)
     ### 4. Standard Clinical Titration Ladder & Dosing Matrix
     ### 5. Bloodwork & Biomarkers to Monitor
     ### 6. Absolute Contraindications & Safety Rules

5. IF ASKING ABOUT A CLASS, COURSE, LESSON, OR MASTERCLASS (e.g. "which class talks about dosing", "which video covers reconstitution?"):
   - DIRECTLY identify and present the matching Classroom Masterclasses from the internal database.
   - For each matching class, clearly inform the practitioner:
     * **Course / Curriculum:** The exact course module name (e.g. *Consolidated Dosing, Reconstitution, and Cycle* or *Beginner Peptide Information Course*).
     * **Lesson / Class Title:** The exact title of the lesson/video.
     * **Where to Find It in PepTalk:** Guide the practitioner to click the **Classroom** tab in the left sidebar and select the corresponding course and lesson.
     * **What It Covers:** A clear, concise overview of what is taught in that class (the core topics, dosing concepts, reconstitution calculations, or safety protocols discussed).
     * **Key Clinical Takeaways:** Deliver the essential clinical dosing pearls or key rules taught in that lesson so they get immediate clinical answers right away.

=== RIGOROUS CLINICAL DATA & FORMATTING MANDATES ===
- Ground your response deeply in the actual data, dosages, reconstitution volumes, and timelines from the internal database sources below.
- DO NOT veer off into regulatory 503B compounding ban news or FDA legal history unless the user explicitly asks about regulations or laws.

CRITICAL FORMATTING RULES:
1. STRICTLY NO ASCII ART OR BOX-DRAWING:
   - NEVER output raw ASCII diagrams, flowchart boxes, or Unicode box characters (┌, ─, ┐, └, ┘, │, ├, ┤, ┬, ┴, ┼, +---+, or arrow ladders).
   - Instead, explain multi-system mechanisms using clean, structured bullet points with bold category titles:
     * **Central Nervous System (Hypothalamus):** ...
     * **Gastrointestinal Tract (Gastric Emptying):** ...
     * **Endocrine Pancreas (Incretin Signaling):** ...

2. VALID GITHUB-FLAVORED MARKDOWN TABLES ONLY:
   - ALWAYS format tables using standard markdown pipe syntax with clear header and separator rows:
     | Column 1 | Column 2 | Column 3 |
     |---|---|---|
     | Data 1 | Data 2 | Data 3 |
   - Never output tab-separated columns or borderless tables.

3. CLEAN CLINICAL CHAPTER HEADINGS:
   - Use standard markdown headers (### 1. Primary Pharmacology & Molecular Mechanism, ### 2. Clinical Impact & Targeted Indications, etc.).

4. BOLD KEY PARAMETERS:
   - Bold dosages, syringe units, and clinical laboratory markers (**0.25 mg**, **10 units**, **HbA1c**, **IGF-1**).

- Conclude with a brief standard educational clinical reference disclaimer.

=== MANDATORY SUPPLEMENT SUGGESTIONS FOR EVERY CLINICAL QUERY ===
For EVERY clinical, compound, protocol, lab/bloodwork, or health-goal query (skip only for pure greetings or non-clinical navigation questions), you MUST include a dedicated section right before the disclaimer titled:
### Recommended Adjunct Supplements
- Tailor the supplement recommendations directly to the user's specific query, target pathway, or condition so the physician can evaluate and choose the best options.
- Include **BOTH**:
  1. **PepTalk Supplement Vault** entries (drawn from the matching internal Supplement Vault entries below whenever relevant — use their exact doses and safety notes, and label their Source as \`PepTalk Vault\`).
  2. **Broader Clinical Evidence** supplements (well-established, peer-reviewed supplements from broader medical/clinical literature beyond the matched vault items, labeled \`Clinical Evidence\`).
- Present 4–6 targeted, high-value supplement options in a clean GitHub-Flavored Markdown table:
  | Supplement | Source | Typical Dose | Clinical Rationale | Key Safety / Interactions |
  |---|---|---|---|---|
- Follow the table with 1–2 concise physician decision pearls (e.g., how to prioritize or pair them with the primary peptide/protocol).

=== INTERNAL PEPTALK DATABASE SOURCES ===
${internalContext}

=== MATCHING PEPTALK SUPPLEMENT VAULT ENTRIES ===
${supplementContext}
==========================================`;

    // 3. Current active Gemini models in order of priority (tested live with active key)
    const candidateModels = [
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
    ];

    // Build chat contents from history (last 6 turns max for speed and relevance)
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        if (turn.role === 'user' || turn.role === 'assistant' || turn.role === 'model') {
          formattedContents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }],
          });
        }
      }
    }

    // Append current user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    let reply = '';
    let extractedThoughts = '';
    const executionErrors: string[] = [];

    // Helper to call Gemini generateContent (pure generation for maximum speed and zero external tool quota consumption)
    const callGemini = async (model: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 16384,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return { res, json: await res.json() };
    };

    // Try candidate models
    for (const model of candidateModels) {
      try {
        const result = await callGemini(model);

        if (result.res.ok && !result.json.error) {
          const candidate = result.json.candidates?.[0];
          const parts = candidate?.content?.parts || [];
          
          let thoughts = '';
          const textParts: string[] = [];

          for (const p of parts) {
            if (p.thought) {
              thoughts += (thoughts ? '\n\n' : '') + p.text;
            } else if (p.text) {
              textParts.push(p.text);
            }
          }

          const fullText = textParts.join('\n\n').trim();

          if (fullText) {
            reply = fullText;
            extractedThoughts = thoughts;
            break;
          }
        } else {
          const errMsg = result.json.error?.message || `HTTP ${result.res.status}`;
          executionErrors.push(`[${model}]: ${errMsg}`);

          if (
            errMsg.toLowerCase().includes('api key not valid') ||
            errMsg.toLowerCase().includes('api_key_invalid') ||
            errMsg.toLowerCase().includes('key not found')
          ) {
            return NextResponse.json(
              {
                error: 'INVALID_API_KEY',
                message: `Google Gemini rejected the API key: ${errMsg}. Please verify your key.`,
              },
              { status: 401 }
            );
          }
        }
      } catch (err: any) {
        executionErrors.push(`[${model}]: ${err.message}`);
      }
    }

    // Dynamic fallback: If fixed candidate models all failed, query active models on the key
    if (!reply) {
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const listJson = await listRes.json();
        if (listJson.models && Array.isArray(listJson.models)) {
          const activeModels = listJson.models
            .filter((m: any) => {
              if (!m.supportedGenerationMethods?.includes('generateContent')) return false;
              const name = (m.name || '').toLowerCase();
              return !name.includes('tts') && !name.includes('audio') && !name.includes('embed') && !name.includes('image');
            })
            .map((m: any) => m.name.replace(/^models\//, ''))
            .filter((m: string) => !candidateModels.includes(m));

          for (const fallbackModel of activeModels.slice(0, 3)) {
            try {
              const resFallback = await callGemini(fallbackModel);
              if (resFallback.res.ok && !resFallback.json.error) {
                const parts = resFallback.json.candidates?.[0]?.content?.parts || [];
                let fbThoughts = '';
                const fbTextParts: string[] = [];

                for (const p of parts) {
                  if (p.thought) {
                    fbThoughts += (fbThoughts ? '\n\n' : '') + p.text;
                  } else if (p.text) {
                    fbTextParts.push(p.text);
                  }
                }

                const fullText = fbTextParts.join('\n\n').trim();
                if (fullText) {
                  reply = fullText;
                  extractedThoughts = fbThoughts;
                  break;
                }
              }
            } catch (fbErr: any) {
              executionErrors.push(`[${fallbackModel}]: ${fbErr.message}`);
            }
          }
        }
      } catch (discoveryErr: any) {
        executionErrors.push(`[discovery]: ${discoveryErr.message}`);
      }
    }

    if (!reply) {
      const isQuotaError = executionErrors.some((e) =>
        e.toLowerCase().includes('quota') || e.toLowerCase().includes('resource_exhausted')
      );

      const friendlyMessage = isQuotaError
        ? 'Your Google Gemini API Key has reached its daily Free Tier quota limit. Google resets free tier limits daily, or you can create a fresh free API key at https://aistudio.google.com/app/apikey (or enable pay-as-you-go billing on that project for unlimited requests).'
        : 'Unable to generate response from Gemini API. Details: ' + executionErrors.join(' | ');

      return NextResponse.json(
        {
          error: isQuotaError ? 'QUOTA_EXCEEDED' : 'GENERATION_FAILED',
          message: friendlyMessage,
        },
        { status: isQuotaError ? 429 : 502 }
      );
    }

    return NextResponse.json({
      reply,
      thoughts: extractedThoughts || undefined,
      sources: relevantDocs.map((d) => ({
        title: d.title,
        category: d.category,
        url: d.url,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
