export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Clause {
  id: string;
  sectionHeading: string;
  text: string;
  category: string;
  riskLevel: RiskLevel;
  riskScore: number;
  isHidden: boolean;
  explanation: string;
  recommendation: string;
  orderIndex: number;
}

export interface HiddenClause {
  clauseId: string;
  sectionHeading: string;
  snippet: string;
  category: string;
  riskLevel: RiskLevel;
  reason: string;
}

export interface RiskCategory {
  name: string;
  risk: number;
  level: RiskLevel;
}

export interface RadarMetric {
  subject: string;
  A: number;
  fullMark: number;
}

export interface ScoreComparison {
  name: string;
  score: number;
}

export interface GraphData {
  riskRadar: RadarMetric[];
  scoreComparison: ScoreComparison[];
}

export interface LegalAnalysisResult {
  documentId?: string;
  summary: string;
  overallRisk: number; // 0-100
  recommendation: 'Safe to Accept' | 'Proceed Carefully' | 'Reject or Request Revisions';
  trustScore: number;
  transparencyScore: number;
  privacyScore: number;
  financialRisk: number;
  complianceRisk: number;
  pros: string[];
  cons: string[];
  graphData: GraphData;
  hiddenClauses: HiddenClause[];
  riskCategories: RiskCategory[];
  clauses: Clause[];
  confidence: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citedClauses?: string[];
}

export interface HistoryItem {
  id: string;
  title: string;
  url?: string;
  createdAt: string;
  overallRisk: number;
  recommendation: string;
  trustScore: number;
  privacyScore: number;
}
