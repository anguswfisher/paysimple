'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import type { RetainageSettings, RetainageAppliesTo } from '@/app/pay-applications/types'

export default function RetainagePage() {
  const router = useRouter()
  const { currentPayApp, updateRetainageSettings, markStepCompleted } = usePayAppStore()
  const [showHelp, setShowHelp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [retainagePercent, setRetainagePercent] = useState(10)
  const [appliesTo, setAppliesTo] = useState<RetainageAppliesTo>('both')
  const [canChangeOverTime, setCanChangeOverTime] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState('')
  const [newRetainagePercent, setNewRetainagePercent] = useState(10)

  // Initialize from current pay app
  useEffect(() => {
    if (currentPayApp?.retainageSettings) {
      const settings = currentPayApp.retainageSettings
      setRetainagePercent(settings.retainagePercent)
      setAppliesTo(settings.appliesTo)
      setCanChangeOverTime(settings.canChangeOverTime)
      setEffectiveDate(settings.effectiveDate || '')
      setNewRetainagePercent(settings.newRetainagePercent || settings.retainagePercent)
    }
  }, [currentPayApp])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      const retainageSettings: RetainageSettings = {
        retainagePercent,
        appliesTo,
        canChangeOverTime,
        ...(canChangeOverTime && {
          effectiveDate: effectiveDate || undefined,
          newRetainagePercent: newRetainagePercent,
        }),
      }

      await updateRetainageSettings(retainageSettings)
      await markStepCompleted(3)
      router.push(`/pay-applications/${currentPayApp?.id}/change-orders`)
    } catch (error) {
      console.error('Failed to save retainage settings:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/billing-format`)
  }

  const handleRetainagePercentChange = (value: string) => {
    const num = parseInt(value) || 0
    const clampedValue = Math.min(100, Math.max(0, num))
    setRetainagePercent(clampedValue)
  }

  const handleNewRetainagePercentChange = (value: string) => {
    const num = parseInt(value) || 0
    const clampedValue = Math.min(100, Math.max(0, num))
    setNewRetainagePercent(clampedValue)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Retainage Settings</h1>
        <p className="text-slate/70 mt-1">
          Configure retainage percentage and application rules
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Retainage Percentage */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontVariant: 'small-caps' }}>
                Retainage Percentage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={retainagePercent}
                  onChange={(e) => handleRetainagePercentChange(e.target.value)}
                  className="w-20 px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <span className="text-slate-700">%</span>
              </div>
            </CardContent>
          </Card>

          {/* Retainage Applies To */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontVariant: 'small-caps' }}>
                Retainage Applies To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { value: 'work' as const, label: 'Work Only' },
                  { value: 'materials' as const, label: 'Materials Only' },
                  { value: 'both' as const, label: 'Both Work and Materials' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="appliesTo"
                      value={option.value}
                      checked={appliesTo === option.value}
                      onChange={(e) => setAppliesTo(e.target.value as RetainageAppliesTo)}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30"
                    />
                    <span className="text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Retainage Changes Over Time */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontVariant: 'small-caps' }}>
                Retainage Changes Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canChangeOverTime}
                  onChange={(e) => setCanChangeOverTime(e.target.checked)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded"
                />
                <div>
                  <div className="text-slate-700">Enable if retainage percentage will decrease at a certain point</div>
                  <div className="text-sm text-slate/60">Useful for projects with tiered retainage schedules</div>
                </div>
              </label>

              {/* Additional fields when enabled */}
              {canChangeOverTime && (
                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate/10">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      New Retainage %
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newRetainagePercent}
                        onChange={(e) => handleNewRetainagePercentChange(e.target.value)}
                        className="w-20 px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <span className="text-slate-700">%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="border-slate/10">
            <CardContent className="p-0">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate/60" />
                  <span className="text-sm font-medium text-slate-700">
                    Explain retainage
                  </span>
                </div>
                {showHelp ? (
                  <ChevronUp className="w-4 h-4 text-slate/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate/60" />
                )}
              </button>
              
              {showHelp && (
                <div className="px-4 pb-4 border-t border-slate/10">
                  <div className="pt-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">What is Retainage?</h4>
                        <p className="text-slate/70">
                          Retainage is a portion of the contract amount that the owner withholds as security 
                          until the project is substantially complete. This protects the owner against 
                          incomplete work or defects and ensures the contractor finishes the project.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Common Retainage Amounts</h4>
                        <p className="text-slate/70">
                          Most construction contracts specify retainage between 5% and 10%. 
                          10% is most common for private projects, while public projects may have lower rates 
                          or specific requirements based on local laws.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">How It Works</h4>
                        <p className="text-slate/70">
                          The retainage amount is calculated on each progress payment and accumulated 
                          until the project reaches completion. Once substantially complete, the retainage 
                          is typically released in phases (half at substantial completion, final half at final completion).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
