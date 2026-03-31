'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Sliders, Percent, ArrowRightLeft, Warehouse } from 'lucide-react'

export default function BillingSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const { currentPayApp } = usePayAppStore()

  const guide = (
    <StepGuide
      title="Billing Settings"
      subtitle="Configure the financial rules that govern every calculation in your application."
      blocks={[
        {
          type: 'intro',
          text: 'Billing settings control three key financial aspects of your pay application: how much the owner withholds (retainage), any approved contract modifications (change orders), and whether you\'re billing for on-site materials not yet installed.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Percent className="w-3.5 h-3.5" />,
          heading: 'Retainage',
          body: 'A percentage withheld from each payment until substantial completion. Must match your contract exactly — 10% is most common on private projects.',
        },
        {
          type: 'section',
          icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
          heading: 'Change Orders',
          body: 'Only include written, approved change orders. Pending or verbal approvals cannot be billed.',
        },
        {
          type: 'section',
          icon: <Warehouse className="w-3.5 h-3.5" />,
          heading: 'Materials Stored',
          body: 'Enable only if your contract allows billing for on-site materials not yet incorporated into the work, and you have invoices and delivery documentation to support the amounts.',
        },
        {
          type: 'tip',
          text: 'This step will consolidate Retainage, Change Orders, and Materials Stored into a single screen.',
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing Settings</h1>
        <p className="text-sm text-slate/55 mt-1">Configure retainage, change orders, and materials stored.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex flex-col items-center justify-center h-full min-h-48 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Sliders className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Unified billing settings coming soon</h2>
              <p className="text-sm text-slate/50 max-w-sm">
                This will merge Retainage + Change Orders + Materials Stored into one screen.
              </p>
            </div>
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${params.id}/setup`)}
          onContinue={() => router.push(`/pay-applications/${params.id}/sov`)}
        />
      </WizardSplitPane>
    </div>
  )
}
