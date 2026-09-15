'use client'

import { useRouter } from 'next/navigation'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { ClipboardCheck, Shield, AlertCircle, Send } from 'lucide-react'

export default function ReviewPage() {
  const router = useRouter()
  const { currentPayApp } = usePayAppStore()

  const guide = (
    <StepGuide
      title="Review & Submit"
      subtitle="A thorough review before submission prevents delays in payment certification."
      blocks={[
        {
          type: 'intro',
          text: 'The review step is your last chance to catch errors before the application goes to the architect. Payment certification can take 7–30 days — an error found now saves weeks of back-and-forth.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <ClipboardCheck className="w-3.5 h-3.5" />,
          heading: 'What Gets Reviewed',
          body: [
            'Payment Summary — contract sum, retainage, change orders, and current payment due.',
            'Continuation Sheet — each line item\'s work completed, balance to finish, and % complete.',
            'Arithmetic — all totals must foot (add up) correctly across every column.',
            'Period consistency — work billed this period should not exceed balance to finish.',
          ],
        },
        {
          type: 'tip',
          text: 'Print or export a PDF and review it on paper before submitting. Errors are easier to spot in print format.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Shield className="w-3.5 h-3.5" />,
          heading: 'Common Rejection Reasons',
          body: [
            'Totals don\'t match between the payment summary and the schedule of values.',
            'Application number out of sequence.',
            'Change orders included without written approval documentation.',
            'Overbilling — "this period" exceeds remaining balance on a line item.',
            'Wrong retainage percentage.',
          ],
        },
        {
          type: 'warning',
          text: 'Once submitted, pay applications are difficult to amend. If the architect rejects an application, you may need to resubmit from scratch — resetting your payment timeline.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Send className="w-3.5 h-3.5" />,
          heading: 'Submission',
          body: 'After review you\'ll send the application to the architect for certification. The architect has a contractually defined window (typically 7 days under standard general conditions) to either certify or issue a written explanation for non-certification.',
        },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Certificate for Payment',
              definition: 'The architect\'s written certification (on the payment summary) that the work described in the pay application has been completed. This triggers the owner\'s obligation to pay.',
            },
            {
              term: 'Pencil Copy',
              definition: 'An informal draft of a pay application shared with the owner or architect before formal submission to resolve disagreements pre-emptively.',
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
          <span>Step 5</span>
          <span className="text-slate/20">·</span>
          <span>Review</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review & Submit</h1>
        <p className="text-sm text-slate/55 mt-1">Verify your pay application before sending to the architect.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex flex-col items-center justify-center h-full min-h-48 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Review coming soon</h2>
              <p className="text-sm text-slate/50 max-w-sm">
                This will merge Summary, Checks, Review Checklist, and Finalize Confirm into one screen.
              </p>
            </div>
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp?.id}/workspace`)}
          onContinue={() => router.push(`/pay-applications/${currentPayApp?.id}/sign`)}
          continueLabel="Continue to Sign"
        />
      </WizardSplitPane>
    </div>
  )
}
