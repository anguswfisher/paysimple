'use client'

import { StepBar } from '@/components/layout/step-bar'

interface Step {
  id: string
  name: string
  href: string
}

interface ProjectSubheaderProps {
  steps: Step[]
  currentStep: string
}

export function ProjectSubheader({ steps, currentStep }: ProjectSubheaderProps) {
  return (
    <div className="bg-navy border-b-2 border-steel/30">
      <StepBar steps={steps} currentStep={currentStep} />
    </div>
  )
}
