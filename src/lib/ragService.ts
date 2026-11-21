import { allCompounds } from './data/compounds';
import { protocols } from './data/protocols';
import { researchPapers } from './data/research';
import lessonsData from './data/lessons.json';

export interface RAGDocument {
  title: string;
  category: 'Knowledge Base' | 'Vetted Protocol' | 'Classroom Masterclass' | 'Published Study';
  score: number;
  text: string;
  url?: string;
}

const COMMON_ALIASES: Record<string, string[]> = {
  ozempic: ['semaglutide', 'glp-1', 'wegovy'],
  wegovy: ['semaglutide', 'glp-1', 'ozempic'],
  rybelsus: ['semaglutide', 'glp-1'],
  semaglutide: ['ozempic', 'wegovy', 'glp-1'],
  mounjaro: ['tirzepatide', 'gip', 'glp-1', 'zepbound'],
  zepbound: ['tirzepatide', 'gip', 'glp-1', 'mounjaro'],
  tirzepatide: ['mounjaro', 'zepbound', 'glp-1', 'gip'],
  retatrutide: ['glp-3rt', 'ggg', 'triple agonist', 'glucagon'],
  'glp-3rt': ['retatrutide', 'triple agonist'],
  'bpc-157': ['bpc', 'body protection compound', 'wolverine stack', 'gut healing'],
  bpc: ['bpc-157', 'wolverine stack'],
  'tb-500': ['thymosin beta 4', 'tb500', 'wolverine stack'],
  tb500: ['tb-500', 'thymosin beta 4'],
  'ghk-cu': ['copper peptide', 'ghk', 'cosmetic', 'collagen'],
  cjc: ['cjc-1295', 'dac', 'growth hormone', 'ipamorelin'],
  'cjc-1295': ['cjc', 'dac', 'ipamorelin'],
  ipa: ['ipamorelin', 'ghrp', 'growth hormone'],
  ipamorelin: ['ghrp', 'growth hormone', 'cjc-1295', 'ipa'],
  sermorelin: ['growth hormone', 'ghrh'],
  tesamorelin: ['egrifta', 'visceral fat', 'growth hormone'],
  aod: ['aod-9604', 'fat loss'],
  'aod-9604': ['aod', 'frag 176-191', 'growth hormone fragment'],
  epithalon: ['epitalon', 'telomere', 'pineal'],
  epitalon: ['epithalon', 'telomere'],
  nad: ['nad+', 'nicotinamide', 'cellular energy'],
  'nad+': ['nad', 'mitochondrial'],
  motsc: ['mots-c', 'mitochondrial'],
  'mots-c': ['motsc', 'mitochondrial peptide', 'exercise mimetic'],
  selank: ['anxiolytic', 'nootropic', 'semax'],
  semax: ['nootropic', 'bdnf', 'neuroprotection'],
  pylori: ['h pylori', 'helicobacter pylori', 'll-37', 'thymosin alpha-1', 'bpc-157'],
  'h pylori': ['helicobacter pylori', 'll-37', 'thymosin alpha-1', 'bpc-157'],
  'll-37': ['cathelicidin', 'll37', 'antimicrobial'],
  ll37: ['ll-37', 'cathelicidin'],
  ta1: ['thymosin alpha-1', 'thymosin alpha 1', 'tα1'],
  tests: ['bloodwork', 'labs', 'testing', 'biomarkers', 'panel', 'igf-1'],
  test: ['bloodwork', 'labs', 'testing', 'biomarkers', 'panel', 'igf-1'],
  testing: ['bloodwork', 'labs', 'tests', 'baseline', 'biomarkers', 'panel'],
  bloodwork: ['labs', 'tests', 'baseline', 'biomarkers', 'panel', 'blood panel'],
  labs: ['bloodwork', 'tests', 'baseline', 'biomarkers', 'panel'],
  protocol: ['dosing', 'cycle', 'titration', 'schedule', 'reconstitution'],
  protocols: ['dosing', 'cycle', 'titration', 'schedule', 'reconstitution'],
  class: ['course', 'lesson', 'masterclass', 'classroom', 'video', 'module'],
  classes: ['course', 'courses', 'lesson', 'lessons', 'masterclass', 'classroom', 'video'],
  course: ['class', 'masterclass', 'classroom', 'lesson'],
  courses: ['classes', 'masterclasses', 'lessons', 'classroom'],
  lesson: ['class', 'course', 'masterclass', 'video'],
  lessons: ['classes', 'courses', 'masterclasses', 'videos'],
  video: ['class', 'lesson', 'masterclass', 'classroom'],
  videos: ['classes', 'lessons', 'masterclasses', 'classroom'],
  dosing: ['dose', 'dosage', 'titration', 'protocol', 'schedule', 'reconstitution', 'units'],
  dose: ['dosing', 'dosage', 'titration', 'protocol'],
  reconstitution: ['mixing', 'diluent', 'bac water', 'math', 'calculator'],
};

const STOP_WORDS = new Set([
  'what', 'will', 'the', 'for', 'with', 'and', 'how', 'much',
  'about', 'from', 'this', 'that', 'yrs', 'old', 'tell', 'give', 'can', 'you',
  'should', 'use', 'take', 'need', 'when', 'which', 'where', 'does',
]);

export function searchInternalKnowledge(query: string, maxResults: number = 8): RAGDocument[] {
  const cleanQuery = query.toLowerCase().trim();
  const rawTokens = cleanQuery
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const tokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
  const expandedTokens = new Set<string>(tokens);

  tokens.forEach((t) => {
    if (COMMON_ALIASES[t]) {
      COMMON_ALIASES[t].forEach((alias) => expandedTokens.add(alias));
    }
  });

  const tokenList = Array.from(expandedTokens);
  const matchedDocs: RAGDocument[] = [];

  // Check if user specifically asks about legal/FDA/compounding
  const isRegulatoryQuery =
    cleanQuery.includes('fda') ||
    cleanQuery.includes('503b') ||
    cleanQuery.includes('compound') ||
    cleanQuery.includes('legal') ||
    cleanQuery.includes('shortage') ||
    cleanQuery.includes('ban') ||
    cleanQuery.includes('law');

  // Check if user specifically asks about a classroom course or lesson
  const isCourseQuery =
    cleanQuery.includes('class') ||
    cleanQuery.includes('classes') ||
    cleanQuery.includes('course') ||
    cleanQuery.includes('courses') ||
    cleanQuery.includes('lesson') ||
    cleanQuery.includes('lessons') ||
    cleanQuery.includes('video') ||
    cleanQuery.includes('videos') ||
    cleanQuery.includes('masterclass') ||
    cleanQuery.includes('lecture') ||
    cleanQuery.includes('classroom') ||
    cleanQuery.includes('curriculum');

  // 1. Search Compounds (690 Monographs) - High Priority
  for (const c of allCompounds) {
    let score = 0;
    const cName = c.name.toLowerCase();
    const cFull = (c.fullName || '').toLowerCase();
    const cCat = (c.category || '').toLowerCase();
    const cOverview = (c.overview || '').toLowerCase();
    const cMech = (c.mechanismOfAction || c.mechanism || '').toLowerCase();
    const cDose = (c.dosageRanges || c.dosing || '').toLowerCase();
    const cBody = (c.body || '').toLowerCase();
    const cRecon = (typeof c.reconstitution === 'string' ? c.reconstitution : c.reconstitution?.instructions || '').toLowerCase();
    const cStorage = (typeof c.storage === 'string' ? c.storage : `${c.storage?.beforeReconstitution || ''} ${c.storage?.afterReconstitution || ''}`).toLowerCase();
    const cSafety = (c.safetyWarnings || c.contraindications || '').toLowerCase();
    const cResearch = (Array.isArray(c.researchContexts) ? c.researchContexts.join(' ') : '').toLowerCase();

    // Direct query hit on compound name
    if (cName === cleanQuery) score += 100;
    else if (cName.includes(cleanQuery)) score += 60;
    else if (cFull.includes(cleanQuery)) score += 40;

    // Token scoring
    for (const token of tokenList) {
      if (cName === token) score += 50;
      else if (cName.includes(token)) score += 30;
      else if (cFull.includes(token)) score += 20;
      else if (cCat.includes(token)) score += 12;
      else if (cDose.includes(token)) score += 10;
      else if (cMech.includes(token)) score += 8;
      else if (cBody.includes(token)) score += 6;
      else if (cRecon.includes(token)) score += 5;
      else if (cResearch.includes(token)) score += 4;
      else if (cOverview.includes(token)) score += 3;
    }

    if (score > 0) {
      // Build comprehensive monograph text
      const monographParts = [
        `Compound: ${c.name} [Category: ${c.category}]`,
        c.fullName ? `Full Name: ${c.fullName}` : '',
        c.overview ? `Overview: ${c.overview}` : '',
        cMech ? `Mechanism of Action: ${c.mechanismOfAction || c.mechanism}` : '',
        cDose ? `Dosage & Titration: ${c.dosageRanges || c.dosing}` : '',
        cBody ? `Clinical Masterclass Monograph Body:\n${c.body.slice(0, 2200)}` : '',
        cRecon ? `Reconstitution: ${cRecon}` : '',
        cStorage ? `Storage & Stability: ${cStorage}` : '',
        cSafety ? `Safety & Contraindications: ${cSafety}` : '',
        cResearch ? `Research Contexts: ${cResearch}` : '',
      ].filter(Boolean);

      matchedDocs.push({
        title: `${c.name}${c.fullName ? ` (${c.fullName})` : ''}`,
        category: 'Knowledge Base',
        score,
        text: monographParts.join('\n\n'),
      });
    }
  }

  // 2. Search Vetted Protocols - High Priority
  for (const p of protocols) {
    let score = 0;
    const pName = p.name.toLowerCase();
    const pSub = (p.subtitle || p.tagline || '').toLowerCase();
    const pPrinciple = (p.corePrinciple || '').toLowerCase();
    const pInst = (p.instructions || '').toLowerCase();
    const pCycle = (p.cycleInfo || '').toLowerCase();
    const pDoseSteps = (p.doseSteps || []).map((s) => `${s.step}: ${s.dose} (${s.notes || ''})`).join(' ').toLowerCase();

    if (pName.includes(cleanQuery)) score += 50;

    for (const token of tokenList) {
      if (pName.includes(token)) score += 35;
      else if (pSub.includes(token)) score += 18;
      else if (pDoseSteps.includes(token)) score += 14;
      else if (pPrinciple.includes(token)) score += 10;
      else if (pCycle.includes(token)) score += 8;
      else if (pInst.includes(token)) score += 6;
    }

    if (score > 0) {
      const stepsFormatted = (p.doseSteps || [])
        .map((s) => `• Step ${s.step}: ${s.dose} — ${s.notes || ''}`)
        .join('\n');

      const reconFormatted = p.reconstitution?.table
        ? p.reconstitution.table.map((r) => `  - Vial ${r.vial}: ${r.water} -> ${r.concentration} (${r.reference})`).join('\n')
        : p.reconstitution?.instructions || '';

      matchedDocs.push({
        title: `Protocol: ${p.name}`,
        category: 'Vetted Protocol',
        score,
        text: [
          `Protocol: ${p.name}`,
          p.tagline ? `Tagline: ${p.tagline}` : '',
          p.corePrinciple ? `Core Principle: ${p.corePrinciple}` : '',
          p.cycleInfo ? `Cycle Info: ${p.cycleInfo}` : '',
          stepsFormatted ? `Titration Steps:\n${stepsFormatted}` : '',
          reconFormatted ? `Reconstitution Matrix:\n${reconFormatted}` : '',
          p.pdfUrl ? `Source Document: ${p.pdfUrl}` : '',
        ].filter(Boolean).join('\n'),
      });
    }
  }

  // 3. Search Classroom Lessons (797 Masterclasses)
  const lessons = lessonsData as Array<{ id: string; title: string; course: string; text: string; url: string }>;
  for (const l of lessons) {
    let score = 0;
    const lTitle = l.title.toLowerCase();
    const lCourse = l.course.toLowerCase();
    const lText = l.text.toLowerCase();

    if (lTitle.includes(cleanQuery)) score += 60;

    for (const token of tokenList) {
      if (lTitle === token) score += 45;
      else if (lTitle.includes(token)) score += 30;
      else if (lCourse.includes(token)) score += 15;
      else if (lText.includes(token)) score += 6;
    }

    if (isCourseQuery && score > 0) {
      score += 45; // Strongly prioritize classroom lessons when user specifically asks about a class/course/video
    }

    if (score > 0) {
      matchedDocs.push({
        title: `Masterclass: ${l.course} - ${l.title}`,
        category: 'Classroom Masterclass',
        score,
        url: l.url,
        text: `Classroom Lesson: "${l.title}"\nCourse / Module: ${l.course}\nCurriculum Content:\n${l.text.slice(0, 1400)}`,
      });
    }
  }

  // 4. Search Published Research & Regulatory Papers (31 Studies from PepPal Research Library)
  for (const r of researchPapers) {
    let score = 0;
    const rTitle = (r.title || '').toLowerCase();
    const rSummary = (r.summary || '').toLowerCase();
    const rSource = (r.source || '').toLowerCase();
    const rPeptides = (Array.isArray(r.peptides) ? r.peptides.join(' ') : '').toLowerCase();

    // If regulatory query, boost FDA/503B regulatory papers
    if (isRegulatoryQuery && (rTitle.includes('fda') || rTitle.includes('503b') || rSummary.includes('503b'))) {
      score += 25;
    }

    if (rTitle.includes(cleanQuery)) score += 35;

    for (const token of tokenList) {
      if (rTitle.includes(token)) score += 20;
      else if (rPeptides.includes(token)) score += 25; // Strongly match when target peptide is named
      else if (rSource.includes(token)) score += 8;
      else if (rSummary.includes(token)) score += 5;
    }

    if (score > 0) {
      matchedDocs.push({
        title: `Study/Paper: ${r.title} (${r.year || 'Ref'})`,
        category: 'Published Study',
        score,
        url: r.url || '',
        text: `Published Paper: "${r.title}"\nSource: ${r.source} (${r.year || 'N/A'})\nTarget Peptides: ${(r.peptides || []).join(', ')}\nCategory: ${r.category || 'Clinical'}\nSummary: ${(r.summary || '').slice(0, 800)}`,
      });
    }
  }

  // Sort descending by score
  matchedDocs.sort((a, b) => b.score - a.score);

  // Return deduplicated top results
  const seen = new Set<string>();
  const topDocs: RAGDocument[] = [];
  for (const doc of matchedDocs) {
    if (!seen.has(doc.title)) {
      seen.add(doc.title);
      topDocs.push(doc);
      if (topDocs.length >= maxResults) break;
    }
  }

  return topDocs;
}
