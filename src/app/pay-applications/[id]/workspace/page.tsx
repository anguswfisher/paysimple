'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { usePayAppStore } from '@/app/pay-applications/store'
import { AlertTriangle, Save, FileText, Eye } from 'lucide-react'
import type { LineItem } from '@/app/pay-applications/types'

export default function WorkspacePage() {
  const router = useRouter()
  const { currentPayApp, updateLineItem, getG702Totals } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showWarnings, setShowWarnings] = useState(false)

  useEffect(() => {
    // This page reads from currentPayApp, no additional loading needed
  }, [])

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleReviewSummary = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/summary`)
  }

  const handleCellBlur = (id: string, field: keyof LineItem, value: string | number) => {
    updateLineItem(id, { [field]: value })
  }

  const getWarningCount = () => {
    return currentPayApp?.lineItems.filter(item => 
      (item.earnedToDate || 0) > item.scheduledValue
    ).length || 0
  }

  const getWarningItems = () => {
    return currentPayApp?.lineItems.filter(item => 
      (item.earnedToDate || 0) > item.scheduledValue
    ) || []
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const totals = getG702Totals()
  const warningCount = getWarningCount()

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
    <div className="flex-1 flex flex-col bg-white">
      {/* Custom Header - Full Width */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {currentPayApp.basics.projectName} - App #{currentPayApp.basics.applicationNumber}
            </h1>
            <p className="text-slate/70 text-sm">Schedule of Values</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAndExit}
              className="flex items-center gap-2 px-4 py-2 border border-slate/30 rounded-md hover:bg-slate/5 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save & Exit
            </button>
            <button
              onClick={handleReviewSummary}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Review Summary
            </button>
          </div>
        </div>
      </div>

      {/* Warning Bar */}
      {warningCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-amber-800 text-sm font-medium">
              {warningCount} line item{warningCount !== 1 ? 's' : ''} have warnings
            </span>
          </div>
          <button
            onClick={() => setShowWarnings(true)}
            className="flex items-center gap-1 text-amber-700 hover:text-amber-800 text-sm"
          >
            <Eye className="w-3 h-3" />
            View Details
          </button>
        </div>
      )}

      {/* Main Grid Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1200px]">
          <table className="w-full text-sm">
            {/* Header Row 1 - Column Names */}
            <thead className="sticky top-0 bg-slate/5 border-b border-slate/10">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-700 w-16">#</th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">Description of Work</th>
                <th className="px-4 py-2 text-right font-medium text-slate-700 w-32">Scheduled Value</th>
                <th className="px-4 py-2 text-right font-medium text-slate-700 w-32">Previous Applications</th>
                <th className="px-4 py-2 text-right font-medium text-slate-700 w-32">This Period</th>
                {currentPayApp.materialsStoredEnabled && (
                  <th className="px-4 py-2 text-right font-medium text-slate-700 w-32">Materials Stored</th>
                )}
                <th className="px-4 py-2 text-right font-medium text-slate-700 w-32">Total Completed & Stored</th>
                <th className="px-4 py-2 text-right font-medium text-slate-700 w-20">%</th>
                <th className="px-4 py-2 text-right font-medium text-slate-700 w-32">Balance to Finish</th>
                <th className="px-4 py-2 text-right font-medium text-slate-700 w-32">Retainage</th>
              </tr>
            </thead>
            
            {/* Header Row 2 - Column Letters */}
            <thead className="sticky top-8 bg-slate/5 border-b border-slate/10">
              <tr>
                <th className="px-4 py-1 text-center font-medium text-slate/60 text-xs"></th>
                <th className="px-4 py-1 text-center font-medium text-slate/60 text-xs">A</th>
                <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">B</th>
                <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">C</th>
                <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">D</th>
                {currentPayApp.materialsStoredEnabled && (
                  <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">E</th>
                )}
                <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">
                  {currentPayApp.materialsStoredEnabled ? 'F' : 'E'}
                </th>
                <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">
                  {currentPayApp.materialsStoredEnabled ? 'G' : 'F'}
                </th>
                <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">
                  {currentPayApp.materialsStoredEnabled ? 'H' : 'G'}
                </th>
                <th className="px-4 py-2 text-center font-medium text-slate/60 text-xs">
                  {currentPayApp.materialsStoredEnabled ? 'I' : 'H'}
                </th>
              </tr>
            </thead>

            <tbody>
              {currentPayApp.lineItems.map((item) => {
                const hasWarning = (item.earnedToDate || 0) > item.scheduledValue
                const totalCompleted = (item.workToDate || 0) + (item.materialsToDate || 0)
                const percentComplete = item.scheduledValue > 0 ? (totalCompleted / item.scheduledValue) * 100 : 0
                const balance = item.scheduledValue - totalCompleted
                const retainage = totalCompleted * (currentPayApp.retainageSettings.retainagePercent / 100)

                return (
                  <tr 
                    key={item.id} 
                    className={`border-b border-slate/5 hover:bg-slate/5 ${
                      hasWarning ? 'border-l-4 border-l-amber-400' : ''
                    }`}
                  >
                    {/* Line Number */}
                    <td className="px-4 py-2 text-center tabular-nums">{item.lineNumber}</td>
                    
                    {/* Description - Editable */}
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onBlur={(e) => handleCellBlur(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-slate/20 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter description"
                      />
                    </td>
                    
                    {/* Scheduled Value - Editable */}
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.scheduledValue}
                        onBlur={(e) => handleCellBlur(item.id, 'scheduledValue', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate/20 rounded text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>
                    
                    {/* Previous Applications - Read-only */}
                    <td className="px-4 py-2 text-right tabular-nums text-slate/60">
                      {formatCurrency(item.previousWork)}
                    </td>
                    
                    {/* This Period - Editable */}
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.thisPeriodWork}
                        onBlur={(e) => handleCellBlur(item.id, 'thisPeriodWork', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate/20 rounded text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>
                    
                    {/* Materials Stored - Conditional Editable */}
                    {currentPayApp.materialsStoredEnabled && (
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.thisPeriodMaterialsStored}
                          onBlur={(e) => handleCellBlur(item.id, 'thisPeriodMaterialsStored', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-slate/20 rounded text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </td>
                    )}
                    
                    {/* Total Completed & Stored - Read-only */}
                    <td className="px-4 py-2 text-right tabular-nums text-slate/60">
                      {formatCurrency(totalCompleted)}
                    </td>
                    
                    {/* % Complete - Read-only */}
                    <td className="px-4 py-2 text-right tabular-nums text-slate/60">
                      {formatPercent(percentComplete)}
                    </td>
                    
                    {/* Balance to Finish - Read-only */}
                    <td className="px-4 py-2 text-right tabular-nums text-slate/60">
                      {formatCurrency(balance)}
                    </td>
                    
                    {/* Retainage - Read-only */}
                    <td className="px-4 py-2 text-right tabular-nums text-slate/60">
                      {formatCurrency(retainage)}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Grand Totals Footer */}
            <tfoot className="sticky bottom-16 bg-slate/5 border-t-2 border-t-slate/20">
              <tr className="font-semibold">
                <td className="px-4 py-3 text-center">TOTALS</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(totals.contractSumToDate)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate/60">
                  {formatCurrency(totals.lessPreviousCertificates)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(totals.currentPaymentDue)}
                </td>
                {currentPayApp.materialsStoredEnabled && (
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(0)} {/* TODO: Calculate materials stored total */}
                  </td>
                )}
                <td className="px-4 py-3 text-right tabular-nums text-slate/60">
                  {formatCurrency(totals.totalCompletedAndStoredToDate)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate/60"></td>
                <td className="px-4 py-3 text-right tabular-nums text-slate/60">
                  {formatCurrency(totals.balanceToFinishIncludingRetainage)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate/60">
                  {formatCurrency(totals.totalRetainage)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sticky Footer with KPI Cards */}
      <div className="sticky bottom-0 bg-white border-t border-slate/10 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-slate/60 mb-1">Current Contract Sum</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatCurrency(totals.contractSumToDate)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-slate/60 mb-1">Total Completed & Stored</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatCurrency(totals.totalCompletedAndStoredToDate)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-slate/60 mb-1">Less Retainage</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatCurrency(totals.totalRetainage)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-teal-200 bg-teal-50/20">
            <CardContent className="p-4">
              <div className="text-xs text-teal-600 mb-1">Current Payment Due</div>
              <div className="text-lg font-semibold text-teal-600 tabular-nums">
                {formatCurrency(totals.currentPaymentDue)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarnings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-slate-900">Line Item Warnings</h3>
              </div>
              <div className="space-y-3">
                {getWarningItems().map((item) => (
                  <div key={item.id} className="border-l-4 border-amber-400 pl-4 py-2">
                    <div className="font-medium text-slate-900">
                      Line {item.lineNumber}: {item.description}
                    </div>
                    <div className="text-sm text-amber-700">
                      Earned to date ({formatCurrency(item.earnedToDate || 0)}) exceeds scheduled value ({formatCurrency(item.scheduledValue)})
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowWarnings(false)}
                className="mt-6 w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
