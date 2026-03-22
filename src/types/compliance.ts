import { ComplianceFlag } from './project'

export interface ComplianceRule {
  id: string
  name: string
  category: string
  severity: 'high' | 'medium' | 'low'
  rule_logic: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface ComplianceScore {
  id: string
  project_id: string
  overall_score: number
  category_scores: Record<string, number>
  last_calculated_at: string
}

export interface ComplianceMetrics {
  total_projects: number
  overall_score: number
  open_flags: number
  resolved_flags: number
  contracts_reviewed: number
  scores_by_project: Array<{
    project_id: string
    project_name: string
    score: number
  }>
}

export interface Resolution {
  resolved: boolean
  resolved_at?: string
  resolution_note?: string
  resolved_by?: string
}

export interface ComplianceCheckResult {
  passed: boolean
  flag?: Partial<ComplianceFlag>
  message?: string
}

export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: string
  required: boolean
  completed: boolean
  completed_at?: string
  evidence?: string
}

export interface ComplianceReport {
  project_id: string
  score: {
    overall: number
    byCategory: {
      [category: string]: number
    }
    flagCounts: {
      high: number
      medium: number
      low: number
    }
  }
  flags: ComplianceFlag[]
  checklist: ChecklistItem[]
  generated_at: string
}
