'use client'

import type { ReactNode } from 'react'

interface WizardSplitPaneProps {
  children: ReactNode   // form content + action bar — left half
  guide: ReactNode      // educational content — right half
}

/**
 * Splits the wizard content area into two panes.
 * Left (flex-1) = scrollable form content, Right (45%) = contextual guide.
 * The left pane is itself a flex column so that a sticky WizardActionBar
 * placed as the last child will pin to the bottom.
 */
export function WizardSplitPane({ children, guide }: WizardSplitPaneProps) {
  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Form pane — flex column so action bar sticks to bottom */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-slate/10">
        {children}
      </div>

      {/* Guide pane */}
      <div className="w-[45%] shrink-0 overflow-y-auto bg-[#F8F9FA]">
        {guide}
      </div>
    </div>
  )
}
