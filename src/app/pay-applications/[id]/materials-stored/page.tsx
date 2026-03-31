'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Warehouse, Package, ShieldCheck } from 'lucide-react'

export default function MaterialsStoredPage() {
  const router = useRouter()
  const { currentPayApp, updateMaterialsStoredEnabled, markStepCompleted } = usePayAppStore()
  const [materialsStoredEnabled, setMaterialsStoredEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    } finally {
      setIsLoading(false)
    }
  }

  const guide = (
    <StepGuide
      title="Materials Stored"
      subtitle="Understanding when and how to bill for materials on-site but not yet installed."
      blocks={[
        {
          type: 'intro',
          text: 'Stored materials are items that have been purchased and delivered to the job site but have not yet been incorporated into the permanent work. Many contracts allow billing for these materials as they represent a real cost to the contractor.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Package className="w-3.5 h-3.5" />,
          heading: 'When to Enable',
          body: [
            'You have materials purchased and physically on-site (or in approved off-site storage).',
            'Your contract expressly permits billing for stored materials.',
            'The materials are suitably stored and protected from weather, theft, and damage.',
          ],
        },
        {
          type: 'tip',
          text: 'Check your contract\'s General Conditions. AIA A201 §9.3.2 covers the requirements for including stored materials in a pay application.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          heading: 'Documentation Required',
          body: [
            'Invoices or receipts showing the cost of materials purchased.',
            'Proof of delivery to the job site (delivery tickets, photos).',
            'Insurance certificate covering the materials in storage if stored off-site.',
            'Bill of sale or conditional transfer documents for off-site storage.',
          ],
        },
        {
          type: 'warning',
          text: 'Do not bill for materials that haven\'t arrived on-site yet or that are still at the supplier\'s warehouse without an approved off-site storage agreement.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Warehouse className="w-3.5 h-3.5" />,
          heading: 'How It Appears in the Workspace',
          body: 'When enabled, the G703 workspace adds a "Materials Stored" column (Column E in AIA format). You\'ll enter the value of newly stored materials each period. The system tracks this separately from work completed.',
        },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Materials Stored to Date',
              definition: 'Cumulative value of materials on-site not yet installed. Decreases as materials get incorporated into the work.',
            },
            {
              term: 'Total Completed & Stored',
              definition: 'Work completed to date plus materials stored to date. This is column F (or G703 column D+E+F) — the basis for calculating payment due.',
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
          <span>Step 2</span>
          <span className="text-slate/20">·</span>
          <span>Billing</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Materials Stored</h1>
        <p className="text-sm text-slate/55 mt-1">Configure billing for materials purchased but not yet installed.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-5">

          {/* Toggle card */}
          <div
            onClick={() => setMaterialsStoredEnabled(!materialsStoredEnabled)}
            className={`cursor-pointer rounded-xl border p-6 bg-white shadow-sm transition-all duration-200 ${
              materialsStoredEnabled ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate/15 hover:border-slate/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                materialsStoredEnabled ? 'bg-teal-600' : 'bg-slate/10'
              }`}>
                <Warehouse className={`w-5 h-5 ${materialsStoredEnabled ? 'text-white' : 'text-slate/50'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Bill for materials stored on-site</h3>
                <p className="text-sm text-slate/55">Enable if you have materials purchased but not yet installed.</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${materialsStoredEnabled ? 'bg-teal-600' : 'bg-slate/20'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm mt-0.5 transition-transform duration-200 ${materialsStoredEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className={`text-xs font-semibold ${materialsStoredEnabled ? 'text-teal-600' : 'text-slate/40'}`}>
                    {materialsStoredEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status info */}
          <div className={`rounded-xl border p-4 text-sm transition-all ${
            materialsStoredEnabled ? 'bg-teal-50 border-teal-100 text-teal-800' : 'bg-slate/5 border-slate/10 text-slate/50'
          }`}>
            {materialsStoredEnabled
              ? 'A Materials Stored column will appear in the workspace (G703 Column E). You\'ll track and bill for materials each period.'
              : 'Materials stored columns will be hidden from the workspace. You can change this setting later if needed.'}
          </div>
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp?.id}/change-orders`)}
          onContinue={handleContinue}
          continueDisabled={isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}
