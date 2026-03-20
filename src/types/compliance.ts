import { ComplianceFlag } from './project'

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  check: (terms: any) => ComplianceCheckResult;
}

export interface ComplianceCheckResult {
  passed: boolean;
  flag?: Partial<ComplianceFlag>;
  message?: string;
}

export interface ComplianceScore {
  overall: number;
  byCategory: {
    [category: string]: number;
  };
  flagCounts: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  completed: boolean;
  completed_at?: string;
  evidence?: string;
}

export interface ComplianceReport {
  project_id: string;
  score: ComplianceScore;
  flags: ComplianceFlag[];
  checklist: ChecklistItem[];
  generated_at: string;
}
