import { NextRequest, NextResponse } from 'next/server'
import { SettingsService } from '@/lib/services/settings'

const settingsService = new SettingsService()

export async function GET(request: NextRequest) {
  try {
    const profile = await settingsService.getProfile()
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const profile = await settingsService.updateProfile(body)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    )
  }
}
