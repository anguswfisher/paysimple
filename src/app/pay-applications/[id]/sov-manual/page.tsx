'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Plus, Trash2, Info, Rows3, DollarSign } from 'lucide-react'
import { generateLineItemId } from '@/app/pay-applications/calculations'
import type { LineItem } from '@/app/pay-applications/types'

export default function SOVManualPage() {
  const router = useRouter()
  const { currentPayApp, setLineItems } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)

  const addLineItem = () => {
    const newItem: LineItem = {
      id: generateLineItemId(),
      lineNumber: String((currentPayApp?.lineItems.length || 0) + 1),
      description: '',
      scheduledValue: 0,
      previousWork: 0,
      thisPeriodWork: 0,
      previousMaterialsStored: 0,
      thisPeriodMaterialsStored: 0,
    }
    setLineItems([...(currentPayApp?.lineItems || []), newItem])
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    if (!currentPayApp) return
    let updatedItems: LineItem[]
    if (field === 'lineNumber') {
      const newLineNumber = String(value)
      const oldLineNumber = currentPayApp.lineItems.find(i => i.id === id)?.lineNumber || '1'
      updatedItems = currentPayApp.lineItems.map(item => {
        if (item.id === id) return { ...item, lineNumber: newLineNumber }
        if (parseInt(item.lineNumber) >= parseInt(newLineNumber) && parseInt(item.lineNumber) < parseInt(oldLineNumber))
          return { ...item, lineNumber: String(parseInt(item.lineNumber) + 1) }
        if (parseInt(item.lineNumber) <= parseInt(newLineNumber) && parseInt(item.lineNumber) > parseInt(oldLineNumber))
          return { ...item, lineNumber: String(parseInt(item.lineNumber) - 1) }
        return item
      })
    } else {
      updatedItems = currentPayApp.lineItems.map(item => item.id === id ? { ...item, [field]: value } : item)
    }
    setLineItems(updatedItems)
  }

  const deleteLineItem = (id: string) => {
    if (!currentPayApp || currentPayApp.lineItems.length <= 1) return
    const updatedItems = currentPayApp.lineItems
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, lineNumber: String(index + 1) }))
    setLineItems(updatedItems)
  }

  const totalScheduledValue = currentPayApp?.lineItems.reduce((sum, item) => sum + (item.scheduledValue || 0), 0) || 0

  useEffect(() => {
    if (currentPayApp && (!currentPayApp.lineItems || currentPayApp.lineItems.length === 0)) {
      addLineItem()
    }
  }, [currentPayApp])

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate/50">Pay application not found.</div>
      </div>
    )
  }

  const inputClass = 'w-full px-2.5 py-2 bg-white border border-slate/15 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors hover:border-slate/30'

  const guide = (
    <StepGuide
      title="Enter Schedule of Values"
      subtitle="Building your SOV manually gives you full control over line item structure."
      blocks={[
        {
          type: 'intro',
          text: 'Each row in the Schedule of Values represents a distinct division of work. The sum of all scheduled values must equal your original contract amount.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Rows3 className="w-3.5 h-3.5" />,
          heading: 'How to Structure Line Items',
          body: [
            'Use CSI MasterFormat divisions as a guide (01 General Conditions, 03 Concrete, 05 Metals…).',
            'Break large work categories into sub-items when the architect needs visibility.',
            'Keep descriptions concise but specific — "Concrete Foundations" not just "Concrete".',
          ],
        },
        {
          type: 'tip',
          text: 'Aim for 10–40 line items on a typical project. Too few lacks detail; too many becomes unmanageable to update every month.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <DollarSign className="w-3.5 h-3.5" />,
          heading: 'Allocating Scheduled Values',
          body: [
            'Divide your contract sum across line items proportionally to their cost.',
            'Include mobilization, general conditions, and closeout as separate line items.',
            'Include your overhead and profit in each line item rather than as a separate line — some owners object to a visible "profit" line.',
          ],
        },
        {
          type: 'warning',
          text: 'The total scheduled value must equal your contract sum exactly. A mismatch will cause the G702 calculations to be incorrect.',
        },
        {
          type: 'checklist',
          heading: 'Before you continue',
          items: [
            'Total scheduled value equals original contract sum',
            'Each line item has a clear, descriptive label',
            'General conditions and mobilization are separate line items',
            'You\'ll enter "this period" work amounts in the workspace next',
          ],
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enter Schedule of Values</h1>
        <p className="text-sm text-slate/55 mt-1">Add line items for your pay application manually.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-4">
          <div className="bg-white border border-slate/15 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10 bg-slate/3">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate/50 w-16">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate/50">Description</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate/50 w-44">Scheduled Value</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/5">
                {currentPayApp.lineItems.map(item => (
                  <tr key={item.id} className="group hover:bg-slate/2">
                    <td className="py-2 px-4">
                      <input type="number" min="1" value={item.lineNumber}
                        onChange={e => updateLineItem(item.id, 'lineNumber', parseInt(e.target.value) || 1)}
                        className={`w-12 text-center ${inputClass}`} />
                    </td>
                    <td className="py-2 px-4">
                      <input type="text" value={item.description}
                        onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="e.g., 03000 — Concrete"
                        className={inputClass} />
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate/40 text-sm">$</span>
                        <input type="number" min="0" step="0.01" value={item.scheduledValue}
                          onChange={e => updateLineItem(item.id, 'scheduledValue', parseFloat(e.target.value) || 0)}
                          className={`${inputClass} text-right tabular-nums`} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button onClick={() => deleteLineItem(item.id)}
                        disabled={currentPayApp.lineItems.length <= 1}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-danger/60 hover:text-danger hover:bg-danger/5 rounded transition-all disabled:opacity-20">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate/15 bg-slate/3">
                  <td colSpan={2} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate/50">Total Scheduled Value</td>
                  <td className="py-3 px-4 text-right text-sm font-bold text-slate-900 tabular-nums">
                    ${totalScheduledValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={addLineItem}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </button>
            <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              You'll enter work-completed amounts in the full workspace next.
            </div>
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp.id}/sov-method`)}
          onContinue={() => router.push(`/pay-applications/${currentPayApp.id}/workspace`)}
          continueLabel="Continue to Workspace"
          continueDisabled={isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
