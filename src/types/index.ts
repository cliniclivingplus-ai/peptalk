export type ViewMode =
  | 'chat'
  | 'knowledge'
  | 'compound_detail'
  | 'protocols'
  | 'protocol_detail'
  | 'classroom'
  | 'course_viewer'
  | 'calculator'
  | 'research';

export type KbTabType = 'core' | 'vault_peptide' | 'vault_supplement' | 'vault_cosmetic' | 'vault_goal';

export interface ResearchPaperRef {
  title: string;
  journal?: string;
  year?: string | number;
  summary: string;
  url?: string;
  topic?: string;
  [key: string]: any;
}

export interface ReconstitutionTableItem {
  vialSize?: string;
  bacWater?: string;
  concentration?: string;
  doseRef?: string;
  [key: string]: any;
}

export interface ReconstitutionGuide {
  vialSize?: string;
  waterVolume?: string;
  concentration?: string;
  typicalVialSize?: string;
  typicalWaterVolume?: string;
  typicalConcentration?: string;
  instructions?: string;
  table?: ReconstitutionTableItem[];
  note?: string;
  [key: string]: any;
}

export interface StorageGuidelines {
  before?: string;
  after?: string;
  beforeReconstitution?: string;
  afterReconstitution?: string;
  halfLife?: string;
  stability?: string;
  [key: string]: any;
}

export interface Compound {
  id?: string;
  name: string;
  fullName?: string;
  aka?: string;
  kind?: string;
  category: string;
  tagline?: string;
  overview?: string;
  body?: string;
  mechanism?: string;
  contexts?: string[];
  dosing?: string;
  reconstitution?: ReconstitutionGuide | string | any;
  storage?: StorageGuidelines | any;
  papers?: ResearchPaperRef[];
  publishedPapers?: ResearchPaperRef[];
  [key: string]: any;
}

export interface Protocol {
  id: string;
  slug?: string;
  name: string;
  subtitle?: string;
  tagline?: string;
  corePrinciple?: string;
  cycleInfo?: string;
  instructions?: string;
  dosingSchedule?: string;
  tableRows?: ReconstitutionTableItem[];
  note?: string;
  pdfUrl?: string;
  whatIsIt?: string;
  whatDoesItDo?: string;
  summary?: string;
  bulletPoints?: string[];
  [key: string]: any;
}

export interface Lesson {
  title: string;
  clean_title?: string;
  status?: string;
  characters?: number;
  images?: number;
  source?: string;
  [key: string]: any;
}

export interface Course {
  id: string;
  title: string;
  clean_title?: string;
  topic: string;
  category: string;
  local_file: string;
  lesson_count: number;
  lessons: Lesson[];
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface CalculatorState {
  mg: number;
  ml: number;
  dose: number;
  unit: 'mcg' | 'mg';
  unitsDisplay: string;
  concDisplay: string;
}
