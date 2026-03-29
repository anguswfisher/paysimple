'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { PenTool, AlertTriangle } from 'lucide-react'

interface SignatureInfo {
  signerName: string
  title: string
  date: string
  notes: string
}

export default function FinalizeSignPage() {
  const router = useRouter()
  const { currentPayApp, updateSignatureInfo, finalizePayApp } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo>({
    signerName: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [isCertified, setIsCertified] = useState(false)

  useEffect(() => {
    if (currentPayApp?.signatureInfo) {
      setSignatureInfo({
        signerName: currentPayApp.signatureInfo.signerName || '',
        title: currentPayApp.signatureInfo.title || '',
        date: currentPayApp.signatureInfo.date || new Date().toISOString().split('T')[0],
        notes: currentPayApp.signatureInfo.notes || '',
      })
    }
  }, [currentPayApp])

  const handleSignAndFinalize = async () => {
    if (!signatureInfo.signerName || !signatureInfo.title || !isCertified) {
      return
    }

    setIsLoading(true)
    try {
      // Save signature info
      await updateSignatureInfo(signatureInfo)
      
      // Finalize the pay application
      await finalizePayApp()
      
      // Navigate to preview
      router.push(`/pay-applications/${currentPayApp?.id}/finalize-preview`)
    } catch (error) {
      console.error('Failed to finalize pay application:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = async () => {
    try {
      // Save signature info without finalizing
      await updateSignatureInfo(signatureInfo)
      router.push('/pay-applications')
    } catch (error) {
      console.error('Failed to save signature info:', error)
      // TODO: Show error message to user
    }
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/finalize-confirm`)
  }

  const canSign = signatureInfo.signerName.trim() !== '' && 
                 signatureInfo.title.trim() !== '' && 
                 isCertified

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate/70 mb-2">Pay application not found</div>
          <div className="text-sm text-slate/50">Redirecting to pay applications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Contractor's Certification</h1>
        <p className="text-slate/70 mt-1">
          Sign and finalize your pay application
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-teal-600" />
                </div>
                <CardTitle className="text-lg">Contractor's Certification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Certification Text */}
              <div className="bg-slate/50 rounded-lg p-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  The undersigned certifies that the work covered by this application for payment has been completed in accordance with the Contract Documents, that the amounts shown represent work actually performed and materials properly stored on the site, that the work has been inspected by the Architect, and that to the best of the undersigned's knowledge and belief, the work covered by this application for payment is in accordance with the Contract Documents.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Signer's Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Signer's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signatureInfo.signerName}
                    onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signatureInfo.title}
                    onChange={(e) => setSignatureInfo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter your job title"
                    className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={signatureInfo.date}
                    onChange={(e) => setSignatureInfo(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={signatureInfo.notes}
                    onChange={(e) => setSignatureInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes or comments"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </div>
              </div>

              {/* Certification Checkbox */}
              <div className="border-t border-slate/10 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCertified}
                    onChange={(e) => setIsCertified(e.target.checked)}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded mt-0.5"
                  />
                  <span className="text-sm text-slate-700">
                    I certify that the information provided is accurate and complete to the best of my knowledge.
                  </span>
                </label>
              </div>

              {/* Validation Warning */}
              {!canSign && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Please complete all required fields and check the certification box before signing.
                  </p>
                </div>
              )}

              {/* Sign & Finalize Button */}
              <button
                onClick={handleSignAndFinalize}
                disabled={!canSign || isLoading}
                className="w-full py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Finalizing...' : 'Sign & Finalize'}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleSignAndFinalize}
        continueLabel="Sign & Finalize"
        continueDisabled={!canSign || isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}
