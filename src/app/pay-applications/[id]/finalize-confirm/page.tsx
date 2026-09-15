'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { CheckCircle, Info } from 'lucide-react'

export default function FinalizeConfirmPage() {
  const router = useRouter()
  const { currentPayApp, getPayAppTotals } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // This page reads from currentPayApp, no additional loading needed
  }, [])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      router.push(`/pay-applications/${currentPayApp?.id}/finalize-sign`)
    } catch (error) {
      console.error('Failed to navigate to finalize sign:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/review-checklist`)
  }

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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Finalize Application</h1>
        <p className="text-slate/70 mt-1">
          Review your pay application before signing
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-lg mx-auto">
          {/* Centered Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">
                  Ready to Finalize
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Rows */}
              <div className="space-y-4">
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
                  <span className="text-sm text-slate/60">Billing Period</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatDate(currentPayApp.basics.periodStartDate)} – {formatDate(currentPayApp.basics.periodEndDate)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b-2 border-b-teal-200 bg-teal-50 -mx-4 px-4">
                  <span className="text-sm font-medium text-teal-900">Current Payment Due</span>
                  <span className="text-lg font-bold text-teal-900 tabular-nums">
                    {formatCurrency(totals.currentPaymentDue)}
                  </span>
                </div>
              </div>

              {/* Info Notice Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 mb-1">
                      What happens next?
                    </div>
                    <div className="text-sm text-blue-800">
                      After signing, your pay application will be finalized. You'll be able to preview and download the completed payment summary and schedule of values.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Proceed to Sign"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
