import { supabase } from '@/lib/supabase/client'
import { UserSettings, NotificationPreferences, AIPreferences, UIPreferences, ProfileUpdate, UserProfile } from '@/types/settings'

export class SettingsService {
  async updateProfile(data: ProfileUpdate): Promise<UserProfile> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data: profile, error } = await (supabase
      .from('profiles') as any)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw new Error('Failed to update profile')
    }

    return profile as UserProfile
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Validate and sanitize preferences
    const sanitizedPrefs = this.sanitizeNotificationPrefs(preferences)

    const { error } = await (supabase
      .from('user_settings') as any)
      .update({
        notification_preferences: sanitizedPrefs,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating notification preferences:', error)
      throw new Error('Failed to update notification preferences')
    }
  }

  async updateAIPreferences(preferences: Partial<AIPreferences>): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Validate AI preferences
    const validatedPrefs = this.validateAIPreferences(preferences)

    const { error } = await (supabase
      .from('user_settings') as any)
      .update({
        ai_preferences: validatedPrefs,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating AI preferences:', error)
      throw new Error('Failed to update AI preferences')
    }
  }

  async updateUIPreferences(preferences: Partial<UIPreferences>): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { error } = await (supabase
      .from('user_settings') as any)
      .update({
        ui_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating UI preferences:', error)
      throw new Error('Failed to update UI preferences')
    }
  }

  async getSettings(): Promise<UserSettings> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await (supabase
      .from('user_settings') as any)
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching settings:', error)
      throw new Error('Failed to fetch settings')
    }

    // If no settings exist, create default settings
    if (!data) {
      return await this.createDefaultSettings(user.id)
    }

    return data as UserSettings
  }

  async getProfile(): Promise<UserProfile> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      throw new Error('Failed to fetch profile')
    }

    return data as UserProfile
  }

  async deleteAccount(): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // This is a dangerous operation - you might want to add additional confirmation steps
    // or implement a soft delete instead
    
    // Delete user's data (cascade will handle related tables)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (error) {
      console.error('Error deleting account:', error)
      throw new Error('Failed to delete account')
    }

    // Sign out the user
    await supabase.auth.signOut()
  }

  private async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings = {
      user_id: userId,
      notification_preferences: {
        compliance_risk_alerts: true,
        payment_schedule_reminders: true,
        lien_waiver_deadlines: true,
        team_activity: false,
        weekly_summary: true
      },
      ai_preferences: {
        default_contract_type: 'a101',
        flag_pay_when_paid: true,
        auto_generate_schedule: true,
        retainage_threshold: 10
      },
      ui_preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        default_project_view: 'list'
      }
    }

    const { data, error } = await (supabase
      .from('user_settings') as any)
      .insert(defaultSettings)
      .select()
      .single()

    if (error) {
      console.error('Error creating default settings:', error)
      throw new Error('Failed to create default settings')
    }

    return data as UserSettings
  }

  private sanitizeNotificationPrefs(prefs: Partial<NotificationPreferences>): Partial<NotificationPreferences> {
    const sanitized: Partial<NotificationPreferences> = {}
    
    if (prefs.compliance_risk_alerts !== undefined) {
      sanitized.compliance_risk_alerts = Boolean(prefs.compliance_risk_alerts)
    }
    if (prefs.payment_schedule_reminders !== undefined) {
      sanitized.payment_schedule_reminders = Boolean(prefs.payment_schedule_reminders)
    }
    if (prefs.lien_waiver_deadlines !== undefined) {
      sanitized.lien_waiver_deadlines = Boolean(prefs.lien_waiver_deadlines)
    }
    if (prefs.team_activity !== undefined) {
      sanitized.team_activity = Boolean(prefs.team_activity)
    }
    if (prefs.weekly_summary !== undefined) {
      sanitized.weekly_summary = Boolean(prefs.weekly_summary)
    }

    return sanitized
  }

  private validateAIPreferences(prefs: Partial<AIPreferences>): Partial<AIPreferences> {
    const validated: Partial<AIPreferences> = {}

    if (prefs.default_contract_type !== undefined) {
      const validTypes = ['a101', 'a102', 'a103']
      if (validTypes.includes(prefs.default_contract_type)) {
        validated.default_contract_type = prefs.default_contract_type as 'a101' | 'a102' | 'a103'
      }
    }

    if (prefs.flag_pay_when_paid !== undefined) {
      validated.flag_pay_when_paid = Boolean(prefs.flag_pay_when_paid)
    }

    if (prefs.auto_generate_schedule !== undefined) {
      validated.auto_generate_schedule = Boolean(prefs.auto_generate_schedule)
    }

    if (prefs.retainage_threshold !== undefined) {
      const threshold = Number(prefs.retainage_threshold)
      if (threshold >= 0 && threshold <= 100) {
        validated.retainage_threshold = threshold
      }
    }

    return validated
  }

  private validateSettings(data: UserSettings): boolean {
    // Basic validation - you could expand this with more sophisticated checks
    if (!data.user_id) return false
    if (!data.notification_preferences) return false
    if (!data.ai_preferences) return false
    if (!data.ui_preferences) return false

    return true
  }
}
