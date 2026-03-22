export type ExportType = 'payment_schedule_pdf' | 'schedule_csv' | 'compliance_pdf' | 'terms_docx' | 'payment_history_csv' | 'project_bundle'

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ExportJob {
  id: string
  user_id: string
  project_id: string | null
  export_type: ExportType
  status: ExportStatus
  file_url: string | null
  file_size: number | null
  file_name: string | null
  error_message: string | null
  metadata: Record<string, any>
  created_at: string
  completed_at: string | null
  // Joined project data
  project?: {
    id: string
    name: string
  }
}

export interface ExportTemplate {
  id: string
  name: string
  export_type: ExportType
  template_config: Record<string, any>
  is_default: boolean
  created_by: string | null
  created_at: string
}

export interface ExportFilters {
  type?: ExportType
  project_id?: string
  status?: ExportStatus
  date_from?: string
  date_to?: string
}

export interface ScheduleData {
  project_id: string
  schedule_items: Array<{
    description: string
    amount: number
    retainage: number
    due_date: string
  }>
  total_contract_sum: number
  total_retainage: number
}

export interface ComplianceData {
  project_id: string
  flags: Array<{
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
    category: string
  }>
  overall_score: number
  category_scores: Record<string, number>
}
