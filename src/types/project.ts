export interface Project {
  id: string;
  user_id: string;
  name: string;
  contract_file_url?: string;
  contract_text?: string;
  status: 'uploaded' | 'processing' | 'reviewed' | 'complete';
  created_at: string;
  updated_at: string;
}

export interface ExtractedTerm {
  id: string;
  project_id: string;
  category: 'contract_basics' | 'payment_terms' | 'retainage' | 'milestones' | 'insurance' | 'lien_waivers' | 'change_orders';
  field_name: string;
  extracted_value: any;
  confidence_score: number;
  source_location?: string;
  user_override?: any;
  created_at: string;
}

export interface PaymentSchedule {
  id: string;
  project_id: string;
  version: number;
  schedule_data: PaymentScheduleItem[];
  total_contract_sum: number;
  total_retainage: number;
  is_active: boolean;
  created_at: string;
}

export interface PaymentScheduleItem {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  retainage_percentage?: number;
  retainage_amount?: number;
  net_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  milestone?: string;
}

export interface ComplianceFlag {
  id: string;
  project_id: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description?: string;
  recommendation?: string;
  source_clause?: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  company_name?: string;
  subscription_tier: 'free' | 'pro' | 'team';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}
