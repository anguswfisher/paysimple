'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { PAY_APP_STEPS, PayAppStep, stepFromPathname } from '@/app/pay-applications/types'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Check, ArrowLeft } from 'lucide-react'

export function PayAppStepper() {
  const { currentPayApp } = usePayAppStore()
  const pathname = usePathname()
  const params = useParams()

  if (!currentPayApp) {
    return (
      <div className="w-52 shrink-0 bg-[#F2F4F5] border-r border-slate/10 p-5 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-slate/10 animate-pulse" />
        ))}
      </div>
    )
  }

  const payAppId = (params?.id as string) ?? currentPayApp.id

  // Derived from the URL rather than stored state, so every screen in a step
  // reports the same step number — the stepper can't drift from where you are.
  const currentStep = stepFromPathname(pathname) ?? currentPayApp.currentStep
  const completedSteps = currentPayApp.completedSteps
  const completedCount = completedSteps.length

  const getStepState = (step: PayAppStep) => {
    if (step.step === currentStep) return 'current'
    if (completedSteps.includes(step.step)) return 'completed'
    return 'upcoming'
  }

  return (
    <div className="w-52 shrink-0 bg-[#F2F4F5] border-r border-slate/10 flex flex-col">
      {/* Sidebar header */}
      <div className="px-5 pt-7 pb-4 border-b border-slate/10">
        <p className="text-[10px] font-semibold tracking-widest text-slate/40 uppercase mb-0.5">
          Pay Application
        </p>
        <p className="text-xs text-slate/50">
          {completedCount} of {PAY_APP_STEPS.length} steps complete
        </p>
        {/* Progress bar */}
        <div className="mt-2.5 h-1 bg-slate/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / PAY_APP_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Pay application steps">
        {PAY_APP_STEPS.map((step, index) => {
          const state = getStepState(step)
          const isLast = index === PAY_APP_STEPS.length - 1
          // Only steps you have already finished are navigable — jumping ahead
          // would skip data the later steps depend on.
          const isNavigable = state === 'completed'

          const rowClass = `
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left
            ${state === 'current'
              ? 'bg-white shadow-sm border border-slate/10'
              : isNavigable
              ? 'hover:bg-slate/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
              : ''
            }
          `

          const circle = (
            <div
              className={`
                w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold
                transition-all duration-200
                ${state === 'completed'
                  ? 'bg-teal-600 text-white'
                  : state === 'current'
                  ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                  : 'bg-white border-2 border-slate/20 text-slate/35'
                }
              `}
            >
              {state === 'completed'
                ? <Check className="w-3 h-3 stroke-[3]" />
                : <span>{step.step}</span>
              }
            </div>
          )

          const label = (
            <span
              className={`
                text-sm transition-all duration-200
                ${state === 'current'
                  ? 'font-semibold text-slate-800'
                  : state === 'completed'
                  ? 'font-medium text-slate-500'
                  : 'font-medium text-slate/35'
                }
              `}
              style={{ fontVariant: 'small-caps' }}
            >
              {step.label}
            </span>
          )

          const dot = state === 'current'
            ? <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
            : null

          return (
            <div key={step.step}>
              {isNavigable ? (
                <Link
                  href={`/pay-applications/${payAppId}/${step.route}`}
                  className={rowClass}
                  title={`Back to step ${step.step}: ${step.label}`}
                >
                  {circle}
                  {label}
                  {dot}
                </Link>
              ) : (
                <div
                  className={rowClass}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  {circle}
                  {label}
                  {dot}
                </div>
              )}

              {/* Connector line */}
              {!isLast && (
                <div className="ml-[1.4rem] flex justify-center w-6 py-0.5">
                  <div className={`w-px h-3 transition-colors duration-300 ${
                    state === 'completed' ? 'bg-teal-300' : 'bg-slate/15'
                  }`} />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Always-available way out of the wizard */}
      <div className="px-3 py-4 border-t border-slate/10">
        <Link
          href="/pay-applications"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate/60 hover:text-slate-800 hover:bg-slate/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit to Pay Applications
        </Link>
      </div>
    </div>
  )
}
