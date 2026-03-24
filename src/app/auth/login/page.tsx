'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-[#1e3a4f] relative flex flex-col justify-between p-12 overflow-hidden hidden lg:block">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24" width="18" height="18">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <span className="text-2xl font-serif italic text-white">PaySimple</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center gap-7">
          {/* Headline */}
          <div>
            <h1 className="text-4xl font-serif text-white leading-tight mb-1">
              AIA contracts,<br/>
              <span className="italic text-blue-400">finally</span> under<br/>
              control.
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-sm mt-1">
              Extract payment terms, generate G702/G703 schedules, and catch compliance risks — in seconds, not days.
            </p>
          </div>

          {/* Mini Dashboard Preview */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-semibold text-white/90">Project Dashboard · Live</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/25">
                ● Active
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 mb-3.5">
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="text-xs text-white/40 mb-1">Contract Value</div>
                <div className="text-base font-bold text-white">$25M</div>
                <div className="text-xs text-green-400 mt-0.5">▲ 2 projects</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="text-xs text-white/40 mb-1">Compliance</div>
                <div className="text-base font-bold text-white">94%</div>
                <div className="text-xs text-green-400 mt-0.5">▲ +2% MoM</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="text-xs text-white/40 mb-1">Retainage</div>
                <div className="text-base font-bold text-white">$2.3M</div>
                <div className="text-xs text-white/40 mt-0.5">tracked</div>
              </div>
            </div>
            <div className="flex items-end gap-1 h-9 mb-2.5">
              {[45, 58, 50, 72, 65, 80, 100].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500/35 rounded-t-sm"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/7">
              <span className="text-xs text-white/40">Payment Schedule — App #7 · Due Mar 28</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                No risk flags
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { icon: '📄', text: 'AIA A101 / A102 / A103' },
              { icon: '🛡️', text: 'Compliance flagging' },
              { icon: '📊', text: 'G702/G703 export' },
              { icon: '📈', text: 'Real-time analytics' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/6 border border-white/10 rounded-full text-xs font-medium text-white/70">
                <span className="text-blue-400">{feature.icon}</span>
                {feature.text}
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex -space-x-2">
            {['AF', 'SL', 'MK', 'JP'].map((initial, i) => (
              <div
                key={i}
                className="w-7.5 h-7.5 rounded-full border-2 border-[#1e3a4f] flex items-center justify-center text-xs font-bold text-white"
                style={{
                  backgroundColor: ['#1d4ed8', '#059669', '#7c3aed', '#b45309'][i]
                }}
              >
                {initial}
              </div>
            ))}
          </div>
          <div className="text-xs text-white/50 leading-tight">
            <span className="text-white/85 font-semibold">Trusted by 200+ contractors</span><br/>
            Saving 6–10 hrs per payment application
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-12 relative overflow-y-auto">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 rounded-full"></div>
        
        <div className="w-full max-w-sm relative">
          {/* Form Header */}
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Welcome back</div>
          <h1 className="text-3xl font-serif text-gray-900 leading-tight mb-1.5">
            Sign in to<br/>PaySimple
          </h1>
          <p className="text-sm text-gray-500 mb-7 leading-relaxed">
            Your contracts are waiting.
          </p>

          {/* Google SSO */}
          <button className="w-full h-11 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2.5 mb-6 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50 transition-all">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4 text-xs text-gray-400 font-medium">
            <div className="flex-1 h-px bg-gray-200"></div>
            or sign in with email
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error Message */}
          {formState.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {formState.error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formState.data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={formState.loading}
                required
                className="h-12 bg-gray-50 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formState.data.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={formState.loading}
                  required
                  className="h-12 bg-gray-50 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-xs text-blue-500 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 mb-4"
              disabled={formState.loading}
            >
              {formState.loading ? 'Signing In...' : 'Sign In'}
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16" className="ml-2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Don't have an account? <Link href="/signup" className="text-blue-500 font-semibold hover:underline">Create one free →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
