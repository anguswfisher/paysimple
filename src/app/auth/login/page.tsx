'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { Eye, EyeOff, AlertCircle, ArrowRight, DollarSign } from 'lucide-react'

interface FormData {
  email: string
  password: string
}

interface FormState {
  data: FormData
  loading: boolean
  error: string | null
}

const AVATAR_COLORS = ['#1d4ed8', '#059669', '#7c3aed', '#b45309']
const AVATARS = ['AF', 'SL', 'MK', 'JP']
const BAR_HEIGHTS = [45, 58, 50, 72, 65, 80, 100]

export default function LoginPage() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({
    data: { email: '', password: '' },
    loading: false,
    error: null,
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      error: null,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState(prev => ({ ...prev, error: null, loading: true }))

    const { email, password } = formState.data

    if (!email.trim() || !password.trim()) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'Email and password are required',
      }))
      return
    }

    try {
      const result = await signIn(email, password)
      if (!result.success) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          error: result.error?.message || 'An error occurred during sign in',
        }))
        return
      }
      router.push('/dashboard')
    } catch {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred. Please try again.',
      }))
    }
  }

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT BRAND PANEL ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-[#1e3a4f] relative overflow-hidden">

        {/* Background layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 70%),
              radial-gradient(ellipse 40% 60% at 10% 80%, rgba(59,130,246,0.08) 0%, transparent 60%)
            `,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <span className="text-[22px] font-serif text-white tracking-tight">
            <em className="not-italic text-blue-300">Pay</em>Simple
          </span>
        </div>

        {/* Middle content */}
        <div className="relative z-10 flex flex-col gap-7">

          {/* Headline */}
          <div>
            <h2 className="text-[38px] leading-[1.12] font-serif text-white tracking-tight">
              AIA contracts,<br />
              <em className="text-blue-300">finally</em> under<br />
              control.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55 max-w-[360px]">
              Extract payment terms, generate G702/G703 schedules, and catch
              compliance risks — in seconds, not days.
            </p>
          </div>

          {/* Mini dashboard card */}
          <div
            className="rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-white/90">Project Dashboard · Live</span>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full border"
                style={{
                  background: 'rgba(16,185,129,0.2)',
                  color: '#34d399',
                  borderColor: 'rgba(16,185,129,0.25)',
                }}
              >
                ● Active
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { label: 'Contract Value', value: '$25M', delta: '▲ 2 projects', deltaColor: '#34d399' },
                { label: 'Compliance', value: '94%', delta: '▲ +2% MoM', deltaColor: '#34d399' },
                { label: 'Retainage', value: '$2.3M', delta: 'tracked', deltaColor: 'rgba(255,255,255,0.35)' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-[10px] text-white/40 mb-1">{stat.label}</div>
                  <div className="text-base font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: stat.deltaColor }}>{stat.delta}</div>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-9 mb-3">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background: i === BAR_HEIGHTS.length - 1
                      ? 'rgba(59,130,246,0.85)'
                      : 'rgba(59,130,246,0.35)',
                  }}
                />
              ))}
            </div>

            {/* Card footer */}
            <div
              className="flex items-center justify-between pt-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-[10px] text-white/40">Payment Schedule — App #7 · Due Mar 28</span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#34d399' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
                />
                No risk flags
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'AIA A101 / A102 / A103',
              'Compliance flagging',
              'G702/G703 export',
              'Real-time analytics',
            ].map((label) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex">
            {AVATARS.map((initials, i) => (
              <div
                key={initials}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2"
                style={{
                  backgroundColor: AVATAR_COLORS[i],
                  borderColor: '#1e3a4f',
                  marginLeft: i === 0 ? 0 : '-8px',
                }}
              >
                {initials}
              </div>
            ))}
          </div>
          <div className="text-[12px] leading-snug text-white/50">
            <span className="text-white/85 font-semibold">Trusted by 200+ contractors</span>
            <br />
            Saving 6–10 hrs per payment application
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white relative overflow-hidden">

        {/* Subtle background glow */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }}
        />

        <div className="w-full max-w-[380px] relative">

          {/* Header */}
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-500 mb-2">
            Welcome back
          </p>
          <h1 className="text-[30px] leading-[1.15] font-serif text-gray-900 tracking-tight mb-1.5">
            Sign in to<br />PaySimple
          </h1>
          <p className="text-sm text-gray-500 mb-7 leading-relaxed">
            Your contracts are waiting.
          </p>

          {/* Google SSO */}
          <button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm mb-6"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Error banner */}
          {formState.error && (
            <div className="flex items-start gap-2 px-3.5 py-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{formState.error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formState.data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={formState.loading}
                required
                className="h-12 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/8 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formState.data.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={formState.loading}
                  required
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/8 transition-all pr-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                href="#"
                className="text-xs text-blue-500 font-semibold hover:text-blue-600 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={formState.loading}
              className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:pointer-events-none"
            >
              {formState.loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to signup */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-blue-500 font-semibold hover:text-blue-600 hover:underline transition-colors"
            >
              Create one free →
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}