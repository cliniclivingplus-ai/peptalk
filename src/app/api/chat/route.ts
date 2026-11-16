import { NextRequest, NextResponse } from 'next/server';
import { searchInternalKnowledge, RAGDocument } from '@/lib/ragService';

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
    const body = await req.json();
    const { message, history = [], apiKey: clientApiKey } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'INVALID_INPUT', message: 'Message is required.' }, { status: 400 });
    }

    // 1. Resolve effective API Key (server env takes priority or acts as permanent fallback)
    const rawKey =
      (clientApiKey && clientApiKey.trim()) ||
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

    // 2. Perform Deep RAG Search across internal Knowledge Base, Protocols, and Classroom Lessons
    const relevantDocs: RAGDocument[] = searchInternalKnowledge(message, 5);

    const internalContext = relevantDocs.length > 0
      ? relevantDocs
          .map(
            (d, idx) =>
              `[SOURCE ${idx + 1} (${d.category.toUpperCase()}): "${d.title}"]\n${d.text}`
          )
          .join('\n\n')
      : 'No direct keyword match in internal files. Ground response in peer-reviewed clinical peptide pharmacology.';

    const systemPrompt = `You are PepTalk, the premier clinical peptide intelligence assistant.
Your mission is to provide deep, actionable, exhaustive clinical monographs grounded directly in the internal PepTalk database.

=== MANDATORY MONOGRAPH OUTPUT STRUCTURE ===
Whenever the user asks about a peptide, drug, or compound (e.g. Semaglutide/Ozempic, Tirzepatide, Retatrutide, BPC-157, etc.), you MUST deliver a comprehensive, structured clinical monograph following this EXACT blueprint:

### 1. Primary Pharmacology & Mechanism of Action
- Detail exact receptor binding affinities, biological pathways, central hypothalamic & hindbrain satiety signaling, and metabolic actions.

### 2. Clinical Impact & Targeted Physiological Response
- Directly address the user's specific context (e.g. age, metabolic goals, insulin resistance, PCOS, body composition).
- Include a structured comparison table showing clinical areas, physiological actions, and clinical considerations.

### 3. Key Patient & Lifestyle Considerations
- **Lean Mass Preservation:** Emphasize protein target of **1.6 to 2.2 g/kg** daily and mandatory progressive resistance training (lifting 3-4x/week) to prevent skeletal muscle loss.
- **Nutrition & Hydration:** Electrolytes, fiber from day one, and hydration.
- **Medication & Contraceptive Interactions:** Note that delayed gastric emptying impairs oral contraceptive pill absorption (recommend alternative/barrier methods during titration).
- **Pregnancy Warning:** Long elimination half-life; strict contraindication in pregnancy (must discontinue at least 2 months prior).
- **Micronutrient Depletion:** Reduced intake drops **ferritin (iron stores)** and **Vitamin B12**, frequently causing telogen effluvium (hair shedding) and fatigue.

### 4. Standard Clinical Titration Ladder & Dosing Matrix
- Provide the exact clinical titration ladder as a clean markdown table with columns:
  | Step | Dose | Schedule | Clinical Objective |
- Emphasize that titration steps exist strictly for GI receptor tolerability and must NEVER be rushed.

### 5. Bloodwork & Biomarkers to Monitor
- Table or bullet list of essential markers: **Fasting Insulin**, **HbA1c**, **CMP (Electrolytes/Kidney)**, **Lipid Panel**, **Ferritin**, **Vitamin B12**, and **Amylase/Lipase**.
- Note baseline vs 12-week monitoring intervals.

### 6. Absolute Contraindications & Safety Rules
- Detail contraindications (MTC, MEN2, pancreatitis, pregnancy).

=== CRITICAL CONTENT RULES ===
- DO NOT veer off into regulatory 503B compounding ban news, FDA legal history, or supply shortage policies unless the user explicitly asks about legal or FDA regulations. Focus 100% on clinical pharmacology, human biology, dosing, and safety.
- Use clean dark font bolding (**Key Term**, **Dosages**, **Units**) for readability.
- Never output loose, unparsed double-asterisks without structure.
- Conclude with a brief standard educational clinical reference disclaimer.

=== INTERNAL PEPTALK DATABASE SOURCES ===
${internalContext}
==========================================`;

    // 3. Current active Gemini models in order of priority
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-pro-preview',
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
          maxOutputTokens: 3500,
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
          const textParts = parts
            .filter((p: any) => !p.thought && p.text)
            .map((p: any) => p.text);

          const fullText = textParts.join('\n\n').trim();

          if (fullText) {
            reply = fullText;
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
                const fullText = parts
                  .filter((p: any) => !p.thought && p.text)
                  .map((p: any) => p.text)
                  .join('\n\n')
                  .trim();
                if (fullText) {
                  reply = fullText;
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
