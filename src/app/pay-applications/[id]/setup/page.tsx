'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Settings, Building2, Calendar, Hash } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const params = useParams()
  const { currentPayApp } = usePayAppStore()

  const guide = (
    <StepGuide
      title="Application Setup"
      subtitle="The setup step collects all the identifying information for your pay application."
      blocks={[
        {
          type: 'intro',
          text: 'Setup covers everything on the cover sheet of the payment summary — who the parties are, what the project is called, and what billing period this application covers.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Building2 className="w-3.5 h-3.5" />,
          heading: 'Project & Parties',
          body: [
            'Use names exactly as they appear in the signed contract.',
            'Owner — the entity paying for the work (your client).',
            'Contractor — the entity performing the work (you).',
            'Architect — the design professional certifying payment.',
          ],
        },
        {
          type: 'section',
          icon: <Hash className="w-3.5 h-3.5" />,
          heading: 'Application Number',
          body: 'Sequential — start at 1 and increment by 1 each billing cycle. Never reuse or skip numbers.',
        },
        {
          type: 'section',
          icon: <Calendar className="w-3.5 h-3.5" />,
          heading: 'Billing Period',
          body: 'The date range of work covered by this application. The payment due date should reflect the deadline in your contract\'s payment terms.',
        },
        {
          type: 'tip',
          text: 'This step will combine the Basics and Billing Format screens into a single unified setup flow.',
        },
      ]}
    />
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-8 pt-7 pb-5 border-b border-slate/10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate/40 uppercase tracking-widest mb-2">
          <span>Step 1</span>
          <span className="text-slate/20">·</span>
          <span>Setup</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Setup</h1>
        <p className="text-sm text-slate/55 mt-1">Enter project details and billing information.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex flex-col items-center justify-center h-full min-h-48 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Settings className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Unified setup coming soon</h2>
              <p className="text-sm text-slate/50 max-w-sm">
                This will merge Basics + Billing Format into one screen.
              </p>
            </div>
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push('/pay-applications/new')}
          onContinue={() => router.push(`/pay-applications/${params.id}/billing-settings`)}
        />
      </WizardSplitPane>
    </div>
  )
}
