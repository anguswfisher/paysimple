export interface NotificationPreferences {
  compliance_risk_alerts: boolean
  payment_schedule_reminders: boolean
  lien_waiver_deadlines: boolean
  team_activity: boolean
  weekly_summary: boolean
}

export interface AIPreferences {
  default_contract_type: 'a101' | 'a102' | 'a103'
  flag_pay_when_paid: boolean
  auto_generate_schedule: boolean
  retainage_threshold: number
}

export interface UIPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  default_project_view?: 'list' | 'grid'
}

export interface UserSettings {
  id: string
  user_id: string
  notification_preferences: NotificationPreferences
  ai_preferences: AIPreferences
  ui_preferences: UIPreferences
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  name?: string
  company_name?: string
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
