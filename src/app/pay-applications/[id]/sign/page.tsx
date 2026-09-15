'use client'

import { useRouter } from 'next/navigation'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { PenLine, Users, FileCheck, Lock } from 'lucide-react'

export default function SignPage() {
  const router = useRouter()
  const { currentPayApp } = usePayAppStore()

  const guide = (
    <StepGuide
      title="Sign & Finalize"
      subtitle="The signature step completes the pay application and locks it for submission."
      blocks={[
        {
          type: 'intro',
          text: 'A pay application is not complete until it\'s signed by the contractor. The signature certifies that the work described has been performed, that all prior payments have been applied to the project, and that the current amount due is correct.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Users className="w-3.5 h-3.5" />,
          heading: 'Who Signs What',
          body: [
            'Contractor — signs the payment summary certifying the application is accurate and amounts are owed.',
            'Architect — countersigns the Certificate for Payment once they\'ve reviewed and approved.',
            'Owner — does not sign the payment summary; payment is triggered by the architect\'s certification.',
          ],
        },
        {
          type: 'tip',
          text: 'Some owners also require a notarized Contractor\'s Affidavit with each application. Check your contract\'s supplementary conditions.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <FileCheck className="w-3.5 h-3.5" />,
          heading: 'Digital Signatures',
          body: 'PaySimple supports electronic signatures that are legally binding under the ESIGN Act and UETA in all US states. The signature is embedded in the exported PDF along with an audit trail.',
        },
        {
          type: 'section',
          icon: <Lock className="w-3.5 h-3.5" />,
          heading: 'Finalization',
          body: 'Once signed, the application is finalized — line items, amounts, and settings are locked. Future applications on this project can then roll forward from this finalized version.',
        },
        {
          type: 'warning',
          text: 'Do not sign until you\'ve reviewed the full application. A signed pay application with errors will need to be retracted and resubmitted, delaying your payment.',
        },
        { type: 'divider' },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Sworn Statement',
              definition: 'A signed declaration that the information in the pay application is true and accurate, often required alongside the payment summary.',
            },
            {
              term: 'Lien Waiver',
              definition: 'A document signed by the contractor (and subcontractors) waiving their right to place a mechanic\'s lien on the property in exchange for payment. Often submitted with each pay application.',
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
          <span>Step 6</span>
          <span className="text-slate/20">·</span>
          <span>Sign</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign & Finalize</h1>
        <p className="text-sm text-slate/55 mt-1">Sign to certify and lock this pay application.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex flex-col items-center justify-center h-full min-h-48 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
              <PenLine className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Signing coming soon</h2>
              <p className="text-sm text-slate/50 max-w-sm">
                This will merge Finalize Sign with a summary confirmation into one screen.
              </p>
            </div>
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp?.id}/review`)}
          onContinue={() => router.push(`/pay-applications/${currentPayApp?.id}/complete`)}
          continueLabel="Finalize Application"
        />
      </WizardSplitPane>
    </div>
  )
}
