'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Plus, Trash2, ArrowRightLeft, List, Hash } from 'lucide-react'
import type { ChangeOrderSettings, ChangeOrder, ChangeOrderMode } from '@/app/pay-applications/types'
import { generateChangeOrderId } from '@/app/pay-applications/calculations'

export default function ChangeOrdersPage() {
  const router = useRouter()
  const { currentPayApp, updateChangeOrderSettings, markStepCompleted } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [hasChangeOrders, setHasChangeOrders] = useState(false)
  const [mode, setMode] = useState<ChangeOrderMode>('totals-only')
  const [totalAmount, setTotalAmount] = useState('')
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([])

  useEffect(() => {
    if (currentPayApp?.changeOrderSettings) {
      const s = currentPayApp.changeOrderSettings
      setHasChangeOrders(s.hasChangeOrders)
      setMode(s.mode)
      setTotalAmount(s.totalAmount?.toString() || '')
      setChangeOrders(s.changeOrders || [])
    }
  }, [currentPayApp])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      const settings: ChangeOrderSettings = {
        hasChangeOrders,
        mode,
        changeOrders: mode === 'individual' ? changeOrders : [],
        ...(mode === 'totals-only' && totalAmount ? { totalAmount: parseFloat(totalAmount) || 0 } : {}),
      }
      await updateChangeOrderSettings(settings)
      await markStepCompleted(4)
      router.push(`/pay-applications/${currentPayApp?.id}/materials-stored`)
    } catch (error) {
      console.error('Failed to save change order settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addChangeOrder = () => {
    setChangeOrders(prev => [...prev, { id: generateChangeOrderId(), number: '', description: '', amount: 0 }])
  }

  const updateChangeOrder = (id: string, field: keyof ChangeOrder, value: string | number) => {
    setChangeOrders(prev => prev.map(co => co.id === id ? { ...co, [field]: value } : co))
  }

  const deleteChangeOrder = (id: string) => {
    setChangeOrders(prev => prev.filter(co => co.id !== id))
  }

  const inputClass = 'px-3 py-2.5 bg-white border border-slate/20 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors hover:border-slate/35'

  const guide = (
    <StepGuide
      title="Change Orders"
      subtitle="Only include change orders that have been formally approved in writing."
      blocks={[
        {
          type: 'intro',
          text: 'A change order (CO) is a written amendment to the original contract that modifies the scope, schedule, or price. Change orders must be approved by the owner (and usually the architect) before they can be billed.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
          heading: 'Approved vs. Pending',
          body: [
            'Only include approved change orders — ones with a signed document from the owner.',
            'Pending or disputed change orders should NOT appear in a pay application. Including unapproved COs is a common reason for rejection.',
          ],
        },
        {
          type: 'warning',
          text: 'Do not include verbal approvals or email agreements unless your contract explicitly allows it. Only signed change orders belong here.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <List className="w-3.5 h-3.5" />,
          heading: 'Entry Modes',
          body: [
            'Totals Only — enter the net approved change order value as a single number. Fast, but provides less transparency.',
            'Individual — list each approved CO separately with its number, description, and amount. Preferred on projects with many COs.',
          ],
        },
        {
          type: 'tip',
          text: 'Listing change orders individually makes it easier for the architect to cross-reference their records and certify faster.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Hash className="w-3.5 h-3.5" />,
          heading: 'Numbering',
          body: 'Number change orders sequentially (CO-001, CO-002…). The number must match the approved change order document. Deviations will cause the architect to request clarification.',
        },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Contract Sum to Date',
              definition: 'The original contract sum plus all approved change orders to date. This is the total amount the contractor is authorized to bill.',
            },
            {
              term: 'Net Change',
              definition: 'The cumulative change order amount — positive for additions, negative for deductions. Shown on the G702 cover sheet.',
            },
          ],
        },
      ]}
    />
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-8 pt-7 pb-5 border-b border-slate/10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate/40 uppercase tracking-widest mb-2">
          <span>Step 2</span>
          <span className="text-slate/20">·</span>
          <span>Billing</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Change Orders</h1>
        <p className="text-sm text-slate/55 mt-1">Optionally add approved change orders for this billing period.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-5">

          {/* Toggle */}
          <div
            onClick={() => setHasChangeOrders(!hasChangeOrders)}
            className={`cursor-pointer rounded-xl border p-5 bg-white shadow-sm transition-all duration-200 ${
              hasChangeOrders ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate/15 hover:border-slate/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${hasChangeOrders ? 'bg-teal-600' : 'bg-slate/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 mt-0.5 ${hasChangeOrders ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Include change orders in this application</div>
                <div className="text-xs text-slate/50 mt-0.5">Only include change orders approved in writing</div>
              </div>
            </div>
          </div>

          {hasChangeOrders && (
            <>
              {/* Mode selection */}
              <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate/50 mb-3">Entry Mode</h3>
                <div className="space-y-3">
                  {([
                    { value: 'totals-only' as const, label: 'Enter total amount only', desc: 'Fast — one number for all COs combined' },
                    { value: 'individual' as const,   label: 'List individual change orders', desc: 'Recommended — each CO listed separately' },
                  ] as const).map(opt => (
                    <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="changeOrderMode"
                        value={opt.value}
                        checked={mode === opt.value}
                        onChange={() => setMode(opt.value)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-700">{opt.label}</div>
                        <div className="text-xs text-slate/45">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Totals Only */}
              {mode === 'totals-only' && (
                <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate/50 mb-3">Total Change Order Amount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={totalAmount}
                      onChange={e => setTotalAmount(e.target.value)}
                      className={`w-44 ${inputClass}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Individual */}
              {mode === 'individual' && (
                <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate/50">Change Orders</h3>
                  {changeOrders.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate/50">No change orders added yet</div>
                  ) : (
                    <div className="space-y-2">
                      {changeOrders.map(co => (
                        <div key={co.id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-2">
                            <input type="text" value={co.number} onChange={e => updateChangeOrder(co.id, 'number', e.target.value)}
                              className={`w-full ${inputClass}`} placeholder="CO #" />
                          </div>
                          <div className="col-span-6">
                            <input type="text" value={co.description} onChange={e => updateChangeOrder(co.id, 'description', e.target.value)}
                              className={`w-full ${inputClass}`} placeholder="Description" />
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-600 text-sm">$</span>
                              <input type="number" min="0" step="0.01" value={co.amount}
                                onChange={e => updateChangeOrder(co.id, 'amount', parseFloat(e.target.value) || 0)}
                                className={`w-full ${inputClass}`} placeholder="0.00" />
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button onClick={() => deleteChangeOrder(co.id)}
                              className="p-1.5 text-danger/60 hover:text-danger hover:bg-danger/5 rounded transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={addChangeOrder}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Add Change Order
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp?.id}/retainage`)}
          onContinue={handleContinue}
          continueDisabled={isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
