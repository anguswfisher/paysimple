'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { useSupabase } from '@/components/providers/supabase-provider'
import { generateLineItemId } from '@/app/pay-applications/calculations'
import { Info, ArrowLeft, Copy, History, RefreshCw } from 'lucide-react'

export default function SOVImportPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()
  const { currentPayApp, payApps, setLineItems, loadPayApps } = usePayAppStore()
  const [selectedPayAppId, setSelectedPayAppId] = useState<string>('')
  const [bringForwardScheduled, setBringForwardScheduled] = useState(true)
  const [bringForwardWorkCompleted, setBringForwardWorkCompleted] = useState(true)
  const [resetThisPeriod, setResetThisPeriod] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const finalizedPayApps = payApps.filter(app => app.status === 'finalized' && app.id !== currentPayApp?.id)

  useEffect(() => {
    if (user && !authLoading && payApps.length === 0) {
      loadPayApps(user.id).catch(err => console.error('Failed to load pay applications:', err))
    }
  }, [authLoading, loadPayApps, payApps.length, user])

  useEffect(() => {
    if (!selectedPayAppId && finalizedPayApps.length === 1) {
      setSelectedPayAppId(finalizedPayApps[0].id)
    }
  }, [finalizedPayApps, selectedPayAppId])

  const handleContinue = async () => {
    if (!selectedPayAppId) return
    setIsLoading(true)
    try {
      const sourcePayApp = finalizedPayApps.find(app => app.id === selectedPayAppId)
      if (!sourcePayApp) return

      const importedItems = sourcePayApp.lineItems.map((item, index) => ({
        id: generateLineItemId(),
        lineNumber: String(index + 1),
        description: item.description,
        scheduledValue: bringForwardScheduled ? item.scheduledValue : 0,
        previousWork: bringForwardWorkCompleted ? (item.workToDate ?? 0) : 0,
        thisPeriodWork: resetThisPeriod ? 0 : (item.thisPeriodWork ?? 0),
        previousMaterialsStored: bringForwardWorkCompleted ? (item.materialsToDate ?? 0) : 0,
        thisPeriodMaterialsStored: resetThisPeriod ? 0 : (item.thisPeriodMaterialsStored ?? 0),
      }))

      await setLineItems(importedItems)
      router.push(`/pay-applications/${currentPayApp?.id}/workspace`)
    } catch (error) {
      console.error('Failed to import line items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate/50">Pay application not found.</div>
      </div>
    )
  }

  const selectedPayApp = finalizedPayApps.find(app => app.id === selectedPayAppId)
  const selectClass = 'w-full px-3 py-2.5 bg-white border border-slate/20 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors'

  const guide = (
    <StepGuide
      title="Import from Previous Pay App"
      subtitle="Roll your line items forward from the last finalized application."
      blocks={[
        {
          type: 'intro',
          text: 'Importing from a previous application is the fastest and most accurate way to start a new application on an ongoing project. It copies your line items and brings forward historical work-completed amounts automatically.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <History className="w-3.5 h-3.5" />,
          heading: 'Source Application',
          body: 'Only finalized applications appear in the list. A finalized application has been submitted and locked — its line item data is authoritative for roll-forward purposes.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <RefreshCw className="w-3.5 h-3.5" />,
          heading: 'Import Options Explained',
          body: [
            'Bring Forward Scheduled Values — keeps the original dollar amount per line item. Disable only if the contract scope has changed.',
            'Bring Forward Work Completed — sets "Previous Applications" to the total work completed as of the source application. Almost always enabled.',
            'Reset This Period to Zero — clears "This Period" amounts so you start fresh. Almost always enabled.',
          ],
        },
        {
          type: 'tip',
          text: 'The most common settings are: all three options enabled. This gives you a clean slate for the current period while preserving the historical record.',
        },
        {
          type: 'warning',
          text: 'If the previous application had change orders that added new line items, those will be imported too. Review the preview carefully.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Copy className="w-3.5 h-3.5" />,
          heading: 'After Import',
          body: 'After importing you\'ll be taken to the workspace where you enter "This Period" work amounts for each line item. The previous amounts are locked — only the current period is editable.',
        },
      ]}
    />
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-8 pt-7 pb-5 border-b border-slate/10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate/40 uppercase tracking-widest mb-2">
          <span>Step 3</span>
          <span className="text-slate/20">·</span>
          <span>SOV</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Import Schedule of Values</h1>
        <p className="text-sm text-slate/55 mt-1">Import line items from a previous finalized pay application.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-5">
          {finalizedPayApps.length === 0 ? (
            <div className="bg-white border border-slate/15 rounded-xl p-8 shadow-sm text-center">
              <div className="w-12 h-12 bg-slate/8 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-5 h-5 text-slate/40" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">No finalized applications available</h3>
              <p className="text-sm text-slate/55 mb-5">Finalized applications from this project will appear here.</p>
              <button onClick={() => router.push(`/pay-applications/${currentPayApp.id}/sov-method`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Choose Another Method
              </button>
            </div>
          ) : (
            <>
              {/* Source selection */}
              <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate/50 mb-2">Source Application</label>
                <select value={selectedPayAppId} onChange={e => setSelectedPayAppId(e.target.value)} className={selectClass}>
                  <option value="">Select a pay application...</option>
                  {finalizedPayApps.map(app => (
                    <option key={app.id} value={app.id}>
                      App #{app.basics.applicationNumber} — {app.basics.projectName} ({new Date(app.basics.periodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                    </option>
                  ))}
                </select>
              </div>

              {/* Options */}
              {selectedPayApp && (
                <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate/50">Import Options</h3>
                  {[
                    { checked: bringForwardScheduled,    setter: setBringForwardScheduled,    label: 'Bring forward scheduled values',      desc: 'Keep original contract amounts per line item' },
                    { checked: bringForwardWorkCompleted, setter: setBringForwardWorkCompleted, label: 'Bring forward work completed to date', desc: 'Set previous work from prior period totals' },
                    { checked: resetThisPeriod,           setter: setResetThisPeriod,           label: 'Reset this period amounts to zero',   desc: 'Start fresh for the current billing period' },
                  ].map(opt => (
                    <label key={opt.label} className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={opt.checked} onChange={e => opt.setter(e.target.checked)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-slate-700">{opt.label}</div>
                        <div className="text-xs text-slate/45">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Preview */}
              {selectedPayApp && selectedPayApp.lineItems.length > 0 && (
                <div className="bg-white border border-slate/15 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate/50">Preview — First 5 Line Items</h3>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate/8 bg-slate/3">
                        <th className="text-left py-2 px-4 text-xs text-slate/40 font-medium">#</th>
                        <th className="text-left py-2 px-4 text-xs text-slate/40 font-medium">Description</th>
                        <th className="text-right py-2 px-4 text-xs text-slate/40 font-medium">Scheduled Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate/5">
                      {selectedPayApp.lineItems.slice(0, 5).map((item, i) => (
                        <tr key={item.id}>
                          <td className="py-2 px-4 text-xs tabular-nums text-slate/50">{item.lineNumber || i + 1}</td>
                          <td className="py-2 px-4 text-sm text-slate-700">{item.description}</td>
                          <td className="py-2 px-4 text-sm text-right tabular-nums text-slate-700">${item.scheduledValue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedPayApp.lineItems.length > 5 && (
                    <div className="px-4 py-2 text-xs text-slate/40 text-center border-t border-slate/5">
                      …and {selectedPayApp.lineItems.length - 5} more line items
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp.id}/sov-method`)}
          onContinue={handleContinue}
          continueLabel="Import & Continue to Workspace"
          continueDisabled={!selectedPayAppId || isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
