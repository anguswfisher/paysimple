'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Info, ArrowLeft } from 'lucide-react'

export default function SOVImportPage() {
  const router = useRouter()
  const { currentPayApp, payApps, setLineItems } = usePayAppStore()
  const [selectedPayAppId, setSelectedPayAppId] = useState<string>('')
  const [bringForwardScheduled, setBringForwardScheduled] = useState(true)
  const [bringForwardWorkCompleted, setBringForwardWorkCompleted] = useState(true)
  const [resetThisPeriod, setResetThisPeriod] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Filter finalized pay apps (exclude current)
  const finalizedPayApps = payApps.filter(
    app => app.status === 'finalized' && app.id !== currentPayApp?.id
  )

  useEffect(() => {
    // This page doesn't need to load anything since we're reading from store
  }, [])

  const handleContinue = async () => {
    if (!selectedPayAppId) return

    setIsLoading(true)
    try {
      const sourcePayApp = finalizedPayApps.find(app => app.id === selectedPayAppId)
      if (!sourcePayApp) return

      // Apply rollforward logic to line items
      const importedItems = sourcePayApp.lineItems.map(item => ({
        ...item,
        id: item.id, // Keep original ID for now, could generate new ones if needed
        // Rollforward logic
        previousWork: bringForwardWorkCompleted ? (item.workToDate ?? 0) : 0,
        thisPeriodWork: resetThisPeriod ? 0 : (item.thisPeriodWork ?? 0),
        // Keep other fields as-is or reset based on options
        scheduledValue: bringForwardScheduled ? item.scheduledValue : 0,
        // Reset materials if needed
        previousMaterialsStored: bringForwardWorkCompleted ? (item.materialsToDate ?? 0) : 0,
        thisPeriodMaterialsStored: resetThisPeriod ? 0 : (item.thisPeriodMaterialsStored ?? 0),
      }))

      await setLineItems(importedItems)
      router.push(`/pay-applications/${currentPayApp?.id}/workspace`)
    } catch (error) {
      console.error('Failed to import line items:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/sov-method`)
  }

  const handleChooseAnotherMethod = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/sov-method`)
  }

  const formatPeriodEnd = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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

  const selectedPayApp = finalizedPayApps.find(app => app.id === selectedPayAppId)

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Import Schedule of Values</h1>
        <p className="text-slate/70 mt-1">
          Import line items from a previous finalized pay application
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {finalizedPayApps.length === 0 ? (
            // Empty State
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-6 h-6 text-slate/40" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No finalized pay applications available
                </h3>
                <p className="text-slate/70 mb-6">
                  Please enter line items manually or create a finalized pay application first.
                </p>
                <button
                  onClick={handleChooseAnotherMethod}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Choose Another Method
                </button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Dropdown Select */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontVariant: 'small-caps' }}>
                    Previous Pay Application
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={selectedPayAppId}
                    onChange={(e) => setSelectedPayAppId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select a pay application...</option>
                    {finalizedPayApps.map((app) => (
                      <option key={app.id} value={app.id}>
                        App #{app.basics.applicationNumber} - {app.basics.projectName} ({formatPeriodEnd(app.basics.periodEndDate)})
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Import Options */}
              {selectedPayApp && (
                <Card>
                  <CardHeader>
                    <CardTitle style={{ fontVariant: 'small-caps' }}>
                      Import Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bringForwardScheduled}
                        onChange={(e) => setBringForwardScheduled(e.target.checked)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded"
                      />
                      <div>
                        <div className="text-slate-700">Bring forward scheduled values</div>
                        <div className="text-sm text-slate/60">
                          Keep the original scheduled values from the previous application
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bringForwardWorkCompleted}
                        onChange={(e) => setBringForwardWorkCompleted(e.target.checked)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded"
                      />
                      <div>
                        <div className="text-slate-700">Bring forward work completed to date</div>
                        <div className="text-sm text-slate/60">
                          Set previous work amounts based on completed work from the previous period
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={resetThisPeriod}
                        onChange={(e) => setResetThisPeriod(e.target.checked)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded"
                      />
                      <div>
                        <div className="text-slate-700">Reset this period amounts to zero</div>
                        <div className="text-sm text-slate/60">
                          Start with zero amounts for the current billing period
                        </div>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              )}

              {/* Preview Table */}
              {selectedPayApp && selectedPayApp.lineItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle style={{ fontVariant: 'small-caps' }}>
                      Preview (First 5 Line Items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate/10">
                            <th className="text-left py-2 px-3 text-sm font-medium text-slate/70">
                              Line #
                            </th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-slate/70">
                              Description
                            </th>
                            <th className="text-right py-2 px-3 text-sm font-medium text-slate/70">
                              Scheduled Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPayApp.lineItems.slice(0, 5).map((item, index) => (
                            <tr key={item.id} className="border-b border-slate/5">
                              <td className="py-2 px-3 text-sm tabular-nums">
                                {item.lineNumber || index + 1}
                              </td>
                              <td className="py-2 px-3 text-sm">
                                {item.description}
                              </td>
                              <td className="py-2 px-3 text-sm text-right tabular-nums">
                                ${item.scheduledValue.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {selectedPayApp.lineItems.length > 5 && (
                        <div className="text-sm text-slate/60 mt-2 text-center">
                          ... and {selectedPayApp.lineItems.length - 5} more line items
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Import & Continue to Workspace"
        continueDisabled={!selectedPayAppId || isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
