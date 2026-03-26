'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { cookies } from 'next/headers'
import { UserSettings, NotificationSettings, AIPreferences, ProfileData } from '@/types/settings'

async function getSupabaseClient() {
  const cookieStore = cookies()
  
  // Try different cookie names that Supabase might use
  const possibleCookieNames = [
    'sb-access-token',
    'sb-refresh-token', 
    'supabase.auth.token',
    'auth-token',
    'access_token',
    'refresh_token'
  ]
  
  let accessToken: string | undefined
  let refreshToken: string | undefined
  
  // Debug: log all cookies
  const allCookies = cookieStore.getAll()
  console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })))
  
  for (const cookie of allCookies) {
    if (cookie.name.includes('access') || cookie.name.includes('token')) {
      console.log(`Found potential token cookie: ${cookie.name}`)
      accessToken = cookie.value
    }
    if (cookie.name.includes('refresh')) {
      refreshToken = cookie.value
    }
  }
  
  // Create Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  if (accessToken) {
    console.log('Setting session with token')
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    })
    
    if (error) {
      console.error('Session error:', error)
      throw new Error('Invalid token: ' + error.message)
    }
  } else {
    console.log('No access token found in cookies')
    throw new Error('No authentication token found in cookies')
  }

  return supabase
}

export async function getUserSettings(): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
  try {
    const supabase = await getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get user settings
    const { data: settings, error } = await (supabase
      .from('user_settings') as any)
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return { success: false, error: error.message }
    }

    // If no settings exist, create default ones
    if (!settings) {
      const { data: newSettings, error: insertError } = await (supabase
        .from('user_settings') as any)
        .insert({ user_id: user.id })
        .select()
        .single()

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      return { success: true, data: newSettings }
    }

    return { success: true, data: settings }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch settings' }
  }
}

export async function updateProfile(data: ProfileData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Update profile settings
    const { error } = await (supabase
      .from('user_settings') as any)
      .upsert({
        user_id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        company: data.company,
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' }
  }
}

export async function updateNotifications(data: NotificationSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Update notification settings
    const { error } = await (supabase
      .from('user_settings') as any)
      .upsert({
        user_id: user.id,
        notify_compliance_risks: data.notify_compliance_risks,
        notify_payment_reminders: data.notify_payment_reminders,
        notify_lien_deadlines: data.notify_lien_deadlines,
        notify_team_activity: data.notify_team_activity,
        notify_weekly_summary: data.notify_weekly_summary,
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update notifications' }
  }
}

export async function updateAIPreferences(data: AIPreferences): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Update AI preferences
    const { error } = await (supabase
      .from('user_settings') as any)
      .upsert({
        user_id: user.id,
        default_contract_type: data.default_contract_type,
        flag_pay_when_paid: data.flag_pay_when_paid,
        auto_generate_schedule: data.auto_generate_schedule,
        default_retainage_threshold: data.default_retainage_threshold,
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update AI preferences' }
  }
}
