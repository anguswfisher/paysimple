'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { CheckCircle, Info } from 'lucide-react'

interface ChecklistItem {
  id: string
  label: string
  required: boolean
  checked: boolean
}

export default function ReviewChecklistPage() {
  const router = useRouter()
  const { currentPayApp } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 'amounts',
      label: 'I have verified all amounts are correct',
      required: true,
      checked: false,
    },
    {
      id: 'dates',
      label: 'I have verified the billing period dates',
      required: true,
      checked: false,
    },
    {
      id: 'retainage',
      label: 'I have verified the retainage calculations',
      required: true,
      checked: false,
    },
    {
      id: 'schedule',
      label: 'I have reviewed the schedule of values',
      required: true,
      checked: false,
    },
    {
      id: 'ready',
      label: 'I am ready to submit this pay application',
      required: true,
      checked: false,
    },
  ])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      router.push(`/pay-applications/${currentPayApp?.id}/finalize-confirm`)
    } catch (error) {
      console.error('Failed to navigate to finalize confirm:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/checks`)
  }

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const completedCount = checklistItems.filter(item => item.checked).length
  const allRequiredCompleted = checklistItems.filter(item => item.required).every(item => item.checked)
  const isComplete = completedCount === checklistItems.length

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
        <h1 className="text-2xl font-bold text-slate-900">Final Review</h1>
        <p className="text-slate/70 mt-1">
          Complete this checklist before finalizing your pay application
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Checklist Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <CardTitle className="text-lg">Final Review Checklist</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`
                    flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200
                    ${item.checked
                      ? 'border-teal-200 bg-teal-50'
                      : 'border-slate/20 hover:border-slate/40 hover:bg-slate/5'
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${item.checked
                      ? 'bg-teal-600 border-teal-600'
                      : 'border-slate/30'
                    }
                  `}>
                    {item.checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${item.checked ? 'text-teal-900 font-medium' : 'text-slate-900'}`}>
                        {item.label}
                      </span>
                      {item.required && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Progress Bar */}
              <div className="pt-4 border-t border-slate/10">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-700">Progress</span>
                  <span className="font-medium text-slate-900">
                    {completedCount} of {checklistItems.length} completed
                  </span>
                </div>
                <div className="w-full bg-slate/20 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Callout */}
          <Card className="border-teal-200 bg-teal-50/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-teal-600 mt-0.5" />
                <p className="text-teal-800 text-sm">
                  After completing this checklist, you'll be able to add your signature and finalize the pay application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue to Finalize"
        continueDisabled={!allRequiredCompleted || isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
