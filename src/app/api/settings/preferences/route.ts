import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Create server-side Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user using same pattern as team API
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get user settings
    const { data: settings, error } = await (supabase
      .from('user_settings') as any)
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // If no settings exist, create default ones
    if (!settings) {
      const { data: newSettings, error: insertError } = await (supabase
        .from('user_settings') as any)
        .insert({
          user_id: user.id,
          first_name: null,
          last_name: null,
          company: null,
          notify_compliance_risks: true,
          notify_payment_reminders: true,
          notify_lien_deadlines: true,
          notify_team_activity: false,
          notify_weekly_summary: true,
          default_contract_type: 'AIA A101',
          flag_pay_when_paid: true,
          auto_generate_schedule: true,
          default_retainage_threshold: '10%'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating default settings:', insertError)
        return NextResponse.json(
          { error: 'Failed to create default settings' },
          { status: 500 }
        )
      }

      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in settings GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT request received for settings preferences')
    
    // Get authenticated user using same pattern as team API
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('Token length:', token.length)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'User not authenticated', details: authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.log('No user found')
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    const body = await request.json()
    console.log('Request body:', body)
    
    const { notify_compliance_risks, notify_payment_reminders, notify_lien_deadlines, notify_team_activity, notify_weekly_summary, default_contract_type, flag_pay_when_paid, auto_generate_schedule, default_retainage_threshold, first_name, last_name, company } = body

    // Update settings
    const updateData: any = {}
    
    if (notify_compliance_risks !== undefined) updateData.notify_compliance_risks = notify_compliance_risks
    if (notify_payment_reminders !== undefined) updateData.notify_payment_reminders = notify_payment_reminders
    if (notify_lien_deadlines !== undefined) updateData.notify_lien_deadlines = notify_lien_deadlines
    if (notify_team_activity !== undefined) updateData.notify_team_activity = notify_team_activity
    if (notify_weekly_summary !== undefined) updateData.notify_weekly_summary = notify_weekly_summary
    if (default_contract_type !== undefined) updateData.default_contract_type = default_contract_type
    if (flag_pay_when_paid !== undefined) updateData.flag_pay_when_paid = flag_pay_when_paid
    if (auto_generate_schedule !== undefined) updateData.auto_generate_schedule = auto_generate_schedule
    if (default_retainage_threshold !== undefined) updateData.default_retainage_threshold = default_retainage_threshold
    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (company !== undefined) updateData.company = company

    console.log('Update data:', updateData)

    // First try to update existing settings
    let updatedSettings
    let error

    console.log('Checking if settings exist for user:', user.id)
    const { data: existingSettings, error: checkError } = await (supabase
      .from('user_settings') as any)
      .select('id')
      .eq('user_id', user.id)
      .single()

    console.log('Existing settings check:', { existingSettings, checkError })

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing settings:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing settings', details: checkError.message },
        { status: 500 }
      )
    }

    if (existingSettings) {
      console.log('Updating existing settings')
      // Update existing settings
      const result = await (supabase
        .from('user_settings') as any)
        .update(updateData)
        .eq('user_id', user.id)
      
      error = result.error
      console.log('Update result:', { error })
      
      if (!error) {
        // Fetch the updated settings
        const { data: updatedData } = await (supabase
          .from('user_settings') as any)
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        updatedSettings = updatedData
        console.log('Fetched updated settings:', updatedSettings)
      }
    } else {
      console.log('Creating new settings')
      // Create new settings with the provided fields plus defaults
      const defaultSettings = {
        user_id: user.id,
        first_name: null,
        last_name: null,
        company: null,
        notify_compliance_risks: true,
        notify_payment_reminders: true,
        notify_lien_deadlines: true,
        notify_team_activity: false,
        notify_weekly_summary: true,
        default_contract_type: 'AIA A101',
        flag_pay_when_paid: true,
        auto_generate_schedule: true,
        default_retainage_threshold: '10%',
        ...updateData // Override with provided values
      }

      console.log('Default settings to create:', defaultSettings)

      const result = await (supabase
        .from('user_settings') as any)
        .insert(defaultSettings)
        .select()
        .single()

      updatedSettings = result.data
      error = result.error
      console.log('Insert result:', { updatedSettings, error })
    }

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings', details: error.message },
        { status: 500 }
      )
    }

    // If no updated settings returned, fetch current settings
    if (!updatedSettings) {
      console.log('No updated settings returned, fetching current')
      const { data: currentSettings } = await (supabase
        .from('user_settings') as any)
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      console.log('Current settings fetched:', currentSettings)
      return NextResponse.json(currentSettings)
    }

    console.log('Returning updated settings:', updatedSettings)
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error in settings PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
