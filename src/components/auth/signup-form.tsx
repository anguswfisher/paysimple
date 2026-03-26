'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth'

interface SignUpFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  invitationEmail?: string
}

export function SignUpForm({ onSuccess, onCancel, invitationEmail }: SignUpFormProps) {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: invitationEmail || '',
    password: '',
    loading: false,
    error: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.firstName || !formState.lastName || !formState.email || !formState.password) {
      setFormState(prev => ({ ...prev, error: 'All fields are required' }))
      return
    }

    setFormState(prev => ({ ...prev, loading: true, error: '' }))

    try {
      const result = await signUp({
        email: formState.email,
        password: formState.password,
        name: `${formState.firstName.trim()} ${formState.lastName.trim()}`,
        company: '', // Optional field
      })

      if (!result.success) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          error: result.error?.message || 'An error occurred during sign up'
        }))
        return
      }

      setFormState(prev => ({ ...prev, loading: false }))
      onSuccess?.()

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred. Please try again.'
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formState.firstName}
            onChange={(e) => setFormState(prev => ({ ...prev, firstName: e.target.value }))}
            required
            disabled={!!invitationEmail}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formState.lastName}
            onChange={(e) => setFormState(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formState.email}
          onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
          required
          disabled={!!invitationEmail}
        />
        {invitationEmail && (
          <p className="text-sm text-gray-500 mt-1">
            Email is preset for this invitation
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formState.password}
          onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      {formState.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {formState.error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={formState.loading}>
          {formState.loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
