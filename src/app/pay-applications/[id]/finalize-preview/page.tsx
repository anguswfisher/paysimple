'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Download, CheckCircle, FileText } from 'lucide-react'

export default function FinalizePreviewPage() {
  const router = useRouter()
  const { currentPayApp, getPayAppTotals } = usePayAppStore()
  const [activeTab, setActiveTab] = useState<'summary' | 'sov'>('summary')

  useEffect(() => {
    // This page reads from currentPayApp, no additional loading needed
  }, [])

  const handleDownloadPDF = () => {
    alert('Coming soon')
  }

  const handleDone = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/finalize-success`)
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

  const displayLineItems = currentPayApp.lineItems.slice(0, 5)
  const hasMoreLineItems = currentPayApp.lineItems.length > 5

  return (
    <div className="flex-1 flex flex-col bg-slate/5">
      {/* Page Header */}
      <div className="bg-white border-b border-slate/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pay Application Complete</h1>
            <p className="text-slate/70 text-sm">Your pay application has been finalized</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 border border-slate/30 rounded-md hover:bg-slate/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleDone}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Tab Switcher */}
          <div className="bg-white rounded-lg border border-slate/20 mb-6">
            <div className="flex border-b border-slate/10">
              <button
                onClick={() => setActiveTab('summary')}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${activeTab === 'summary'
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                    : 'text-slate/600 hover:text-slate-900'
                  }
                `}
              >
                Payment Summary
              </button>
              <button
                onClick={() => setActiveTab('sov')}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${activeTab === 'sov'
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                    : 'text-slate/600 hover:text-slate-900'
                  }
                `}
              >
                Schedule of Values
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'summary' ? (
                // Payment Summary Tab
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-slate/60" />
                      <h2 className="text-xl font-semibold text-slate-900">
                        Pay Application Summary
                      </h2>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Finalized
                    </Badge>
                  </div>

                  {/* Project Info Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate/50 p-4 rounded-lg">
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

                  {/* Payment Totals */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">Application and Certificate for Payment</h3>
                    <div className="bg-white border border-slate/20 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-slate/10">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">1.</td>
                            <td className="px-4 py-3 text-sm text-slate-900">Original Contract Sum</td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                              {formatCurrency(totals.originalContractSum)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate/10">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">2.</td>
                            <td className="px-4 py-3 text-sm text-slate-900">Net Change by Change Orders</td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                              {formatCurrency(totals.netChangeByChangeOrders)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate/10 bg-slate/5">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">3.</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                              Contract Sum to Date (Line 1 + 2)
                            </td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold">
                              {formatCurrency(totals.contractSumToDate)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate/10">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">4.</td>
                            <td className="px-4 py-3 text-sm text-slate-900">Total Completed & Stored to Date</td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                              {formatCurrency(totals.totalCompletedAndStoredToDate)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate/10">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">5.</td>
                            <td className="px-4 py-3 text-sm text-slate-900">Retainage</td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                              {formatCurrency(totals.totalRetainage)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate/10 bg-slate/5">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">6.</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                              Total Earned Less Retainage (Line 4 – 5)
                            </td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold">
                              {formatCurrency(totals.totalEarnedLessRetainage)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate/10">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 w-12">7.</td>
                            <td className="px-4 py-3 text-sm text-slate-900">Less Previous Certificates for Payment</td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-medium">
                              {formatCurrency(totals.lessPreviousCertificates)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate/10 bg-teal-50 border-l-4 border-l-teal-600">
                            <td className="px-4 py-3 text-sm font-bold text-teal-700 w-12">8.</td>
                            <td className="px-4 py-3 text-sm font-bold text-teal-900">
                              Current Payment Due
                            </td>
                            <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-teal-900 text-lg">
                              {formatCurrency(totals.currentPaymentDue)}
                            </td>
                          </tr>
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

                  {/* Signature Block */}
                  {currentPayApp.signatureInfo && (
                    <div className="border-t-2 border-t-slate/20 pt-4 space-y-4">
                      <div className="text-sm text-slate/600">Contractor's Signature</div>
                      <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                          <div className="border-b border-slate/40 pb-1 mb-2">
                            {currentPayApp.signatureInfo.signerName}
                          </div>
                          <div className="text-slate/60">Signer's Name</div>
                        </div>
                        <div>
                          <div className="border-b border-slate/40 pb-1 mb-2">
                            {currentPayApp.signatureInfo.title}
                          </div>
                          <div className="text-slate/60">Title</div>
                        </div>
                        <div className="col-span-2">
                          <div className="border-b border-slate/40 pb-1 mb-2">
                            {formatDate(currentPayApp.signatureInfo.date)}
                          </div>
                          <div className="text-slate/60">Date</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Schedule of Values Tab
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-slate/60" />
                      <h2 className="text-xl font-semibold text-slate-900">
                        Schedule of Values
                      </h2>
                    </div>
                    <Badge variant="outline">
                      {currentPayApp.lineItems.length} line item{currentPayApp.lineItems.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Line Items Table */}
                  <div className="bg-white border border-slate/20 rounded-lg overflow-hidden">
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
                        {displayLineItems.map((item, index) => {
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
                    
                    {hasMoreLineItems && (
                      <div className="px-4 py-3 text-sm text-slate/60 text-center border-t border-slate/10">
                        …and {currentPayApp.lineItems.length - 5} more row{currentPayApp.lineItems.length - 5 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
