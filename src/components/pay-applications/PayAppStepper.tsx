'use client'

import { PAY_APP_STEPS, PayAppStep } from '@/app/pay-applications/types'
import { usePayAppStore } from '@/app/pay-applications/store'

export function PayAppStepper() {
  const { currentPayApp } = usePayAppStore()

  if (!currentPayApp) {
    return <div className="h-16 animate-pulse bg-slate/10 rounded-lg" />
  }

  const currentStep = currentPayApp.currentStep
  const completedSteps = currentPayApp.completedSteps

  const getStepState = (step: PayAppStep) => {
    const isCompleted = completedSteps.includes(step.step)
    const isCurrent = step.step === currentStep

    if (isCompleted) return 'completed'
    if (isCurrent) return 'current'
    return 'upcoming'
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {PAY_APP_STEPS.map((step, index) => {
          const state = getStepState(step)
          const isLast = index === PAY_APP_STEPS.length - 1

          return (
            <div key={step.step} className="flex items-center">
              {/* Step Node */}
              <div className="flex flex-col items-center">
                {/* Step Circle/Icon */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-200
                    ${
                      state === 'completed'
                        ? 'bg-teal-600 text-white'
                        : state === 'current'
                        ? 'bg-white border-2 border-teal-600 text-teal-600'
                        : 'bg-slate/30 text-slate/60 border-2 border-transparent'
                    }
                  `}
                >
                  {state === 'completed' ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="tabular-nums">{step.step}</span>
                  )}
                </div>

                {/* Step Label */}
                <div
                  className={`
                    mt-2 text-xs font-medium transition-all duration-200
                    ${
                      state === 'completed' || state === 'current'
                        ? 'text-slate-900'
                        : 'text-slate/60'
                    }
                    ${state === 'upcoming' ? 'hidden sm:block' : ''}
                  `}
                  style={{ fontVariant: 'small-caps' }}
                >
                  {step.label}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={`
                    w-12 h-0.5 mx-2 transition-all duration-200
                    ${
                      index < PAY_APP_STEPS.findIndex(s => s.step === currentStep)
                        ? 'bg-teal-600'
                        : 'bg-slate/30'
                    }
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
