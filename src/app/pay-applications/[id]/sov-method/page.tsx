'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Copy, Edit, Upload, Clipboard, ListOrdered } from 'lucide-react'

const SOV_METHODS = [
  {
    id: 'import',
    title: 'Import from Previous Pay App',
    description: 'Copy line items from a finalized application, rolling forward work completed.',
    icon: <Copy className="w-5 h-5" />,
    when: 'Best for applications 2, 3, 4… on the same project.',
  },
  {
    id: 'manual',
    title: 'Enter Manually',
    description: 'Create line items from scratch by typing descriptions and scheduled values.',
    icon: <Edit className="w-5 h-5" />,
    when: 'Best for first application or small projects with few line items.',
  },
  {
    id: 'upload',
    title: 'Upload Spreadsheet',
    description: 'Import from a CSV or Excel file you\'ve prepared.',
    icon: <Upload className="w-5 h-5" />,
    when: 'Best when you already have an SOV in a spreadsheet.',
  },
  {
    id: 'clipboard',
    title: 'Paste from Clipboard',
    description: 'Copy rows from Excel or Google Sheets and paste directly.',
    icon: <Clipboard className="w-5 h-5" />,
    when: 'Best for quick entry without saving a file first.',
  },
]

export default function SOVMethodPage() {
  const router = useRouter()
  const { currentPayApp, markStepCompleted } = usePayAppStore()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!selectedMethod) return
    setIsLoading(true)
    try {
      await markStepCompleted(7)
      const routeMap: Record<string, string> = {
        import:    `/pay-applications/${currentPayApp?.id}/sov-import`,
        manual:    `/pay-applications/${currentPayApp?.id}/sov-manual`,
        upload:    `/pay-applications/${currentPayApp?.id}/sov-upload`,
        clipboard: `/pay-applications/${currentPayApp?.id}/sov-clipboard`,
      }
      router.push(routeMap[selectedMethod])
    } catch (error) {
      console.error('Failed to mark SOV method as completed:', error)
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

  const guide = (
    <StepGuide
      title="Schedule of Values"
      subtitle="The SOV is the backbone of every construction pay application."
      blocks={[
        {
          type: 'intro',
          text: 'The Schedule of Values (SOV) is a line-by-line breakdown of your contract sum, organized by work division. Every payment application references these line items to show how much of each division has been completed.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <ListOrdered className="w-3.5 h-3.5" />,
          heading: 'What Makes a Good SOV',
          body: [
            'Line items should correspond to CSI MasterFormat divisions (e.g., 03 Concrete, 05 Metals, 09 Finishes).',
            'Scheduled values must add up to exactly the original contract sum.',
            'Avoid over-consolidating — "General Conditions" as a single $200k line item gives the architect nothing to evaluate.',
            'Front-loading (assigning higher value to early work) is common but aggressive front-loading will be flagged by an experienced architect.',
          ],
        },
        {
          type: 'tip',
          text: 'Front-loading by 5–10% is generally accepted. Going beyond that raises cash flow concerns and may require negotiation with the owner.',
        },
        { type: 'divider' },
        {
          type: 'section',
          heading: 'Choosing an Entry Method',
          body: 'All four methods produce the same result — pick the one that fits your workflow. If this is application #2 or later, importing from the previous application is almost always the right choice.',
        },
        {
          type: 'glossary',
          terms: [
            {
              term: 'CSI MasterFormat',
              definition: 'A standard numbering system for construction work divisions published by the Construction Specifications Institute. Using CSI numbers makes your SOV consistent with project specifications.',
            },
            {
              term: 'Scheduled Value',
              definition: 'The total contract amount allocated to a specific line item. The sum of all scheduled values must equal the original contract sum (before change orders).',
            },
            {
              term: 'Roll Forward',
              definition: 'Copying the SOV from a previous application and setting prior work-to-date amounts automatically. Eliminates re-entering historical data.',
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule of Values Method</h1>
        <p className="text-sm text-slate/55 mt-1">Choose how you want to build your schedule of values.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="grid grid-cols-2 gap-4">
            {SOV_METHODS.map(method => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`cursor-pointer rounded-xl border p-5 bg-white shadow-sm transition-all duration-200 ${
                  selectedMethod === method.id
                    ? 'border-teal-500 ring-2 ring-teal-500/20'
                    : 'border-slate/15 hover:border-slate/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                  selectedMethod === method.id ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'
                }`}>
                  {method.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{method.title}</h3>
                <p className="text-xs text-slate/55 mb-2">{method.description}</p>
                <p className="text-xs text-teal-600 font-medium">{method.when}</p>
              </div>
            ))}
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp.id}/setup-review`)}
          onContinue={handleContinue}
          continueDisabled={!selectedMethod || isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
