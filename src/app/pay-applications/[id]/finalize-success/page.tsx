'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { usePayAppStore } from '@/app/pay-applications/store'
import { CheckCircle2, Home, Plus, History } from 'lucide-react'

export default function FinalizeSuccessPage() {
  const router = useRouter()
  const { currentPayApp, getPayAppTotals } = usePayAppStore()

  useEffect(() => {
    // This page reads from currentPayApp, no additional loading needed
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totals = getPayAppTotals()

  if (!currentPayApp || !totals) {
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
    <div className="flex-1 flex flex-col items-center justify-center bg-slate/5 p-6">
      {/* Celebration Icon */}
      <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-teal-600" />
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Pay Application Submitted!
        </h1>
        <p className="text-lg text-slate/70">
          Your pay application has been successfully finalized and submitted.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="w-full max-w-md mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate/10">
            <span className="text-sm text-slate/60">Project</span>
            <span className="text-sm font-medium text-slate-900">
              {currentPayApp.basics.projectName}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate/10">
            <span className="text-sm text-slate/60">Application Number</span>
            <span className="text-sm font-medium text-slate-900">
              #{currentPayApp.basics.applicationNumber}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate/10">
            <span className="text-sm text-slate/60">Finalized On</span>
            <span className="text-sm font-medium text-slate-900">
              {formatDate(currentPayApp.finalizedAt || new Date().toISOString())}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b-2 border-b-teal-200 bg-teal-50 -mx-6 px-6">
            <span className="text-sm font-medium text-teal-900">Payment Due</span>
            <span className="text-lg font-bold text-teal-900 tabular-nums">
              {formatCurrency(totals.currentPaymentDue)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={() => router.push('/pay-applications')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </button>
        
        <button
          onClick={() => router.push('/pay-applications/new')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate/30 rounded-md hover:bg-slate/5 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Start New Pay App
        </button>
        
        <button
          onClick={() => router.push('/pay-applications/history')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate/30 rounded-md hover:bg-slate/5 transition-colors font-medium"
        >
          <History className="w-4 h-4" />
          View History
        </button>
      </div>
    </div>
  )
}
