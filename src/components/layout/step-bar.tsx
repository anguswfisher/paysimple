'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  id: string
  name: string
  href: string
}

interface StepBarProps {
  steps: Step[]
  currentStep: string
  className?: string
}

export function StepBar({ steps, currentStep, className }: StepBarProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <nav
      aria-label="Progress"
      className={cn(
        "w-full border-b border-gray-200 bg-warm-white",
        className
      )}
    >
      <ol className="flex h-11 items-center justify-center gap-0">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStepIndex
          const isCurrent = stepIdx === currentStepIndex

          return (
            <li key={step.id} className="flex items-center">
              {/* Connector line before step (skip first) */}
              {stepIdx > 0 && (
                <div
                  className={cn(
                    "mx-2 h-[1.5px] w-10 rounded-full transition-colors duration-300",
                    isCompleted ? "bg-success" : "bg-gray-200"
                  )}
                />
              )}

              {/* Step pill */}
              <div className="flex items-center gap-1.5">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-300",
                    isCompleted &&
                      "bg-success text-white",
                    isCurrent &&
                      "bg-navy text-white",
                    !isCompleted &&
                      !isCurrent &&
                      "border-[1.5px] border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    <span>{stepIdx + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "whitespace-nowrap text-[11px] font-medium transition-colors duration-300",
                    isCompleted && "text-success",
                    isCurrent && "text-navy",
                    !isCompleted && !isCurrent && "text-gray-400"
                  )}
                >
                  {step.name}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}