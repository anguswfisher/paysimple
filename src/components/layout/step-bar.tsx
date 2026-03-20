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
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStepIndex
          const isCurrent = stepIdx === currentStepIndex
          const isUpcoming = stepIdx > currentStepIndex
          
          return (
            <li key={step.name} className={cn("flex-1", stepIdx !== steps.length - 1 && "pr-8 sm:pr-20")}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
                      <Check className="h-6 w-6" />
                    </div>
                  ) : isCurrent ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white">
                      <span className="text-sm font-medium">{stepIdx + 1}</span>
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <span className="text-sm font-medium text-gray-500">{stepIdx + 1}</span>
                    </div>
                  )}
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-success" : isCurrent ? "text-navy" : "text-gray-500"
                  )}>
                    {step.name}
                  </p>
                </div>
              </div>
              
              {/* Progress line */}
              {stepIdx !== steps.length - 1 && (
                <div className="absolute left-0 top-5 -ml-px h-0.5 w-full" 
                     aria-hidden="true"
                     style={{
                       marginLeft: '2.5rem',
                       width: `calc(100% - 2.5rem)`,
                       backgroundColor: isCompleted ? '#27AE60' : '#E5E7EB'
                     }} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
