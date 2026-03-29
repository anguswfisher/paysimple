'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { CheckCircle, AlertTriangle, Check, X, Wrench } from 'lucide-react'

interface Warning {
  id: string
  lineItemNumber: string
  lineItemDescription: string
  type: 'over_earned' | 'empty_description' | 'zero_value'
  message: string
  acknowledged: boolean
}

export default function ChecksPage() {
  const router = useRouter()
  const { currentPayApp } = usePayAppStore()
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentPayApp) {
      const derivedWarnings: Warning[] = []
      
      currentPayApp.lineItems.forEach((item, index) => {
        const lineNum = item.lineNumber || String(index + 1)
        
        // Check 1: earnedToDate > scheduledValue
        if ((item.earnedToDate || 0) > item.scheduledValue && item.scheduledValue > 0) {
          derivedWarnings.push({
            id: `over_earned_${item.id}`,
            lineItemNumber: lineNum,
            lineItemDescription: item.description || 'Untitled',
            type: 'over_earned',
            message: `Earned to date ($${(item.earnedToDate || 0).toLocaleString()}) exceeds scheduled value ($${item.scheduledValue.toLocaleString()})`,
            acknowledged: false,
          })
        }
        
        // Check 2: empty description
        if (!item.description || item.description.trim() === '') {
          derivedWarnings.push({
            id: `empty_description_${item.id}`,
            lineItemNumber: lineNum,
            lineItemDescription: 'Untitled',
            type: 'empty_description',
            message: 'Description is empty',
            acknowledged: false,
          })
        }
        
        // Check 3: scheduledValue === 0
        if (item.scheduledValue === 0) {
          derivedWarnings.push({
            id: `zero_value_${item.id}`,
            lineItemNumber: lineNum,
            lineItemDescription: item.description || 'Untitled',
            type: 'zero_value',
            message: 'Scheduled value is $0',
            acknowledged: false,
          })
        }
      })
      
      setWarnings(derivedWarnings)
    }
  }, [currentPayApp])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      router.push(`/pay-applications/${currentPayApp?.id}/review-checklist`)
    } catch (error) {
      console.error('Failed to navigate to review checklist:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/summary`)
  }

  const handleAcknowledgeAll = () => {
    setWarnings(prev => prev.map(warning => ({ ...warning, acknowledged: true })))
  }

  const handleAcknowledge = (id: string) => {
    setWarnings(prev => 
      prev.map(warning => 
        warning.id === id ? { ...warning, acknowledged: true } : warning
      )
    )
  }

  const handleFix = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/workspace`)
  }

  const unacknowledgedWarnings = warnings.filter(w => !w.acknowledged)
  const hasWarnings = warnings.length > 0
  const hasUnacknowledgedWarnings = unacknowledgedWarnings.length > 0

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

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Pre-Submission Checks</h1>
        <p className="text-slate/70 mt-1">
          Automated validation of your pay application data
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Banner */}
          <div className={`
            p-4 rounded-lg border flex items-center gap-3
            ${hasUnacknowledgedWarnings 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-green-50 border-green-200 text-green-800'
            }
          `}>
            {hasUnacknowledgedWarnings ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <div className="font-medium">
                    {unacknowledgedWarnings.length} warning{unacknowledgedWarnings.length !== 1 ? 's' : ''} found
                  </div>
                  <div className="text-sm opacity-90">
                    Please review and acknowledge before continuing
                  </div>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <div>
                  <div className="font-medium">All checks passed</div>
                  <div className="text-sm opacity-90">
                    Your pay application is ready for submission
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Warnings Section */}
          {hasWarnings && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Warnings</CardTitle>
                  {hasUnacknowledgedWarnings && (
                    <button
                      onClick={handleAcknowledgeAll}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Acknowledge All
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warnings.map((warning) => (
                    <div
                      key={warning.id}
                      className={`
                        p-4 border rounded-lg
                        ${warning.acknowledged
                          ? 'border-green-200 bg-green-50 opacity-60'
                          : 'border-amber-200 bg-amber-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-slate-900">
                              Line {warning.lineItemNumber}
                            </span>
                            {warning.acknowledged && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-slate-700 mb-1">
                            {warning.lineItemDescription}
                          </div>
                          <div className="text-sm text-amber-700">
                            {warning.message}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!warning.acknowledged && (
                            <>
                              <button
                                onClick={handleFix}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-slate/30 rounded-md hover:bg-slate-5 transition-colors"
                              >
                                <Wrench className="w-3 h-3" />
                                Fix
                              </button>
                              <button
                                onClick={() => handleAcknowledge(warning.id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Acknowledge
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {!hasWarnings && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  All checks passed
                </h3>
                <p className="text-slate/70">
                  Your pay application has passed all validation checks and is ready for review.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue to Review"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
