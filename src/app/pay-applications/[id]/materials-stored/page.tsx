'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { ChevronDown, ChevronUp, HelpCircle, Warehouse } from 'lucide-react'

export default function MaterialsStoredPage() {
  const router = useRouter()
  const { currentPayApp, updateMaterialsStoredEnabled, markStepCompleted } = usePayAppStore()
  const [showHelp, setShowHelp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [materialsStoredEnabled, setMaterialsStoredEnabled] = useState(false)

  // Initialize from current pay app
  useEffect(() => {
    if (currentPayApp?.materialsStoredEnabled !== undefined) {
      setMaterialsStoredEnabled(currentPayApp.materialsStoredEnabled)
    }
  }, [currentPayApp])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      await updateMaterialsStoredEnabled(materialsStoredEnabled)
      await markStepCompleted(5)
      router.push(`/pay-applications/${currentPayApp?.id}/setup-review`)
    } catch (error) {
      console.error('Failed to save materials stored setting:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/change-orders`)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Materials Stored</h1>
        <p className="text-slate/70 mt-1">
          Configure billing for materials purchased but not yet installed
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Toggle Card */}
          <Card
            className={`
              cursor-pointer transition-all duration-200
              ${materialsStoredEnabled
                ? 'border-teal-600 bg-teal-50/30'
                : 'border-slate/20 hover:border-slate/40'
              }
            `}
            onClick={() => setMaterialsStoredEnabled(!materialsStoredEnabled)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${materialsStoredEnabled ? 'bg-teal-600' : 'bg-slate/30'}
                `}>
                  <Warehouse className={`w-6 h-6 ${materialsStoredEnabled ? 'text-white' : 'text-slate/60'}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Bill for materials stored
                  </h3>
                  <p className="text-slate/70">
                    Enable this if you have materials purchased but not yet installed that should be included in billing.
                  </p>
                  
                  {/* Toggle Indicator */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`
                      w-12 h-6 rounded-full transition-colors duration-200
                      ${materialsStoredEnabled ? 'bg-teal-600' : 'bg-slate/30'}
                    `}>
                      <div className={`
                        w-5 h-5 bg-white rounded-full transition-transform duration-200
                        ${materialsStoredEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                      `} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {materialsStoredEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className={materialsStoredEnabled ? 'border-teal-200 bg-teal-50/20' : 'border-slate/10 bg-slate/5'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`
                  w-2 h-2 rounded-full mt-2
                  ${materialsStoredEnabled ? 'bg-teal-600' : 'bg-slate/40'}
                `} />
                <p className={`text-sm ${materialsStoredEnabled ? 'text-teal-800' : 'text-slate/60'}`}>
                  {materialsStoredEnabled
                    ? 'Materials stored columns will appear in the workspace, allowing you to track and bill for materials purchased but not yet installed.'
                    : 'Materials stored columns will be hidden from the workspace. You can enable this later if needed.'
                  }
                </p>
              </div>
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
                    Explain materials stored
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
                  <div className="pt-4 text-sm space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">What are Stored Materials?</h4>
                      <p className="text-slate/70">
                        Stored materials are construction materials that have been purchased and delivered to the job site 
                        but have not yet been incorporated into the work. These materials represent a cost to the contractor 
                        and can be billed for under most construction contracts.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">When to Bill for Stored Materials</h4>
                      <p className="text-slate/70">
                        You should bill for stored materials when:
                      </p>
                      <ul className="mt-2 ml-4 list-disc space-y-1 text-slate/70">
                        <li>Materials have been purchased and are on-site</li>
                        <li>Materials are properly stored and protected from damage</li>
                        <li>The contract allows for billing of stored materials</li>
                        <li>Materials will be installed in a future billing period</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">How It Works in Pay Applications</h4>
                      <p className="text-slate/70">
                        When enabled, the workspace will include additional columns for tracking materials stored to date, 
                        materials stored this period, and the value of stored materials. These amounts are typically excluded 
                        from retainage calculations since the work isn't yet complete.
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
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
