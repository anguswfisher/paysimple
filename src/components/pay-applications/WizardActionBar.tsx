'use client'

import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'

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
    <div className="border-t border-slate/10 bg-white/80 backdrop-blur-sm px-8 py-4">
      <div className="flex items-center justify-between max-w-2xl">
        <Button
          variant="ghost"
          onClick={onSaveAndExit}
          disabled={isLoading}
          className="text-slate/50 hover:text-slate/80 text-sm"
        >
          Save & Exit
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="text-slate/70 border-slate/20 hover:border-slate/35 text-sm"
          >
            Back
          </Button>
          <Button
            onClick={onContinue}
            disabled={continueDisabled || isLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-5 gap-1.5"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ArrowRight className="w-4 h-4" />
            }
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
