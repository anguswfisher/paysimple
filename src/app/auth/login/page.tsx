'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { signIn } from '@/lib/auth'

interface FormData {
  email: string
  password: string
}

interface FormState {
  data: FormData
  loading: boolean
  error: string | null
}

export default function LoginPage() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({
    data: {
      email: '',
      password: '',
    },
    loading: false,
    error: null,
  })

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
    const { email, password } = formState.data
    
    if (!email.trim() || !password.trim()) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'Email and password are required'
      }))
      return
    }

    try {
      // Sign in with Supabase
      const result = await signIn(email, password)

      if (!result.success) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          error: result.error?.message || 'An error occurred during sign in'
        }))
        return
      }

      // Success! Router will handle redirect via middleware
      // Or we can manually redirect to dashboard
      router.push('/dashboard')

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred. Please try again.'
      }))
    }
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-navy">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your PaySimple account
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
                placeholder="Enter your password"
                value={formState.data.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={formState.loading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-navy hover:bg-navy/90"
              disabled={formState.loading}
            >
              {formState.loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center">
            <Link href="/signup" className="text-sm text-steel hover:underline">
              Don't have an account? Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
