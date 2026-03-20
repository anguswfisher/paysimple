'use client'

import { StepBar } from '@/components/layout/step-bar'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate">Review Extracted Terms</h1>
        <p className="text-slate/70">Review and edit the payment terms extracted from your contract</p>
      </div>

      <StepBar steps={steps} currentStep="review" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Contract Document</h2>
          <div className="bg-gray-50 rounded p-4 h-96 flex items-center justify-center text-gray-500">
            Contract viewer will be displayed here
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Extracted Terms</h2>
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h3 className="font-medium text-navy">Contract Basics</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate/70">Contract Sum:</span>
                  <span className="font-mono font-semibold">$450,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate/70">Project Duration:</span>
                  <span className="font-mono font-semibold">12 months</span>
                </div>
              </div>
            </div>

            <div className="border rounded p-4">
              <h3 className="font-medium text-navy">Payment Terms</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate/70">Payment Schedule:</span>
                  <span className="font-mono font-semibold">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate/70">Net Payment Terms:</span>
                  <span className="font-mono font-semibold">30 days</span>
                </div>
              </div>
            </div>

            <div className="border rounded p-4">
              <h3 className="font-medium text-navy">Retainage</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate/70">Retainage Rate:</span>
                  <span className="font-mono font-semibold">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate/70">Release Point:</span>
                  <span className="font-mono font-semibold">Substantial Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
