'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/components/providers/supabase-provider'
import { usePayAppStore } from '@/app/pay-applications/store'
import { calculatePayAppTotals } from '@/app/pay-applications/calculations'
import { ArrowLeft, Download, FilePlus, User, Calendar, Building } from 'lucide-react'
import type { PayAppTotals } from '@/app/pay-applications/types'

export default function HistoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()
  const { currentPayApp, loadPayAppById } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [totals, setTotals] = useState<PayAppTotals | null>(null)

  useEffect(() => {
    const loadPayApp = async (userId: string) => {
      setIsLoading(true)
      try {
        await loadPayAppById(params.id, userId)
      } catch (error) {
        console.error('Failed to load pay application:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      loadPayApp(user.id)
    }
  }, [params.id, loadPayAppById, authLoading, user])

  useEffect(() => {
    if (currentPayApp) {
      const calculatedTotals = calculatePayAppTotals(currentPayApp)
      setTotals(calculatedTotals)
    }
  }, [currentPayApp])

  const handleBack = () => {
    router.push('/pay-applications/history')
  }

  const handleDownloadPDF = () => {
    alert('Coming soon')
  }

  const handleCreateCorrectedDraft = () => {
    router.push(`/pay-applications/${params.id}/corrected-draft`)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'finalized':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'corrected-draft':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'finalized':
        return 'Finalized'
      case 'corrected-draft':
        return 'Corrected Draft'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate/70 mb-2">Loading pay application...</div>
        </div>
      </div>
    )
  }

  if (!currentPayApp || !totals) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate/70 mb-2">Pay application not found</div>
          <div className="text-sm text-slate/50">Redirecting to history...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-slate/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate/5 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate/70" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {currentPayApp.basics.projectName}
              </h1>
              <p className="text-slate/70 text-sm">
                Application #{currentPayApp.basics.applicationNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 border border-slate/30 rounded-md hover:bg-slate/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            {currentPayApp.status === 'finalized' && (
              <button
                onClick={handleCreateCorrectedDraft}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                <FilePlus className="w-4 h-4" />
                Create Corrected Draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 bg-slate/5">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Application Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate/60">Status:</span>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(currentPayApp.status)}`}>
                    {getStatusLabel(currentPayApp.status)}
                  </div>
                </div>

                {/* Billing Period */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate/40" />
                  <div>
                    <div className="text-sm text-slate/60">Billing Period</div>
                    <div className="text-sm font-medium text-slate-900">
                      {formatDate(currentPayApp.basics.periodStartDate)} - {formatDate(currentPayApp.basics.periodEndDate)}
                    </div>
                  </div>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate/40" />
                  <div>
                    <div className="text-sm text-slate/60">Owner</div>
                    <div className="text-sm font-medium text-slate-900">
                      {currentPayApp.basics.ownerName}
                    </div>
                  </div>
                </div>

                {/* Contractor */}
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate/40" />
                  <div>
                    <div className="text-sm text-slate/60">Contractor</div>
                    <div className="text-sm font-medium text-slate-900">
                      {currentPayApp.basics.contractorName}
                    </div>
                  </div>
                </div>

                {/* Finalized Date */}
                {currentPayApp.finalizedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate/40" />
                    <div>
                      <div className="text-sm text-slate/60">Finalized On</div>
                      <div className="text-sm font-medium text-slate-900">
                        {formatDate(currentPayApp.finalizedAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Contract Sum */}
                <div className="text-center p-4 bg-slate/50 rounded-lg">
                  <div className="text-sm text-slate/60 mb-1">Contract Sum</div>
                  <div className="text-lg font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(totals.contractSumToDate)}
                  </div>
                </div>

                {/* Total Completed */}
                <div className="text-center p-4 bg-slate/50 rounded-lg">
                  <div className="text-sm text-slate/60 mb-1">Total Completed</div>
                  <div className="text-lg font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(totals.totalCompletedAndStoredToDate)}
                  </div>
                </div>

                {/* Retainage */}
                <div className="text-center p-4 bg-slate/50 rounded-lg">
                  <div className="text-sm text-slate/60 mb-1">Retainage</div>
                  <div className="text-lg font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(totals.totalRetainage)}
                  </div>
                </div>

                {/* Payment Due */}
                <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="text-sm text-teal-600 mb-1">Payment Due</div>
                  <div className="text-lg font-bold text-teal-600 tabular-nums">
                    {formatCurrency(totals.currentPaymentDue)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Section */}
          {currentPayApp.signatureInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-slate/60 mb-1">Signer's Name</div>
                    <div className="font-medium text-slate-900">
                      {currentPayApp.signatureInfo.signerName}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate/60 mb-1">Title</div>
                    <div className="font-medium text-slate-900">
                      {currentPayApp.signatureInfo.title}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate/60 mb-1">Date</div>
                    <div className="font-medium text-slate-900">
                      {formatDate(currentPayApp.signatureInfo.date)}
                    </div>
                  </div>
                  {currentPayApp.signatureInfo.notes && (
                    <div className="md:col-span-3 mt-4">
                      <div className="text-slate/60 mb-1">Notes</div>
                      <div className="text-slate-900">
                        {currentPayApp.signatureInfo.notes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule of Values Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule of Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate/5 border-b border-slate/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-16">
                        Line #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 w-32">
                        Scheduled Value
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 w-20">
                        % Complete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayApp.lineItems.map((item, index) => {
                      const totalCompleted = (item.workToDate || 0) + (item.materialsToDate || 0)
                      const percentComplete = item.scheduledValue > 0 ? (totalCompleted / item.scheduledValue) * 100 : 0
                      
                      return (
                        <tr key={item.id} className="border-b border-slate/5">
                          <td className="px-4 py-3 text-sm tabular-nums">
                            {item.lineNumber || index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-right tabular-nums">
                            {formatCurrency(item.scheduledValue)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right tabular-nums">
                            {percentComplete.toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
