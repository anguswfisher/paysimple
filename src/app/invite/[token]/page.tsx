'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Users, Crown, Shield, Eye, Mail, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { SignUpForm } from '@/components/auth/signup-form'
import { SignInForm } from '@/components/auth/signin-form'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  inviter_id: string
  expires_at: string
  created_at: string
  accepted_at?: string
  inviter?: {
    name: string
    company_name?: string
  }
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    fetchInvitation()
    checkAuth()
  }, [])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/team/invite/${params.token}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Invalid invitation')
      }

      const data = await response.json()
      
      if (data.requiresAuth) {
        // Unauthenticated user - show invitation details
        setInvitation(data.invitation)
      } else if (data.success) {
        // Already accepted - redirect to dashboard
        router.push('/dashboard?welcome=true')
      } else {
        // Legacy response format
        setInvitation(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      setShowSignIn(true)
      return
    }

    setAccepting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/team/invite/${params.token}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to accept invitation')
      }

      const data = await response.json()
      
      if (data.success) {
        router.push('/dashboard?welcome=true')
      } else {
        throw new Error('Failed to accept invitation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  const handleSignIn = async () => {
    setIsAuthenticated(true)
    setShowSignIn(false)
    await handleAcceptInvitation()
  }

  const handleSignUp = async () => {
    setIsAuthenticated(true)
    setShowSignUp(false)
    await handleAcceptInvitation()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-5 h-5" />
      case 'member': return <Shield className="w-5 h-5" />
      case 'viewer': return <Eye className="w-5 h-5" />
      default: return <Users className="w-5 h-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'member': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'viewer': return 'bg-slate/10 text-slate/70 border-slate/20'
      default: return 'bg-slate/10 text-slate/70 border-slate/20'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full access to manage team, settings, and billing'
      case 'member': return 'Can create projects and export reports'
      case 'viewer': return 'Read-only access to view projects and reports'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showSignIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
            <p className="text-gray-600">Sign in to accept your invitation</p>
          </CardHeader>
          <CardContent>
            <SignInForm 
              onSuccess={handleSignIn}
              onCancel={() => setShowSignIn(false)}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showSignUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <p className="text-gray-600">Sign up to accept your invitation</p>
          </CardHeader>
          <CardContent>
            <SignUpForm 
              onSuccess={handleSignUp}
              onCancel={() => setShowSignUp(false)}
              invitationEmail={invitation?.email}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Invited!</h1>
              <p className="text-gray-600">Join PaySimple to collaborate on construction payment management</p>
            </div>

            {invitation && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Invitation Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{invitation.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Role:</span>
                      <Badge className={getRoleColor(invitation.role)}>
                        {getRoleIcon(invitation.role)}
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Invited:</span>
                      <span className="font-medium">
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">What you'll get as {invitation.role}:</h3>
                  <p className="text-blue-700 text-sm">{getRoleDescription(invitation.role)}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {isAuthenticated ? (
                    <Button 
                      onClick={handleAcceptInvitation}
                      disabled={accepting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {accepting ? 'Accepting...' : 'Accept Invitation'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={() => setShowSignIn(true)}
                        className="flex-1"
                      >
                        Sign In to Accept
                      </Button>
                      <Button 
                        onClick={() => setShowSignUp(true)}
                        variant="outline"
                        className="flex-1"
                      >
                        Create Account
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <button 
                    onClick={() => setShowSignIn(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Sign in here
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Questions? Contact your team administrator</p>
        </div>
      </div>
    </div>
  )
}
