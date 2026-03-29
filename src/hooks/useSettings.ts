'use client'

import { useState, useEffect } from 'react'
import { UserSettings, ProfileData, NotificationSettings, AIPreferences } from '@/types/settings'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/preferences')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: ProfileData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedProfile = await response.json()
      return updatedProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateNotificationPreferences = async (preferences: Partial<NotificationSettings>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_preferences: preferences
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update notification preferences')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification preferences')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateAIPreferences = async (preferences: Partial<AIPreferences>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ai_preferences: preferences
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update AI preferences')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update AI preferences')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUIPreferences = async (preferences: Partial<AIPreferences>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ui_preferences: preferences
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update UI preferences')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update UI preferences')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: {
    notification_preferences?: Partial<NotificationSettings>
    ai_preferences?: Partial<AIPreferences>
    ui_preferences?: Partial<AIPreferences>
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update preferences')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateProfile,
    updateNotificationPreferences,
    updateAIPreferences,
    updateUIPreferences,
    updatePreferences,
  }
}
