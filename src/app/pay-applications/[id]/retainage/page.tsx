'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { PiggyBank, Percent, Layers } from 'lucide-react'
import type { RetainageSettings, RetainageAppliesTo } from '@/app/pay-applications/types'

export default function RetainagePage() {
  const router = useRouter()
  const { currentPayApp, updateRetainageSettings, markStepCompleted } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [retainagePercent, setRetainagePercent] = useState(10)
  const [appliesTo, setAppliesTo] = useState<RetainageAppliesTo>('both')
  const [canChangeOverTime, setCanChangeOverTime] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState('')
  const [newRetainagePercent, setNewRetainagePercent] = useState(10)

  useEffect(() => {
    if (currentPayApp?.retainageSettings) {
      const s = currentPayApp.retainageSettings
      setRetainagePercent(s.retainagePercent)
      setAppliesTo(s.appliesTo)
      setCanChangeOverTime(s.canChangeOverTime)
      setEffectiveDate(s.effectiveDate || '')
      setNewRetainagePercent(s.newRetainagePercent || s.retainagePercent)
    }
  }, [currentPayApp])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      const settings: RetainageSettings = {
        retainagePercent,
        appliesTo,
        canChangeOverTime,
        ...(canChangeOverTime && {
          effectiveDate: effectiveDate || undefined,
          newRetainagePercent,
        }),
      }
      await updateRetainageSettings(settings)
      await markStepCompleted(3)
      router.push(`/pay-applications/${currentPayApp?.id}/change-orders`)
    } catch (error) {
      console.error('Failed to save retainage settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'px-3 py-2.5 bg-white border border-slate/20 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors hover:border-slate/35'

  const guide = (
    <StepGuide
      title="Retainage Settings"
      subtitle="Retainage is one of the most impactful clauses in a construction contract."
      blocks={[
        {
          type: 'intro',
          text: 'Retainage (also called retention) is a percentage of each progress payment that the owner withholds until the project is substantially complete. It protects the owner against incomplete or defective work.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Percent className="w-3.5 h-3.5" />,
          heading: 'Standard Rates',
          body: [
            '10% is the most common rate on private commercial projects in the US.',
            '5% is typical on larger projects or once work reaches 50% completion.',
            'Public projects may be governed by statute — some states cap retainage at 5%.',
          ],
        },
        {
          type: 'tip',
          text: 'Your retainage rate must match the contract. Using the wrong rate is one of the most common pay application errors and will cause the architect to reject certification.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Layers className="w-3.5 h-3.5" />,
          heading: 'Applies To',
          body: [
            'Work Only — retainage deducted from completed work amounts but not from materials stored.',
            'Materials Only — rare, typically only seen in specialized fabrication contracts.',
            'Both — the most common setting; retainage applies to the full earned amount.',
          ],
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <PiggyBank className="w-3.5 h-3.5" />,
          heading: 'Tiered Retainage',
          body: 'Many AIA contracts reduce retainage once the project reaches 50% completion. Enable "Changes Over Time" to model this — set the effective date and the reduced rate that takes effect.',
        },
        {
          type: 'warning',
          text: 'Tiered retainage only applies to future applications. Past applications already submitted at the higher rate are not retroactively adjusted.',
        },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Substantial Completion',
              definition: 'The stage when work is sufficiently complete for the owner to use it for its intended purpose. Typically triggers release of most or all retainage.',
            },
            {
              term: 'Retainage Release',
              definition: 'The payment of withheld funds to the contractor. Often split: half at substantial completion, half at final completion with punch list cleared.',
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Retainage Settings</h1>
        <p className="text-sm text-slate/55 mt-1">Configure retainage percentage and application rules.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6">

          {/* Retainage Percentage */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                <Percent className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700" style={{ fontVariant: 'small-caps', letterSpacing: '0.04em' }}>
                Retainage Percentage
              </h2>
            </div>
            <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={retainagePercent}
                  onChange={e => setRetainagePercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className={`w-24 text-right tabular-nums ${inputClass}`}
                />
                <span className="text-slate-600 font-medium">%</span>
              </div>
            </div>
          </section>

          {/* Applies To */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700" style={{ fontVariant: 'small-caps', letterSpacing: '0.04em' }}>
                Retainage Applies To
              </h2>
            </div>
            <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm space-y-3">
              {([
                { value: 'work' as const,      label: 'Work Only' },
                { value: 'materials' as const, label: 'Materials Only' },
                { value: 'both' as const,      label: 'Both Work and Materials' },
              ] as const).map(opt => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="appliesTo"
                    value={opt.value}
                    checked={appliesTo === opt.value}
                    onChange={() => setAppliesTo(opt.value)}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Changes Over Time */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                <PiggyBank className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700" style={{ fontVariant: 'small-caps', letterSpacing: '0.04em' }}>
                Tiered Retainage
              </h2>
            </div>
            <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canChangeOverTime}
                  onChange={e => setCanChangeOverTime(e.target.checked)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-slate-700">Retainage reduces at a certain point</div>
                  <div className="text-xs text-slate/50 mt-0.5">Useful for projects with tiered retainage schedules</div>
                </div>
              </label>

              {canChangeOverTime && (
                <div className="mt-4 pt-4 border-t border-slate/10 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wide text-slate/60 uppercase mb-1.5">Effective Date</label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={e => setEffectiveDate(e.target.value)}
                      className={`w-full ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wide text-slate/60 uppercase mb-1.5">New Rate</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newRetainagePercent}
                        onChange={e => setNewRetainagePercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className={`w-24 text-right tabular-nums ${inputClass}`}
                      />
                      <span className="text-slate-600 font-medium">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp?.id}/billing-format`)}
          onContinue={handleContinue}
          continueDisabled={isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
