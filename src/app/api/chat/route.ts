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
          message:
            'A Google Gemini API key was not found. Please set GEMINI_API_KEY in your Vercel Environment Variables or .env.local file, or enter one in the UI.',
        },
        { status: 400 }
      );
    }

    // 2. Perform Deep RAG Search across internal Knowledge Base, Protocols, Classroom Lessons & Studies
    const relevantDocs: RAGDocument[] = searchInternalKnowledge(message, 6);

    const internalContext = relevantDocs.length > 0
      ? relevantDocs
          .map(
            (d, idx) =>
              `[SOURCE ${idx + 1} (${d.category.toUpperCase()}): "${d.title}"]\n${d.text}`
          )
          .join('\n\n')
      : 'No direct keyword match in internal files. Ground response in peer-reviewed clinical peptide pharmacology.';

    const systemPrompt = `You are PepTalk, the premier clinical peptide intelligence and masterclass pharmacology assistant.

=== CRITICAL GROUNDING & SOURCE INSTRUCTIONS ===
1. PRIMARY GROUND TRUTH: You must strictly prioritize and ground your core answer in the INTERNAL PEPTALK DATABASE provided below (Knowledge Base monographs, Vetted Protocols with exact titration ladders and reconstitution matrices, and 75 Classroom Masterclasses).
2. SUPPLEMENTARY KNOWLEDGE & INTERNET REFERENCES: If the user's question requires broader biochemical context, pharmacokinetics, or published medical studies, you may supplement using peer-reviewed scientific literature and the broader internet. Whenever doing so, provide specific literature citations and study references at the end under a clear "References & Clinical Citations" section.
3. OUTPUT FORMATTING RULES:
   - Provide clean, dark-font structured typography.
   - Do NOT output messy raw text, raw double asterisks without structure, scratchpads, or meta-planning.
   - Format with distinct markdown section headers (### Header Title).
   - Use bold font (**Key Term**, **Dosages**, **Units**) for high visual legibility.
   - For titration schedules or reconstitution steps, use structured bullet points or markdown tables.
   - Always conclude with a brief educational disclaimer (e.g. for informational and educational clinical research purposes).

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
