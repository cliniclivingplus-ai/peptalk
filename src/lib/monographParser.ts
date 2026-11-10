/**
 * Monograph Parser for PepTalk Knowledge Base
 * Parses structured markdown/text monographs from the Vault and Core Peptides
 * into rich, cleanly formatted UI sections.
 */

export interface MonographMetadata {
  alsoKnownAs?: string;
  category?: string;
  availableForms?: string;
  halfLife?: string;
  evidenceGrade?: string;
  primaryRoute?: string;
}

export interface MonographEvidence {
  clinicalTrial?: string;
  correlative?: string;
  fullText: string;
}

export interface MonographDosing {
  dose?: string;
  frequency?: string;
  weeklyPattern?: string;
  route?: string;
  fullText: string;
}

export interface MonographSafety {
  predicted?: string;
  observed?: string;
  avoidIf?: string;
  whatIsNotKnown?: string;
  howToRunSafely?: string;
  howToJudgeIt?: string;
  fullText: string;
}

export interface MonographBloodwork {
  summary?: string;
  stacksSameAxis?: string;
  bluntsCompound?: string;
  addsToEffects?: string;
  fullText: string;
}

export interface ParsedMonograph {
  whatItIs: string;
  metadata: MonographMetadata;
  mechanism: string;
  evidence: MonographEvidence;
  dosing: MonographDosing;
  practicalTake: string;
  safetyProfile: MonographSafety;
  bloodwork: MonographBloodwork;
  sourcing: string;
  rawSections: Array<{ title: string; content: string }>;
}

export function parseVaultMonograph(body: string): ParsedMonograph {
  const result: ParsedMonograph = {
    whatItIs: '',
    metadata: {},
    mechanism: '',
    evidence: { fullText: '' },
    dosing: { fullText: '' },
    practicalTake: '',
    safetyProfile: { fullText: '' },
    bloodwork: { fullText: '' },
    sourcing: '',
    rawSections: [],
  };

  if (!body) return result;

  const lines = body.split('\n');
  let currentKey = 'header';
  let buffer: string[] = [];

  const rawBlocks: Array<{ key: string; text: string }> = [];

  function flush() {
    const text = buffer.join('\n').trim();
    if (text) {
      rawBlocks.push({ key: currentKey, text });
      result.rawSections.push({ title: currentKey, content: text });
    }
    buffer = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^1\s*·\s*WHAT IT IS/i.test(trimmed)) {
      flush();
      currentKey = 'whatItIs';
    } else if (/^2\s*·\s*(FUNCTION|MECHANISM|HOW TO USE)/i.test(trimmed)) {
      flush();
      currentKey = 'mechanism';
    } else if (/^[23]\s*·\s*EVIDENCE/i.test(trimmed)) {
      flush();
      currentKey = 'evidence';
    } else if (/^[34]\s*·\s*DOSING/i.test(trimmed)) {
      flush();
      currentKey = 'dosing';
    } else if (/^[56]\s*·\s*THE PRACTICAL TAKE/i.test(trimmed)) {
      flush();
      currentKey = 'practicalTake';
    } else if (/^[47]\s*·\s*SAFETY/i.test(trimmed)) {
      flush();
      currentKey = 'safetyProfile';
    } else if (/^8\s*·\s*BLOODWORK/i.test(trimmed)) {
      flush();
      currentKey = 'bloodwork';
    } else if (/^SOURCING/i.test(trimmed)) {
      flush();
      currentKey = 'sourcing';
    } else {
      buffer.push(line);
    }
  }
  flush();

  // Process each block
  for (const block of rawBlocks) {
    const { key, text } = block;

    if (key === 'whatItIs') {
      result.whatItIs = text;

      // Extract metadata tags
      const meta = result.metadata;
      const akaMatch = text.match(/ALSO KNOWN AS\s+([^A-Z\n]+?)(?=\s+[A-Z]{3,}|$|\n)/i);
      if (akaMatch) meta.alsoKnownAs = akaMatch[1].trim();

      const catMatch = text.match(/CATEGORY\s+([^A-Z\n]+?)(?=\s+[A-Z]{3,}|$|\n)/i);
      if (catMatch) meta.category = catMatch[1].trim();

      const formsMatch = text.match(/AVAILABLE FORMS\s+([^A-Z\n]+?)(?=\s+[A-Z]{3,}|$|\n)/i);
      if (formsMatch) meta.availableForms = formsMatch[1].trim();

      const hlMatch = text.match(/HALF-LIFE\s+([^A-Z\n]+?)(?=\s+[A-Z]{3,}|$|\n)/i);
      if (hlMatch) meta.halfLife = hlMatch[1].trim();

      const egMatch = text.match(/EVIDENCE GRADE\s+([\s\S]+?)(?=\s+PRIMARY ROUTE|$|\n[A-Z])/i);
      if (egMatch) meta.evidenceGrade = egMatch[1].trim();

      const routeMatch = text.match(/PRIMARY ROUTE\s+([\s\S]+?)(?=$|\n[A-Z])/i);
      if (routeMatch) meta.primaryRoute = routeMatch[1].trim();
    } else if (key === 'mechanism') {
      result.mechanism = (result.mechanism ? result.mechanism + '\n\n' : '') + text;
    } else if (key === 'evidence') {
      result.evidence.fullText = (result.evidence.fullText ? result.evidence.fullText + '\n\n' : '') + text;

      const trialMatch = text.match(/CLINICAL \/ TRIAL EVIDENCE\s+([\s\S]*?)(?=CORRELATIVE & REAL-WORLD USE|$)/i);
      if (trialMatch) result.evidence.clinicalTrial = trialMatch[1].trim();

      const corrMatch = text.match(/CORRELATIVE & REAL-WORLD USE\s+([\s\S]*?)$/i);
      if (corrMatch) result.evidence.correlative = corrMatch[1].trim();
    } else if (key === 'dosing') {
      result.dosing.fullText = (result.dosing.fullText ? result.dosing.fullText + '\n\n' : '') + text;

      const doseMatch = text.match(/DOSE\s+([^F\n]+?)(?=\s+FREQUENCY|$|\n)/i);
      if (doseMatch) result.dosing.dose = doseMatch[1].trim();

      const freqMatch = text.match(/FREQUENCY[^\s]*\s+([^W\n]+?)(?=\s+WEEKLY|$|\n)/i);
      if (freqMatch) result.dosing.frequency = freqMatch[1].trim();

      const weekMatch = text.match(/WEEKLY PATTERN\s+([^R\n]+?)(?=\s+ROUTE|$|\n)/i);
      if (weekMatch) result.dosing.weeklyPattern = weekMatch[1].trim();

      const routeMatch = text.match(/ROUTE\s+([^\n]+)/i);
      if (routeMatch) result.dosing.route = routeMatch[1].trim();
    } else if (key === 'practicalTake') {
      result.practicalTake = (result.practicalTake ? result.practicalTake + '\n\n' : '') + text;
    } else if (key === 'safetyProfile') {
      result.safetyProfile.fullText = (result.safetyProfile.fullText ? result.safetyProfile.fullText + '\n\n' : '') + text;

      const predMatch = text.match(/Predicted from mechanism\s+([\s\S]*?)(?=Observed in use|Avoid if|$)/i);
      if (predMatch) result.safetyProfile.predicted = predMatch[1].trim();

      const obsMatch = text.match(/Observed in use\s+([\s\S]*?)(?=Avoid if|What is not known|$)/i);
      if (obsMatch) result.safetyProfile.observed = obsMatch[1].trim();

      const avoidMatch = text.match(/Avoid if\s+([\s\S]*?)(?=What is not known|How to run|$)/i);
      if (avoidMatch) result.safetyProfile.avoidIf = avoidMatch[1].trim();

      const notKnownMatch = text.match(/What is not known\s+([\s\S]*?)(?=How to run|How to judge|$)/i);
      if (notKnownMatch) result.safetyProfile.whatIsNotKnown = notKnownMatch[1].trim();

      const howRunMatch = text.match(/How to run it more safely\s+([\s\S]*?)(?=How to judge|$)/i);
      if (howRunMatch) result.safetyProfile.howToRunSafely = howRunMatch[1].trim();

      const howJudgeMatch = text.match(/How to judge it\s+([\s\S]*?)$/i);
      if (howJudgeMatch) result.safetyProfile.howToJudgeIt = howJudgeMatch[1].trim();
    } else if (key === 'bloodwork') {
      result.bloodwork.fullText = (result.bloodwork.fullText ? result.bloodwork.fullText + '\n\n' : '') + text;

      const stackMatch = text.match(/Stacks on the same axis\s+([\s\S]*?)(?=Blunts this compound|Adds to its|$)/i);
      if (stackMatch) result.bloodwork.stacksSameAxis = stackMatch[1].trim();

      const bluntMatch = text.match(/Blunts this compound\s+([\s\S]*?)(?=Adds to its|$)/i);
      if (bluntMatch) result.bloodwork.bluntsCompound = bluntMatch[1].trim();

      const addsMatch = text.match(/Adds to its e[fﬀ]+ects\s+([\s\S]*?)$/i);
      if (addsMatch) result.bloodwork.addsToEffects = addsMatch[1].trim();
    } else if (key === 'sourcing') {
      result.sourcing = (result.sourcing ? result.sourcing + '\n\n' : '') + text;
    }
  }

  return result;
}
