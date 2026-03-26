'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserSettings } from '@/types/settings'
import { supabase } from '@/lib/supabase/client'

interface ProfileFormProps {
  settings: UserSettings
  onUpdate?: () => void
}

export function ProfileForm({ settings, onUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: settings.first_name || '',
    last_name: settings.last_name || '',
    company: settings.company || ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company: formData.company
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to update profile')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      // onUpdate?.() // Commented out to preserve individual form state
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: settings.first_name || '',
      last_name: settings.last_name || '',
      company: settings.company || ''
    })
    setIsEditing(false)
    setMessage(null)
  }

  const getInitials = () => {
    const firstName = formData.first_name || settings.first_name || ''
    const lastName = formData.last_name || settings.last_name || ''
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return 'U'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <p className="text-sm text-slate/70">Your personal information</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-navy text-white text-2xl font-bold flex items-center justify-center">
            {getInitials()}
          </div>
          <div>
            <div className="font-semibold text-slate">
              {formData.first_name || settings.first_name || 'User'} {formData.last_name || settings.last_name || ''}
            </div>
            <div className="text-sm text-slate/70">
              Educational Demo • Member since {new Date(settings.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <Button variant="outline" size="sm" className="mt-2">Change Photo</Button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate/70">First Name</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate/70">Last Name</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate/70">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company name"
              />
            </div>

            {message && (
              <div className={`p-3 rounded text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button className="bg-navy hover:bg-navy/90" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate/70">First Name</label>
                <Input value={settings.first_name || ''} readOnly className="bg-slate/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate/70">Last Name</label>
                <Input value={settings.last_name || ''} readOnly className="bg-slate/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate/70">Company</label>
              <Input value={settings.company || ''} readOnly className="bg-slate/50" />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
