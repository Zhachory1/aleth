export enum InputType {
  TEXT = 'TEXT',
  URL = 'URL',
  IMAGE = 'IMAGE'
}

export enum FactCategory {
  SATIRE = 'Satire',
  CLICKBAIT = 'Clickbait',
  UNRELIABLE = 'Unreliable Sources',
  MISLEADING = 'Misleading',
  VERIFIED = 'Verified / High Credibility',
  INSUFFICIENT = 'Insufficient Evidence',
  UNKNOWN = 'Unknown'
}

export enum MisleadingSubCategory {
  TRUE = 'Technically True',
  PARTIAL = 'Partially True',
  TWISTED = 'Facts Twisted',
  FALSE_CONTEXT = 'False Context',
  FABRICATED = 'Fabricated / Total Fake',
  NONE = 'N/A'
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface ExternalCheck {
  organization: string; // e.g. Snopes, PolitiFact
  rating: string;      // e.g. "False", "Pants on Fire"
  url: string;
}

export interface EvidenceQuote {
  sourceUrl: string;
  quote: string;
}

export type ConfidenceState = 'High' | 'Medium' | 'Low' | 'Insufficient Evidence';

export interface FactCheckResult {
  truthScore: number; // 0 to 100
  sourceCredibilityScore: number; // 0 to 100
  category: FactCategory;
  subCategory: MisleadingSubCategory | null;
  summary: string;
  detailedAnalysis: string;
  groundingSources: WebSource[];
  externalFactChecks: ExternalCheck[];
  evidenceQuotes: EvidenceQuote[];
  confidenceState: ConfidenceState;
  modelUsed?: string; // Optional: track which model was used
}

export interface AnalysisHistoryItem extends FactCheckResult {
  id: string;
  timestamp: number;
  inputPreview: string;
  inputType: InputType;
}
