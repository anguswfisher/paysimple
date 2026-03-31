'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PayAppStepper } from '@/components/pay-applications/PayAppStepper'
import { usePayAppStore } from '@/app/pay-applications/store'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Skeleton } from '@/components/ui/skeleton'

export default function WizardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()
  const { loadPayAppById, currentPayApp } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPayApp = async (userId: string) => {
      try {
        setIsLoading(true)
        setError(null)
        
        await loadPayAppById(params.id, userId)
      } catch (err) {
        console.error('Failed to load pay application:', err)
        setError('Failed to load pay application')
        
        // Redirect to pay applications list after a delay
        setTimeout(() => {
          router.push('/pay-applications')
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && !authLoading && user) {
      loadPayApp(user.id)
    }
  }, [params.id, loadPayAppById, router, authLoading, user])

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        {/* Loading skeleton for stepper */}
        <div className="mb-8">
          <Skeleton className="h-16 w-full max-w-4xl mx-auto rounded-lg" />
        </div>
        
        {/* Loading skeleton for content */}
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error</div>
          <div className="text-slate/70">{error}</div>
          <div className="text-sm text-slate/50 mt-2">Redirecting to pay applications...</div>
        </div>
      </div>
    )
  }

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate/70 mb-2">Pay application not found</div>
          <div className="text-sm text-slate/50">Redirecting to pay applications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Stepper */}
      <PayAppStepper />
      
      {/* Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
