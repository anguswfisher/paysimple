'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Table2, ListOrdered, DollarSign, BarChart3 } from 'lucide-react'

export default function SovPage() {
  const router = useRouter()
  const params = useParams()
  const { currentPayApp } = usePayAppStore()

  const guide = (
    <StepGuide
      title="Schedule of Values"
      subtitle="The G703 is the line-by-line record of your contract's work divisions."
      blocks={[
        {
          type: 'intro',
          text: 'The Schedule of Values is the detailed breakdown of your contract sum into individual work items. It\'s the foundation that all payment calculations are built on — every application in the project references the same SOV.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <ListOrdered className="w-3.5 h-3.5" />,
          heading: 'Line Item Structure',
          body: [
            'Each line item represents a CSI MasterFormat division or sub-division.',
            'Descriptions should be specific enough for the architect to verify completion.',
            'The sum of all scheduled values must equal your original contract sum.',
          ],
        },
        {
          type: 'section',
          icon: <DollarSign className="w-3.5 h-3.5" />,
          heading: 'Scheduled Values',
          body: 'Allocate your contract sum proportionally to the cost of each work division. Include overhead and profit within each line rather than as a standalone line.',
        },
        {
          type: 'section',
          icon: <BarChart3 className="w-3.5 h-3.5" />,
          heading: 'Progress Tracking',
          body: 'Each billing period, you\'ll enter the percentage or dollar amount completed for each line. The system calculates totals, retainage, and payment due automatically.',
        },
        {
          type: 'tip',
          text: 'This step will consolidate SOV Method, Import, Manual Entry, and Upload into one unified SOV management screen.',
        },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Work in Place',
              definition: 'Labor and materials permanently incorporated into the project. This is what\'s billed under the "This Period" column each month.',
            },
            {
              term: 'Balance to Finish',
              definition: 'Scheduled Value minus Total Completed & Stored to Date. Shows how much contract value remains unclaimed for each line item.',
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
          <span>Step 3</span>
          <span className="text-slate/20">·</span>
          <span>SOV</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule of Values</h1>
        <p className="text-sm text-slate/55 mt-1">Build and manage your schedule of values.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex flex-col items-center justify-center h-full min-h-48 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Table2 className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Unified SOV management coming soon</h2>
              <p className="text-sm text-slate/50 max-w-sm">
                This will merge SOV Method + Import + Manual entry into one screen.
              </p>
            </div>
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${params.id}/billing-settings`)}
          onContinue={() => router.push(`/pay-applications/${params.id}/workspace`)}
          continueLabel="Go to Workspace"
        />
      </WizardSplitPane>
    </div>
  )
}
