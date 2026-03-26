export interface UserSettings {
  id: string
  user_id: string
  
  // Profile
  first_name: string | null
  last_name: string | null
  company: string | null
  
  // Notifications
  notify_compliance_risks: boolean
  notify_payment_reminders: boolean
  notify_lien_deadlines: boolean
  notify_team_activity: boolean
  notify_weekly_summary: boolean
  
  // AI Extraction Preferences
  default_contract_type: 'AIA A101' | 'AIA A102' | 'AIA A103'
  flag_pay_when_paid: boolean
  auto_generate_schedule: boolean
  default_retainage_threshold: '5%' | '10%' | '15%'
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  notify_compliance_risks: boolean
  notify_payment_reminders: boolean
  notify_lien_deadlines: boolean
  notify_team_activity: boolean
  notify_weekly_summary: boolean
}

export interface AIPreferences {
  default_contract_type: 'AIA A101' | 'AIA A102' | 'AIA A103'
  flag_pay_when_paid: boolean
  auto_generate_schedule: boolean
  default_retainage_threshold: '5%' | '10%' | '15%'
}

export interface ProfileData {
  first_name: string | null
  last_name: string | null
  company: string | null
}

export interface UserProfile {
  id: string
  name: string | null
  company_name: string | null
  subscription_tier: 'free' | 'pro' | 'team'
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}
