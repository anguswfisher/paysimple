'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserSettings, NotificationSettings } from '@/types/settings'
import { supabase } from '@/lib/supabase/client'

interface NotificationTogglesProps {
  settings: UserSettings
  onUpdate?: () => void
}

export function NotificationToggles({ settings, onUpdate }: NotificationTogglesProps) {
  const [optimisticSettings, setOptimisticSettings] = useState<NotificationSettings>({
    notify_compliance_risks: settings.notify_compliance_risks,
    notify_payment_reminders: settings.notify_payment_reminders,
    notify_lien_deadlines: settings.notify_lien_deadlines,
    notify_team_activity: settings.notify_team_activity,
    notify_weekly_summary: settings.notify_weekly_summary
  })
  const [loading, setLoading] = useState<string | null>(null)

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

  const handleToggle = async (key: keyof NotificationSettings) => {
  // Capture the current value before any async work
  const currentValue = optimisticSettings[key] as boolean
  const newValue = !currentValue

  // Optimistic update
  setOptimisticSettings(prev => ({ ...prev, [key]: newValue }))
  setLoading(key)

  try {
    const headers = await getAuthHeaders()
    const response = await fetch('/api/settings/preferences', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ [key]: newValue }),
    })

    if (!response.ok) {
      // Revert only this specific key
      setOptimisticSettings(prev => ({ ...prev, [key]: currentValue }))
      const errorData = await response.json()
      // Could add message state here if needed
      return
    }

    // Success - could add success message here if needed
    // onUpdate?.() // Commented out to preserve individual toggle states
  } catch (error) {
    // Revert only this specific key
    setOptimisticSettings(prev => ({ ...prev, [key]: currentValue }))
    // Could add error message here if needed
  } finally {
    setLoading(null)
  }
}

const ToggleButton = ({ settingKey, label, description }: { 
  settingKey: keyof NotificationSettings
  label: string
  description: string 
}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate/10 last:border-b-0">
    <div>
      <div className="font-medium text-slate">{label}</div>
      <div className="text-sm text-slate/70">{description}</div>
    </div>
    <button
      onClick={() => handleToggle(settingKey)}
      disabled={loading === settingKey}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        optimisticSettings[settingKey] ? 'bg-navy' : 'bg-slate/30'
      } ${loading === settingKey ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          optimisticSettings[settingKey] ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <p className="text-sm text-slate/70">Choose what alerts you receive</p>
      </CardHeader>
      <CardContent className="space-y-0">
        <ToggleButton settingKey="notify_compliance_risks" label="Compliance Risk Alerts" description="Get notified when new risk flags are detected" />
        <ToggleButton settingKey="notify_payment_reminders" label="Payment Schedule Reminders" description="Upcoming payment due dates" />
        <ToggleButton settingKey="notify_lien_deadlines" label="Lien Waiver Deadlines" description="7 days before deadline" />
        <ToggleButton settingKey="notify_team_activity" label="Team Activity" description="When teammates upload or update projects" />
        <ToggleButton settingKey="notify_weekly_summary" label="Weekly Summary" description="Email digest every Monday" />
      </CardContent>
    </Card>
  )
}
