'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Check, TableProperties, AlignLeft } from 'lucide-react'
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
    title: 'Schedule of Values',
    subtitle: 'Detailed line item tracking',
    description: 'Track individual work items, materials, and retainage with automatic calculations',
    recommended: true,
    features: [
      'Individual line item tracking',
      'Automatic calculations',
      'Detailed progress reporting',
    ],
  },
  {
    format: 'total-only',
    title: 'Total Only',
    subtitle: 'Simplified billing approach',
    description: 'Enter total amounts without detailed line item breakdown',
    features: [
      'Simplified entry',
      'Faster to complete',
      'Still generates payment summary',
    ],
  },
]

export default function BillingFormatPage() {
  const router = useRouter()
  const { currentPayApp, updateBillingFormat, markStepCompleted } = usePayAppStore()
  const [selectedFormat, setSelectedFormat] = useState<BillingFormat | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    } finally {
      setIsLoading(false)
    }
  }

  const guide = (
    <StepGuide
      title="Billing Format"
      subtitle="Understand the two ways to structure a pay application before you choose."
      blocks={[
        {
          type: 'intro',
          text: 'The billing format controls how you present your work to the owner or architect. Most contracts require or strongly prefer the Schedule of Values format.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <TableProperties className="w-3.5 h-3.5" />,
          heading: 'Schedule of Values',
          body: [
            'The schedule of values is the continuation sheet attached to the payment summary. It lists every work division as a separate line item with its own scheduled value, work-to-date, and balance.',
            'This format is required on virtually all construction contracts and gives the architect detailed visibility into project progress before certifying payment.',
          ],
        },
        {
          type: 'tip',
          text: 'If your contract references standard industry forms, always use Schedule of Values. The architect\'s certification is tied to the schedule of values line items.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <AlignLeft className="w-3.5 h-3.5" />,
          heading: 'Total Only',
          body: 'The Total Only format skips the schedule of values and submits just the payment summary with a single contract sum and amount billed. This is appropriate for small projects, cost-plus contracts, or when the owner has waived the schedule of values requirement.',
        },
        {
          type: 'warning',
          text: 'Switching formats mid-project creates confusion in payment history. Choose once and stick with it for the entire project.',
        },
        { type: 'divider' },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Payment Summary',
              definition: 'The pay application cover sheet — lists contract sum, work completed, retainage, and payment due.',
            },
            {
              term: 'Schedule of Values',
              definition: 'The continuation sheet — the line-item breakdown that supports the payment summary totals. Architects typically review this before certifying.',
            },
          ],
        },
        {
          type: 'checklist',
          heading: 'How to decide',
          items: [
            'Read your contract — does it require a schedule of values?',
            'Ask your architect what format they expect to certify',
            'If in doubt, use Schedule of Values — it\'s universally accepted',
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing Format</h1>
        <p className="text-sm text-slate/55 mt-1">Choose how you want to structure this pay application.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="space-y-4">
            {BILLING_FORMATS.map((bf) => (
              <div
                key={bf.format}
                onClick={() => setSelectedFormat(bf.format)}
                className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 bg-white shadow-sm ${
                  selectedFormat === bf.format
                    ? 'border-teal-500 ring-2 ring-teal-500/20'
                    : 'border-slate/15 hover:border-slate/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-slate-900">{bf.title}</h3>
                    {bf.recommended && (
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">Recommended</Badge>
                    )}
                  </div>
                  {selectedFormat === bf.format && (
                    <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate/55 mb-3">{bf.description}</p>
                <ul className="space-y-1.5">
                  {bf.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate/65">
                      <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp?.id}/basics`)}
          onContinue={handleContinue}
          continueDisabled={!selectedFormat || isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
