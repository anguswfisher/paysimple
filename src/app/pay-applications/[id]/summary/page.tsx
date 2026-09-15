'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'

export default function SummaryPage() {
  const router = useRouter()
  const { currentPayApp, getPayAppTotals } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // This page reads from currentPayApp, no additional loading needed
  }, [])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      router.push(`/pay-applications/${currentPayApp?.id}/checks`)
    } catch (error) {
      console.error('Failed to navigate to checks:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/workspace`)
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
      month: 'long',
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

  const percentageComplete = totals.contractSumToDate > 0 
    ? ((totals.totalCompletedAndStoredToDate / totals.contractSumToDate) * 100)
    : 0

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Application Summary</h1>
        <p className="text-slate/70 mt-1">
          Review your pay application details
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Application and Certificate for Payment
                </CardTitle>
                <div className="text-lg font-semibold text-slate-900">
                  App #{currentPayApp.basics.applicationNumber}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate/60">Project:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {currentPayApp.basics.projectName}
                  </span>
                </div>
                <div>
                  <span className="text-slate/60">Application Date:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {formatDate(currentPayApp.basics.periodEndDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate/60">Period To:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {formatDate(currentPayApp.basics.periodEndDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate/60">Owner:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {currentPayApp.basics.ownerName}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate/60">Contractor:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {currentPayApp.basics.contractorName}
                  </span>
                </div>
              </div>

              {/* Payment Summary Line Table */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Schedule of Values</h3>
                <div className="border border-slate/20 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {/* Line 1 */}
                      <tr className="border-b border-slate/10">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">1.</td>
                        <td className="px-4 py-3 text-sm text-slate-900">Original Contract Sum</td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                          {formatCurrency(totals.originalContractSum)}
                        </td>
                      </tr>
                      
                      {/* Line 2 */}
                      <tr className="border-b border-slate/10">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">2.</td>
                        <td className="px-4 py-3 text-sm text-slate-900">Net Change by Change Orders</td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                          {formatCurrency(totals.netChangeByChangeOrders)}
                        </td>
                      </tr>
                      
                      {/* Line 3 - Subtotal */}
                      <tr className="border-b border-slate/10 bg-slate/5">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">3.</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          Contract Sum to Date (Line 1 + 2)
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold">
                          {formatCurrency(totals.contractSumToDate)}
                        </td>
                      </tr>
                      
                      {/* Line 4 */}
                      <tr className="border-b border-slate/10">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">4.</td>
                        <td className="px-4 py-3 text-sm text-slate-900">Total Completed & Stored to Date</td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                          {formatCurrency(totals.totalCompletedAndStoredToDate)}
                        </td>
                      </tr>
                      
                      {/* Line 5 */}
                      <tr className="border-b border-slate/10">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">5.</td>
                        <td className="px-4 py-3 text-sm text-slate-900">Retainage</td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                          {formatCurrency(totals.totalRetainage)}
                        </td>
                      </tr>
                      
                      {/* Line 6 - Subtotal */}
                      <tr className="border-b border-slate/10 bg-slate/5">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">6.</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          Total Earned Less Retainage (Line 4 – 5)
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold">
                          {formatCurrency(totals.totalEarnedLessRetainage)}
                        </td>
                      </tr>
                      
                      {/* Line 7 */}
                      <tr className="border-b border-slate/10">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">7.</td>
                        <td className="px-4 py-3 text-sm text-slate-900">Less Previous Certificates for Payment</td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                          {formatCurrency(totals.lessPreviousCertificates)}
                        </td>
                      </tr>
                      
                      {/* Line 8 - Highlighted */}
                      <tr className="border-b border-slate/10 bg-teal-50 border-l-4 border-l-teal-600">
                        <td className="px-4 py-3 text-sm font-bold text-teal-700 w-12">8.</td>
                        <td className="px-4 py-3 text-sm font-bold text-teal-900">
                          Current Payment Due
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-teal-900 text-lg">
                          {formatCurrency(totals.currentPaymentDue)}
                        </td>
                      </tr>
                      
                      {/* Line 9 */}
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">9.</td>
                        <td className="px-4 py-3 text-sm text-slate-900">Balance to Finish, Including Retainage</td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                          {formatCurrency(totals.balanceToFinishIncludingRetainage)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">Percentage Complete:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {percentageComplete.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate/20 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentageComplete, 100)}%` }}
                  />
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
        continueLabel="Run Checks"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
