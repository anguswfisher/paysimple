'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface WizardActionBarProps {
  onSaveAndExit: () => void
  onBack: () => void
  onContinue: () => void
  continueLabel?: string
  continueDisabled?: boolean
  isLoading?: boolean
}

export function WizardActionBar({
  onSaveAndExit,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  isLoading = false,
}: WizardActionBarProps) {
  return (
    <div className="border-t border-slate/10 bg-white px-6 py-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left: Save & Exit */}
        <Button
          variant="outline"
          onClick={onSaveAndExit}
          disabled={isLoading}
          className="text-slate/70"
        >
          Save & Exit
        </Button>

        {/* Right: Back + Continue */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            onClick={onContinue}
            disabled={continueDisabled || isLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
