"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSettings, AIPreferences } from "@/types/settings";
import { supabase } from '@/lib/supabase/client'

interface AIPreferencesFormProps {
  settings: UserSettings
  onUpdate?: () => void
}

export function AIPreferencesForm({ settings, onUpdate }: AIPreferencesFormProps) {
  const [preferences, setPreferences] = useState<AIPreferences>({
    default_contract_type: settings.default_contract_type,
    flag_pay_when_paid: settings.flag_pay_when_paid,
    auto_generate_schedule: settings.auto_generate_schedule,
    default_retainage_threshold: settings.default_retainage_threshold
  })
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const handleSelectChange = async (key: keyof AIPreferences, value: string) => {
    const previousValue = preferences[key]
    
    // Update immediately for dropdowns
    setPreferences(prev => ({ ...prev, [key]: value }))
    setLoading(key)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          [key]: value
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to update preferences')
        }
        // Revert on error
        setPreferences(prev => ({ ...prev, [key]: previousValue }))
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to update preference' })
      } else {
        setMessage({ type: 'success', text: 'Preference updated successfully!' })
        setTimeout(() => setMessage(null), 2000)
        onUpdate?.() // Call update callback on success
      }
    } catch (error) {
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: previousValue }))
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An unexpected error occurred' })
    } finally {
      setLoading(null)
    }
  }

const handleToggle = async (key: keyof AIPreferences) => {
  // Capture the current value before any async work
  const currentValue = preferences[key] as boolean
  const newValue = !currentValue

  // Optimistic update
  setPreferences(prev => ({ ...prev, [key]: newValue }))
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
      setPreferences(prev => ({ ...prev, [key]: currentValue }))
      const errorData = await response.json()
      setMessage({ type: 'error', text: errorData.error || 'Failed to update preference' })
      return
    }

    setMessage({ type: 'success', text: 'Saved' })
    setTimeout(() => setMessage(null), 2000)
    // onUpdate?.() // Commented out to preserve individual preference states - detail
  } catch (error) {
    // Revert only this specific key
    setPreferences(prev => ({ ...prev, [key]: currentValue }))
    setMessage({
      type: 'error',
      text: error instanceof Error ? error.message : 'An unexpected error occurred',
    })
  } finally {
    setLoading(null)
  }
}

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Extraction Preferences</CardTitle>
        <p className="text-sm text-slate/70">Customize how PaySimple analyzes contracts</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className={`p-3 rounded text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between py-3 border-b border-slate/10">
          <div>
            <div className="font-medium text-slate">Default Contract Type</div>
          </div>
          <Select 
            value={preferences.default_contract_type} 
            onValueChange={(value) => handleSelectChange('default_contract_type', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AIA A101">AIA A101</SelectItem>
              <SelectItem value="AIA A102">AIA A102</SelectItem>
              <SelectItem value="AIA A103">AIA A103</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-slate/10">
          <div>
            <div className="font-medium text-slate">Flag Pay-When-Paid Clauses</div>
            <div className="text-sm text-slate/70">Always highlight conditional payment language</div>
          </div>
          <button
            onClick={() => handleToggle('flag_pay_when_paid')}
            disabled={loading === 'flag_pay_when_paid'}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.flag_pay_when_paid ? 'bg-navy' : 'bg-slate/30'
            } ${loading === 'flag_pay_when_paid' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.flag_pay_when_paid ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-slate/10">
          <div>
            <div className="font-medium text-slate">Auto-generate Payment Schedule</div>
            <div className="text-sm text-slate/70">Create schedule immediately after extraction</div>
          </div>
          <button
            onClick={() => handleToggle('auto_generate_schedule')}
            disabled={loading === 'auto_generate_schedule'}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.auto_generate_schedule ? 'bg-navy' : 'bg-slate/30'
            } ${loading === 'auto_generate_schedule' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.auto_generate_schedule ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-slate">Default Retainage Alert Threshold</div>
          </div>
          <Select 
            value={preferences.default_retainage_threshold} 
            onValueChange={(value) => handleSelectChange('default_retainage_threshold', value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5%">5%</SelectItem>
              <SelectItem value="10%">10%</SelectItem>
              <SelectItem value="15%">15%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
