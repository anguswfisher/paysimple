'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { signUp } from '@/lib/auth'

interface FormData {
  name: string
  company: string
  email: string
  password: string
}

interface FormState {
  data: FormData
  loading: boolean
  error: string | null
  success: boolean
}

export default function SignupPage() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({
    data: {
      name: '',
      company: '',
      email: '',
      password: '',
    },
    loading: false,
    error: null,
    success: false,
  })

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      },
      error: null
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset error state
    setFormState(prev => ({ ...prev, error: null, loading: true }))

    // Validate form
    const { name, company, email, password } = formState.data
    
    if (!name.trim() || !company.trim() || !email.trim() || !password.trim()) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'All fields are required'
      }))
      return
    }

    if (!validateEmail(email)) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'Please enter a valid email address'
      }))
      return
    }

    if (password.length < 6) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'Password must be at least 6 characters long'
      }))
      return
    }

    try {
      // Sign up with Supabase
      const result = await signUp({
        email,
        password,
        name: name.trim(),
        company: company.trim()
      })

      if (!result.success) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          error: result.error?.message || 'An error occurred during signup'
        }))
        return
      }

      // Success!
      setFormState(prev => ({
        ...prev,
        loading: false,
        success: true
      }))

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred. Please try again.'
      }))
    }
  }

  if (formState.success) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-navy">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to {formState.data.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate/70">
              Click the link in your email to verify your account and get started.
            </p>
            <div className="text-center">
              <Link href="/login" className="text-sm text-steel hover:underline">
                Already verified? Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-navy">Create Account</CardTitle>
          <CardDescription>
            Create your PaySimple account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formState.error && (
            <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded">
              {formState.error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formState.data.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={formState.loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                type="text"
                placeholder="Enter your company name"
                value={formState.data.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={formState.loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formState.data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={formState.loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formState.data.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={formState.loading}
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-navy hover:bg-navy/90"
              disabled={formState.loading}
            >
              {formState.loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="text-center">
            <Link href="/login" className="text-sm text-steel hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
