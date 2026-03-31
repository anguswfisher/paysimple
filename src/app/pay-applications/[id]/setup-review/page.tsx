'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Table, PiggyBank, ArrowRightLeft, Package, Edit, CheckCircle2, ClipboardList } from 'lucide-react'

export default function SetupReviewPage() {
  const router = useRouter()
  const { currentPayApp, markStepCompleted } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      await markStepCompleted(6)
      router.push(`/pay-applications/${currentPayApp?.id}/sov-method`)
    } catch (error) {
      console.error('Failed to mark setup review as completed:', error)
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

  const { billingFormat, retainageSettings, changeOrderSettings, materialsStoredEnabled } = currentPayApp

  const summaryItems = [
    {
      title: 'Billing Format',
      icon: <Table className="w-4 h-4" />,
      value: billingFormat === 'schedule-of-values' ? 'Schedule of Values (G703)' : 'Total Only',
      editHref: `/pay-applications/${currentPayApp.id}/billing-format`,
    },
    {
      title: 'Retainage',
      icon: <PiggyBank className="w-4 h-4" />,
      value: `${retainageSettings.retainagePercent}% on ${
        retainageSettings.appliesTo === 'work' ? 'work only' :
        retainageSettings.appliesTo === 'materials' ? 'materials only' : 'work & materials'
      }`,
      editHref: `/pay-applications/${currentPayApp.id}/retainage`,
    },
    {
      title: 'Change Orders',
      icon: <ArrowRightLeft className="w-4 h-4" />,
      value: changeOrderSettings.hasChangeOrders
        ? changeOrderSettings.mode === 'totals-only' && changeOrderSettings.totalAmount
          ? `Total: $${changeOrderSettings.totalAmount.toLocaleString()}`
          : `${changeOrderSettings.changeOrders.length} change order${changeOrderSettings.changeOrders.length !== 1 ? 's' : ''}`
        : 'None',
      editHref: `/pay-applications/${currentPayApp.id}/change-orders`,
    },
    {
      title: 'Materials Stored',
      icon: <Package className="w-4 h-4" />,
      value: materialsStoredEnabled ? 'Enabled' : 'Disabled',
      editHref: `/pay-applications/${currentPayApp.id}/materials-stored`,
    },
  ]

  const guide = (
    <StepGuide
      title="Setup Review"
      subtitle="Confirm your billing settings before moving on to build the Schedule of Values."
      blocks={[
        {
          type: 'intro',
          text: 'Take a moment to verify that your billing settings match your contract. These settings affect every calculation in your pay application — they\'re much easier to change now than after you\'ve entered line items.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <ClipboardList className="w-3.5 h-3.5" />,
          heading: 'What to Check',
          body: [
            'Billing Format — does your contract require a G703 Schedule of Values?',
            'Retainage % — does it match the exact rate in your contract?',
            'Change Orders — are all listed COs formally approved in writing?',
            'Materials Stored — do you have on-site materials to bill for?',
          ],
        },
        {
          type: 'tip',
          text: 'Click the edit icon next to any setting to go back and change it. Once you continue to the Schedule of Values, changing these settings may affect your line item calculations.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          heading: "What's Next — Schedule of Values",
          body: 'After this review you\'ll build your Schedule of Values (G703). This is the line-by-line breakdown of your contract — each work division gets its own row with a scheduled value. You\'ll choose how to create it: import from a previous application, enter manually, or upload a spreadsheet.',
        },
        {
          type: 'checklist',
          heading: 'Ready to continue?',
          items: [
            'Retainage rate matches your signed contract',
            'All listed change orders have written approval',
            'Billing format aligns with owner\'s expectations',
            'You have your Schedule of Values ready (from drawings, specs, or a previous app)',
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Setup Review</h1>
        <p className="text-sm text-slate/55 mt-1">Review your billing settings before building the schedule of values.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-3">
          {summaryItems.map(item => (
            <div key={item.title} className="bg-white border border-slate/15 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate/40">{item.title}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</div>
                </div>
              </div>
              <Link href={item.editHref}>
                <button className="p-2 text-slate/40 hover:text-slate-700 hover:bg-slate/5 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ))}

          <div className="mt-2 rounded-xl border border-teal-100 bg-teal-50/60 p-4 text-sm text-teal-700">
            Next, you'll build your schedule of values — import from a previous pay app or enter line items manually.
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp.id}/materials-stored`)}
          onContinue={handleContinue}
          continueLabel="Continue to Schedule of Values"
          continueDisabled={isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
