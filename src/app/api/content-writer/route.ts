import { NextRequest, NextResponse } from 'next/server';
import { searchInternalKnowledge, searchSupplementVault, RAGDocument } from '@/lib/ragService';
import { verifySessionToken, isValidClinicEmail, SESSION_COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const {
      idea,
      format = 'Blog / Educational Article',
      audience = 'Patients & General Public',
      tone = 'Clear, Engaging & Trustworthy',
      refinement = '',
      previousDraft = '',
      apiKey: clientApiKey,
    } = body;

    if (!idea || typeof idea !== 'string' || !idea.trim()) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Please describe your content idea first.' },
        { status: 400 }
      );
    }

    // 1. Resolve API Key
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
          message: 'A Google Gemini API key is required to generate content.',
        },
        { status: 400 }
      );
    }

    // 2. Deep RAG search across PepTalk Knowledge Base + Supplement Vault
    const relevantDocs: RAGDocument[] = searchInternalKnowledge(idea, 8);
    const relevantSupplements: RAGDocument[] = searchSupplementVault(idea, 4);

    const internalContext =
      relevantDocs.length > 0
        ? relevantDocs
            .map(
              (d, idx) =>
                `[INTERNAL SOURCE ${idx + 1} (${d.category.toUpperCase()}): "${d.title}"]\n${d.text}`
            )
            .join('\n\n')
        : 'No exact keyword match in internal files — synthesize from peer-reviewed peptide & clinical literature.';

    const supplementContext =
      relevantSupplements.length > 0
        ? relevantSupplements
            .map((d, idx) => `[SUPPLEMENT VAULT ${idx + 1}: "${d.title}"]\n${d.text}`)
            .join('\n\n')
        : 'No direct supplement vault match.';

    const systemPrompt = `You are PepTalk Content Studio — an elite medical copywriter, science communicator, and peptide clinical strategist for ClinicLivingPlus.

Your job is to take a content writer's raw idea and turn it into publication-ready, scientifically accurate, brilliantly phrased content tailored to their exact format, audience, and tone.

=== HOW YOU WORK ===
1. **Scientific Grounding (Dual-Source):**
   - Ground every mechanism, protocol concept, and safety point in BOTH the **Internal PepTalk Knowledge Base** below AND **peer-reviewed clinical/scientific literature** (PubMed, clinical trials, endocrinology & pharmacology consensus).
   - Never fabricate study names or fake statistics. If evidence is preclinical/animal-only (e.g., BPC-157), frame it honestly and responsibly ("preclinical studies suggest...", "clinicians observe...").

2. **World-Class Copywriting, Phrasing & Framing:**
   - Apply modern high-performing content frameworks (strong scroll-stopping hooks, clear narrative flow, jargon-free analogies for patients or crisp clinical precision for doctors, natural transitions, and compelling CTAs).
   - Format the draft specifically for the requested **Content Format**:
     * **Blog / Educational Article:** SEO-friendly H2/H3 structure, scannable bullets, key takeaways box.
     * **Instagram / LinkedIn Post:** Scroll-stopping first line, tight spacing, punchy storytelling, CTA + relevant hashtags.
     * **YouTube / Reel / Short Script:** Spoken word script with "[VISUAL CUE]" and "[ON-SCREEN TEXT]" markers, 3-second hook, pacing cues.
     * **Carousel Slides:** Slide-by-slide breakdown ("Slide 1: Cover Hook", "Slide 2: ...", up to "Final Slide: CTA").
     * **Patient Education Sheet:** Warm, reassuring, plain-English FAQ & expectations guide.
     * **Newsletter / Email:** Subject line options, preview text, engaging body, clean CTA.

3. **Required Output Structure (use clean GitHub-Flavored Markdown, NO ASCII art):**
   ### 1. Headline / Hook Options
   Provide 3 distinct, high-converting headline or opening hook options (e.g., Curiosity, Authority/Science, Relatable/Benefit).

   ### 2. Ready-to-Publish Content Draft
   Deliver the complete, polished, ready-to-use draft tailored to **${format}** for **${audience}** in a **${tone}** tone.

   ### 3. Scientific Evidence & Fact-Check Notes
   Summarize the key scientific facts backing this piece in a clean bullet list, clearly tagging whether each point comes from **(PepTalk Knowledge Base)** or **(Peer-Reviewed Clinical Literature)** so the writer can stand behind every claim.

   ### 4. Phrasing, Framing & Compliance Tips
   - 2–3 quick tips on how to phrase sensitive medical claims safely (avoiding guaranteed cure language while staying persuasive).
   - Suggested Call-to-Action (CTA) and, if relevant, SEO keywords or hashtags.

=== INTERNAL PEPTALK KNOWLEDGE BASE ===
${internalContext}

=== MATCHING SUPPLEMENT VAULT ENTRIES ===
${supplementContext}
======================================`;

    const userPrompt = previousDraft && refinement
      ? `Original Content Idea: ${idea.trim()}\nFormat: ${format}\nTarget Audience: ${audience}\nTone: ${tone}\n\nPrevious Draft:\n${previousDraft}\n\nWriter's Refinement Request:\n${refinement.trim()}\n\nPlease revise and improve the content based on this refinement request while keeping the full 4-section structure.`
      : `Content Idea / What I want to talk about:\n${idea.trim()}\n\nContent Format: ${format}\nTarget Audience: ${audience}\nTone & Style: ${tone}\n\nPlease analyze this idea using both the PepTalk Knowledge Base and broader clinical evidence, and generate the complete content package.`;

    const candidateModels = [
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
    ];

    let reply = '';
    const executionErrors: string[] = [];

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.45,
              maxOutputTokens: 16384,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
          }),
        });

        const json = await res.json();
        if (res.ok && !json.error) {
          const parts = json.candidates?.[0]?.content?.parts || [];
          const text = parts
            .filter((p: any) => !p.thought && p.text)
            .map((p: any) => p.text)
            .join('\n\n')
            .trim();
          if (text) {
            reply = text;
            break;
          }
        } else {
          executionErrors.push(`${model}: ${json.error?.message || res.statusText}`);
        }
      } catch (err: any) {
        executionErrors.push(`${model}: ${err.message}`);
      }
    }

    if (!reply) {
      return NextResponse.json(
        {
          error: 'GENERATION_FAILED',
          message: `Could not generate content. ${executionErrors.slice(0, 2).join(' | ')}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply,
      sources: [
        ...relevantDocs.map((d) => d.title),
        ...relevantSupplements.map((d) => d.title),
      ].slice(0, 6),
    });
  } catch (err: any) {
    console.error('[ContentWriter API Error]', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
