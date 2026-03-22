import { NextRequest, NextResponse } from 'next/server'
import { SettingsService } from '@/lib/services/settings'

const settingsService = new SettingsService()

export async function GET(request: NextRequest) {
  try {
    const settings = await settingsService.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notification_preferences, ai_preferences, ui_preferences } = body

    // Update each preference type if provided
    if (notification_preferences) {
      await settingsService.updateNotificationPreferences(notification_preferences)
    }

    if (ai_preferences) {
      await settingsService.updateAIPreferences(ai_preferences)
    }

    if (ui_preferences) {
      await settingsService.updateUIPreferences(ui_preferences)
    }

    // Return updated settings
    const updatedSettings = await settingsService.getSettings()
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
