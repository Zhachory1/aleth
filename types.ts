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

export interface FactCheckResult {
  truthScore: number; // 0 to 100
  sourceCredibilityScore: number; // 0 to 100
  category: FactCategory;
  subCategory: MisleadingSubCategory | null;
  summary: string;
  detailedAnalysis: string;
  groundingSources: WebSource[];
  externalFactChecks: ExternalCheck[];
}

export interface AnalysisHistoryItem extends FactCheckResult {
  id: string;
  timestamp: number;
  inputPreview: string;
  inputType: InputType;
}
