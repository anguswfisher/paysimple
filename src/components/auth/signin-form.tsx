'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth'

interface SignInFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function SignInForm({ onSuccess, onCancel }: SignInFormProps) {
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    loading: false,
    error: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.email || !formState.password) {
      setFormState(prev => ({ ...prev, error: 'Email and password are required' }))
      return
    }

    setFormState(prev => ({ ...prev, loading: true, error: '' }))

    try {
      const result = await signIn(formState.email, formState.password)

      if (!result.success) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          error: result.error?.message || 'Invalid credentials'
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
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formState.email}
          onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
          required
        />
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
          {formState.loading ? 'Signing In...' : 'Sign In'}
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
