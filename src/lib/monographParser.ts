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

export interface DosingTableRow {
  form: string;
  text: string;
}

export interface MonographDosing {
  dose?: string;
  frequency?: string;
  weeklyPattern?: string;
  route?: string;
  tableRows?: DosingTableRow[];
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

export interface BloodworkTableRow {
  marker: string;
  symbol: string;
  direction: string;
  why: string;
  whatToDo: string;
}

export interface MonographBloodwork {
  intro?: string;
  tableRows: BloodworkTableRow[];
  disclaimer?: string;
  stacksSameAxis?: string;
  bluntsCompound?: string;
  addsToEffects?: string;
  clinicalNote?: string;
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

export function cleanSpacedDirectionText(str?: string): string {
  if (!str) return '';
  return str
    .replace(/(?:E\s*x\s*p\s*e\s*c\s*t\s*e\s*d\s+t\s*o\s+(?:r\s*i\s*s\s*e|f\s*a\s*l\s*l|w\s*o\s*r\s*s\s*e\s*n)|W\s*a\s*t\s*c\s*h\s+i\s*t|D\s*o\s+n\s*o\s*t\s+d\s*r\s*a\s*w)[\s\n]*/gi, '')
    .trim();
}

export function parseBloodworkSection(text: string): MonographBloodwork {
  const result: MonographBloodwork = {
    tableRows: [],
    fullText: text,
  };

  if (!text) return result;

  // 1. Intro guidance
  const introMatch = text.match(/8\s*·\s*BLOODWORK[^\n]*\n([\s\S]*?)(?=BLOODWORK\s*—\s*WHAT THIS COMPOUND IS EXPECTED TO MOVE|Marker\s+Direction|$)/i);
  if (introMatch) {
    result.intro = introMatch[1].trim();
  }

  // 2. Extract direction tokens list if present in text
  const dirTokensMatch = text.match(/(?:(?:E\s*x\s*p\s*e\s*c\s*t\s*e\s*d\s+t\s*o\s+(?:r\s*i\s*s\s*e|f\s*a\s*l\s*l|w\s*o\s*r\s*s\s*e\s*n)|W\s*a\s*t\s*c\s*h\s+i\s*t|D\s*o\s+n\s*o\s*t\s+d\s*r\s*a\s*w)[\s\n]*)+/gi);
  const foundDirections: string[] = [];
  if (dirTokensMatch) {
    for (const block of dirTokensMatch) {
      const tokens = block.match(/E\s*x\s*p\s*e\s*c\s*t\s*e\s*d\s+t\s*o\s+r\s*i\s*s\s*e|E\s*x\s*p\s*e\s*c\s*t\s*e\s*d\s+t\s*o\s+f\s*a\s*l\s*l|E\s*x\s*p\s*e\s*c\s*t\s*e\s*d\s+t\s*o\s+w\s*o\s*r\s*s\s*e\s*n|W\s*a\s*t\s*c\s*h\s+i\s*t|D\s*o\s+n\s*o\s*t\s+d\s*r\s*a\s*w/gi);
      if (tokens) {
        tokens.forEach(t => {
          const norm = t.replace(/\s+/g, ' ').toLowerCase();
          if (norm.includes('rise')) foundDirections.push('Expected to rise');
          else if (norm.includes('fall')) foundDirections.push('Expected to fall');
          else if (norm.includes('worsen')) foundDirections.push('Expected to worsen');
          else if (norm.includes('watch')) foundDirections.push('Watch it');
          else if (norm.includes('draw')) foundDirections.push('Do not draw');
        });
      }
    }
  }

  // 3. Extract table portion
  const tableMatch = text.match(/BLOODWORK\s*—\s*WHAT THIS COMPOUND IS EXPECTED TO MOVE[\s\S]*?Marker\s+Direction\s+Why\s+What to do about it\s*\n([\s\S]*?)(?=Predicted from mechanism|Stacks on the same axis|Blunts this compound|Adds to its|SOURCING|$)/i);

  if (tableMatch) {
    const tableRaw = cleanSpacedDirectionText(tableMatch[1].trim());

    const symbolRegex = /([▲▼●✕])/g;
    const symMatches: Array<{ symbol: string; index: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = symbolRegex.exec(tableRaw)) !== null) {
      symMatches.push({ symbol: m[1], index: m.index });
    }

    if (symMatches.length > 0) {
      let marker0 = tableRaw.substring(0, symMatches[0].index).trim();

      for (let i = 0; i < symMatches.length; i++) {
        const curSym = symMatches[i].symbol;
        const curSymIdx = symMatches[i].index;

        const nextSymIdx = (i + 1 < symMatches.length) ? symMatches[i + 1].index : tableRaw.length;
        const chunk = tableRaw.substring(curSymIdx + 1, nextSymIdx).trim();

        let bodyText = chunk;
        let nextMarker = '';

        if (i + 1 < symMatches.length) {
          const lastDotMatch = chunk.match(/([\s\S]*\.)(?:\s*\n+)([\s\S]+)$/);
          if (lastDotMatch) {
            bodyText = lastDotMatch[1].trim();
            nextMarker = lastDotMatch[2].trim();
          } else {
            const lastPeriod = chunk.lastIndexOf('.');
            if (lastPeriod !== -1 && lastPeriod < chunk.length - 1) {
              bodyText = chunk.substring(0, lastPeriod + 1).trim();
              nextMarker = chunk.substring(lastPeriod + 1).trim();
            }
          }
        }

        const curMarker = marker0;
        marker0 = nextMarker;

        let direction = '';
        if (i < foundDirections.length) {
          direction = foundDirections[i];
        } else {
          if (curSym === '▲') direction = curMarker.toLowerCase().includes('lipid') ? 'Expected to worsen' : 'Expected to rise';
          else if (curSym === '▼') direction = 'Expected to fall';
          else if (curSym === '●') direction = 'Watch it';
          else if (curSym === '✕') direction = 'Do not draw';
        }

        // Split bodyText into Why and What to do about it
        let why = bodyText;
        let whatToDo = '';

        const actionRegex = /(Relevant if fertility|This is the number that decides|Baseline (?:and|before|liver|panel|is)|Draw at the same point|If you are reading|Read total and|Twice a year|Annual is fine|Take a resting|Do not use|Pair it with|Run a full thyroid|Worth a baseline|Worth knowing|The honest use of these markers|Check fasting insulin|Test (?:it|don't)|Dehydration on the draw|Separate by four hours)/i;
        const splitMatch = bodyText.search(actionRegex);
        if (splitMatch !== -1 && splitMatch > 10) {
          why = bodyText.substring(0, splitMatch).trim();
          whatToDo = bodyText.substring(splitMatch).trim();
        }

        result.tableRows.push({
          marker: curMarker.replace(/\n+/g, ' ').trim(),
          symbol: curSym,
          direction: direction || (curSym === '▲' ? 'Expected to rise' : curSym === '▼' ? 'Expected to fall' : 'Watch it'),
          why: why.replace(/\n+/g, ' ').trim(),
          whatToDo: whatToDo.replace(/\n+/g, ' ').trim(),
        });
      }
    }
  }

  // 4. Disclaimer note
  const discMatch = text.match(/Predicted from mechanism, not from an interaction study[\s\S]*?(?=Stacks on the same axis|Blunts this compound|Adds to its|SOURCING|$)/i);
  if (discMatch) {
    result.disclaimer = discMatch[0].trim().replace(/\n+/g, ' ');
  }

  // 5. Interactions
  const stackMatch = text.match(/Stacks on the same axis\s+([\s\S]*?)(?=Blunts this compound|Adds to its|SOURCING|$)/i);
  if (stackMatch) result.stacksSameAxis = cleanSpacedDirectionText(stackMatch[1]);

  const bluntMatch = text.match(/Blunts this compound\s+([\s\S]*?)(?=Adds to its|SOURCING|$)/i);
  if (bluntMatch) result.bluntsCompound = cleanSpacedDirectionText(bluntMatch[1]);

  const addsMatch = text.match(/Adds to its e[fﬀ]+ects\s+([\s\S]*?)(?=The honest position|SOURCING|$)/i);
  if (addsMatch) result.addsToEffects = cleanSpacedDirectionText(addsMatch[1]);

  const noteMatch = text.match(/The honest position on this class[\s\S]*?(?=SOURCING|$)/i);
  if (noteMatch) result.clinicalNote = cleanSpacedDirectionText(noteMatch[0]);

  return result;
}

export function parseDosingSection(text: string): { fullText: string; tableRows?: DosingTableRow[] } {
  if (!text) return { fullText: '' };

  const tableHeaderMatch = text.match(/DOSING BY ADMINISTRATION FORM\s*\n([\s\S]*?)(?=5 ·|6 ·|7 ·|THE PRACTICAL TAKE|$)/i);
  if (!tableHeaderMatch) {
    return { fullText: text };
  }

  const tableRaw = tableHeaderMatch[1].trim();
  const lines = tableRaw.split('\n').map(l => l.trim()).filter(Boolean);

  const formRegex = /^(Injectable|Oral|Topical|Nasal|Sublingual|Transdermal|Subcutaneous)\b/i;
  const rows: DosingTableRow[] = [];
  let currentForm: string | null = null;
  let currentChunks: string[] = [];

  for (const line of lines) {
    if (/^Form\s+Dose\s+Route/i.test(line)) continue;

    const m = line.match(formRegex);
    if (m) {
      if (currentForm) {
        rows.push({ form: currentForm, text: currentChunks.join(' ') });
      }
      currentForm = m[1];
      currentChunks = [line.substring(m[0].length).trim()];
    } else if (currentForm) {
      currentChunks.push(line);
    }
  }
  if (currentForm) {
    rows.push({ form: currentForm, text: currentChunks.join(' ') });
  }

  return {
    fullText: text,
    tableRows: rows.length > 0 ? rows : undefined
  };
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
    bloodwork: { tableRows: [], fullText: '' },
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

      const parsedDosing = parseDosingSection(text);
      if (parsedDosing.tableRows) {
        result.dosing.tableRows = parsedDosing.tableRows;
      }
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
      result.bloodwork = parseBloodworkSection(text);
    } else if (key === 'sourcing') {
      result.sourcing = (result.sourcing ? result.sourcing + '\n\n' : '') + text;
    }
  }

  return result;
}
