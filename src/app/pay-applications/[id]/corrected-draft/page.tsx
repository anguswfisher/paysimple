'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/components/providers/supabase-provider'
import { usePayAppStore } from '@/app/pay-applications/store'
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react'

export default function CorrectedDraftPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()
  const { currentPayApp, loadPayAppById, createCorrectedDraft } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const correctionReasons = [
    'Billing Calculation Error',
    'Missing Work Items', 
    'Incorrect Values',
    'Change Order Update',
    'Owner Request',
    'Other'
  ]

  useEffect(() => {
    const loadPayApp = async (userId: string) => {
      setIsLoading(true)
      try {
        await loadPayAppById(params.id, userId)
      } catch (error) {
        console.error('Failed to load pay application:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      loadPayApp(user.id)
    }
  }, [params.id, loadPayAppById, authLoading, user])

  const handleBack = () => {
    router.push('/pay-applications/history')
  }

  const handleSubmit = async () => {
    if (!reason.trim()) return
    if (!user) {
      console.error('Failed to create corrected draft: user not authenticated')
      return
    }

    setIsLoading(true)
    try {
      const newPayApp = await createCorrectedDraft(params.id, user.id, reason, notes)
      
      if (!newPayApp) {
        throw new Error('Failed to create corrected draft')
      }
      
      // Navigate to the new corrected draft workspace
      router.push(`/pay-applications/${newPayApp.id}/workspace`)
    } catch (error) {
      console.error('Failed to create corrected draft:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate/70 mb-2">Loading pay application...</div>
        </div>
      </div>
    )
  }

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate/70 mb-2">Pay application not found</div>
          <div className="text-sm text-slate/50">The original pay application could not be found.</div>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Return to History
          </button>
        </div>
      </div>
    )
  }

  // Only allow corrected drafts from finalized pay apps
  if (currentPayApp.status !== 'finalized') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Cannot Create Corrected Draft
          </h3>
          <p className="text-slate/70 mb-4">
            Corrected drafts can only be created from finalized pay applications. This application is currently in "{currentPayApp.status}" status.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Return to History
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate/5 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate/70" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Corrected Draft</h1>
            <p className="text-slate/70 text-sm">
              Create a corrected version of a finalized pay application
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Original Pay App Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Pay Application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate/60">Project:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {currentPayApp.basics.projectName}
                  </span>
                </div>
                <div>
                  <span className="text-slate/60">Application Number:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    #{currentPayApp.basics.applicationNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate/60">Billing Period:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {formatDate(currentPayApp.basics.periodStartDate)} - {formatDate(currentPayApp.basics.periodEndDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate/60">Finalized On:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {formatDate(currentPayApp.finalizedAt || '')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Correction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reason Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Reason for Correction <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="">Select a reason...</option>
                  {correctionReasons.map((reasonOption) => (
                    <option key={reasonOption} value={reasonOption}>
                      {reasonOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide any additional context about this correction..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>

              {/* Warning Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-amber-900 mb-1">
                      Important Notice
                    </div>
                    <div className="text-sm text-amber-800">
                      Creating a corrected draft will copy all data from the original. The original will remain unchanged for record-keeping.
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 mb-1">
                      What happens next?
                    </div>
                    <div className="text-sm text-blue-800">
                      After creating the corrected draft, you'll be taken to the workspace where you can make the necessary changes before finalizing the corrected version.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-slate/10 px-6 py-4 bg-white">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-slate/30 rounded-md hover:bg-slate/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isLoading}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Corrected Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}
