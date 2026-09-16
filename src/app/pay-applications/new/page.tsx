'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { useSupabase } from '@/components/providers/supabase-provider'
import { ArrowRight, Check } from 'lucide-react'
import type { EntryMode } from '@/app/pay-applications/types'

const ENTRY_MODES: {
  mode: EntryMode
  title: string
  description: string
  recommended?: boolean
}[] = [
  {
    mode: 'guided',
    title: 'Guided Setup',
    description: "We'll walk you through each step",
    recommended: true,
  },
  {
    mode: 'from-previous',
    title: 'Use Previous Pay App',
    description: 'Your schedule of values and settings will be carried forward',
  },
  {
    mode: 'blank',
    title: 'Start Blank',
    description: 'Jump straight to the workspace with default settings',
  },
]

export default function NewPayApplicationPage() {
  const router = useRouter()
  const { createPayApp } = usePayAppStore()
  const { user, loading: authLoading } = useSupabase()
  const [selectedMode, setSelectedMode] = useState<EntryMode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selectedMode) return
    if (!user) {
      setError('Please sign in before creating a pay application.')
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const newPayApp = await createPayApp(selectedMode, user.id)
      router.push(`/pay-applications/${newPayApp.id}/basics`)
    } catch (error) {
      console.error('Failed to create pay application:', error)
      setError('Unable to create pay application. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push('/pay-applications')
  }

  const handleClassicEditor = () => {
    alert('Classic editor coming soon')
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">New Pay Application</h1>
        <p className="text-slate/70 mt-1">How would you like to get started?</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Entry Mode Cards */}
          <div className="space-y-4" role="group" aria-label="How would you like to get started?">
            {ENTRY_MODES.map((entry) => (
              <button
                key={entry.mode}
                type="button"
                aria-pressed={selectedMode === entry.mode}
                onClick={() => setSelectedMode(entry.mode)}
                className={`
                  w-full text-left rounded-xl border bg-white p-6 transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
                  ${selectedMode === entry.mode
                    ? 'border-teal-600 bg-teal-50/30'
                    : 'border-slate/20 hover:border-slate/40'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {entry.title}
                      </h3>
                      {entry.recommended && (
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate/70">
                      {entry.description}
                    </p>
                  </div>

                  {selectedMode === entry.mode && (
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-slate/20" />
            <span className="text-sm text-slate/50 font-medium">or</span>
            <div className="flex-1 h-px bg-slate/20" />
          </div>

          {/* Classic Editor — navigates straight away, so it reads as a link-style
              action rather than another selectable option */}
          <button
            type="button"
            onClick={handleClassicEditor}
            className="w-full text-left rounded-xl border border-slate/20 bg-white p-6 hover:border-slate/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Classic Editor
                </h3>
                <p className="text-slate/70">
                  Traditional form-based interface for experienced users
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate/40 shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue"
        continueDisabled={!selectedMode || isLoading || authLoading || !user}
        isLoading={isLoading}
      />
      {error && (
        <div className="mt-4 text-sm text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  )
}
