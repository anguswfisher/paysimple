'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PayAppStepper } from '@/components/pay-applications/PayAppStepper'
import { usePayAppStore } from '@/app/pay-applications/store'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, FileQuestion } from 'lucide-react'

/** Shown instead of stranding the user on a skeleton or a dead "Redirecting…". */
function WizardDeadEnd({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode
  title: string
  detail: string
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate/5 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h1 className="text-base font-semibold text-slate-800 mb-1.5">{title}</h1>
        <p className="text-sm text-slate/55 mb-5">{detail}</p>
        <Button asChild>
          <Link href="/pay-applications">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pay Applications
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function WizardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const { user, loading: authLoading } = useSupabase()
  const { loadPayAppById, currentPayApp } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    // No signed-in user: nothing will ever load, so stop loading and say so
    // rather than leaving an indefinite skeleton on screen.
    if (!user) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const loadPayApp = async (userId: string) => {
      try {
        setIsLoading(true)
        setError(null)
        await loadPayAppById(params.id, userId)
      } catch (err) {
        console.error('Failed to load pay application:', err)
        if (!cancelled) setError('We could not load this pay application.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadPayApp(user.id)

    return () => {
      cancelled = true
    }
  }, [params.id, loadPayAppById, authLoading, user])

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex flex-row min-h-0">
        {/* Loading skeleton for stepper */}
        <div className="w-52 shrink-0 border-r border-slate/10 p-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>

        {/* Loading skeleton for content */}
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <WizardDeadEnd
        icon={<AlertCircle className="w-5 h-5 text-slate/40" />}
        title="Sign in to continue"
        detail="This pay application is tied to your account. Sign in and reopen it from the list."
      />
    )
  }

  if (error) {
    return (
      <WizardDeadEnd
        icon={<AlertCircle className="w-5 h-5 text-red-500" />}
        title="Something went wrong"
        detail={error}
      />
    )
  }

  if (!currentPayApp) {
    return (
      <WizardDeadEnd
        icon={<FileQuestion className="w-5 h-5 text-slate/40" />}
        title="Pay application not found"
        detail="It may have been deleted, or the link may be incorrect."
      />
    )
  }

  return (
    <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
      {/* Left-side stepper */}
      <PayAppStepper />

      {/* Content — flex-1 so it fills remaining width; min-h-0 allows children to shrink */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  )
}
