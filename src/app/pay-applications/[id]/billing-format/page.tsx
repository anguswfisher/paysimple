'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Check, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import type { BillingFormat } from '@/app/pay-applications/types'

const BILLING_FORMATS: {
  format: BillingFormat
  title: string
  subtitle: string
  description: string
  recommended?: boolean
  features: string[]
}[] = [
  {
    format: 'schedule-of-values',
    title: 'Schedule of Values (G703)',
    subtitle: 'Detailed line item tracking',
    description: 'Track individual work items, materials, and retainage with automatic calculations',
    recommended: true,
    features: [
      'Individual line item tracking',
      'Automatic calculations',
      'Detailed progress reporting'
    ]
  },
  {
    format: 'total-only',
    title: 'Total Only',
    subtitle: 'Simplified billing approach',
    description: 'Enter total amounts without detailed line item breakdown',
    features: [
      'Simplified entry',
      'Faster to complete',
      'Still generates G702 summary'
    ]
  }
]

export default function BillingFormatPage() {
  const router = useRouter()
  const { currentPayApp, updateBillingFormat, markStepCompleted } = usePayAppStore()
  const [selectedFormat, setSelectedFormat] = useState<BillingFormat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Initialize from current pay app
  useEffect(() => {
    if (currentPayApp?.billingFormat) {
      setSelectedFormat(currentPayApp.billingFormat)
    }
  }, [currentPayApp])

  const handleContinue = async () => {
    if (!selectedFormat) return

    setIsLoading(true)
    try {
      await updateBillingFormat(selectedFormat)
      await markStepCompleted(2)
      router.push(`/pay-applications/${currentPayApp?.id}/retainage`)
    } catch (error) {
      console.error('Failed to save billing format:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/basics`)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Billing Format</h1>
        <p className="text-slate/70 mt-1">
          Choose how you want to structure this pay application
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Billing Format Cards */}
          {BILLING_FORMATS.map((billingFormat) => (
            <Card
              key={billingFormat.format}
              className={`
                cursor-pointer transition-all duration-200
                ${selectedFormat === billingFormat.format
                  ? 'border-teal-600 bg-teal-50/30'
                  : 'border-slate/20 hover:border-slate/40'
                }
              `}
              onClick={() => setSelectedFormat(billingFormat.format)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {billingFormat.title}
                      </h3>
                      {billingFormat.recommended && (
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate/70 mb-3">{billingFormat.subtitle}</p>
                    <p className="text-sm text-slate/60">{billingFormat.description}</p>
                  </div>
                  
                  {selectedFormat === billingFormat.format && (
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-2">
                  {billingFormat.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

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
                    Explain this
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
                  <div className="pt-4 space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Schedule of Values (G703)
                      </h4>
                      <p className="text-slate/70">
                        The Schedule of Values format provides detailed line item tracking for work performed, 
                        materials stored, and retainage calculations. This is the standard format for most 
                        construction projects and provides the most comprehensive reporting. Each line item 
                        automatically calculates work-to-date, materials-to-date, and earned amounts.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Total Only
                      </h4>
                      <p className="text-slate/70">
                        The Total Only format simplifies the process by allowing you to enter total amounts 
                        without detailed line item breakdown. This approach is faster to complete but still 
                        generates a proper G702 summary. Choose this option for simpler projects or when 
                        detailed tracking isn't required.
                      </p>
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
        continueDisabled={!selectedFormat || isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
