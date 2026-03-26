'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/settings/profile-form'
import { NotificationToggles } from '@/components/settings/notification-toggles'
import { AIPreferencesForm } from '@/components/settings/ai-preferences-form'
import { UserSettings } from '@/types/settings'
import { supabase } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/settings/preferences', { headers })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to access settings')
        }
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error loading settings</h3>
          <p className="text-red-600 text-sm mt-1">{error || 'Settings not found'}</p>
          <Button onClick={fetchSettings} className="mt-3">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Profile */}
        <ProfileForm settings={settings} onUpdate={fetchSettings} />

        {/* Notifications */}
        <NotificationToggles settings={settings} onUpdate={fetchSettings} />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Plan & Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Plan & Billing</CardTitle>
            <p className="text-sm text-slate/70">Your current subscription</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-900">Educational Demo</div>
                <div className="text-sm text-blue-700 mt-1">Portfolio Project • Free</div>
              </div>
              <Button variant="outline" size="sm">Manage Plan</Button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate/70">Projects used</span>
                <span className="font-semibold">1 / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate/70">Team members</span>
                <span className="font-semibold">5 / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate/70">Exports this month</span>
                <span className="font-semibold">3 / unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate/70">AI analyses</span>
                <span className="font-semibold">7 / unlimited</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Extraction Preferences */}
        <AIPreferencesForm settings={settings} onUpdate={fetchSettings} />

        {/* Danger Zone */}
        <Card className="border-danger/20">
          <CardHeader>
            <CardTitle className="text-danger">Danger Zone</CardTitle>
            <p className="text-sm text-slate/70">Irreversible actions — proceed with caution</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-slate">Delete Account</div>
                <div className="text-sm text-slate/70">Permanently delete your account and all data</div>
              </div>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
