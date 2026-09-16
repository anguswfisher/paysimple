'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isDemoActive, disableDemo } from '@/lib/demo/mode'
import { Sparkles, X } from 'lucide-react'

/**
 * Persistent reminder that the data on screen is sample data, plus the way
 * out. Renders nothing when demo mode is off.
 */
export function DemoBanner() {
  const router = useRouter()
  const [active, setActive] = useState(false)

  // Cookie is only readable on the client, so resolve after mount to keep
  // the server and first client render identical.
  useEffect(() => setActive(isDemoActive()), [])

  if (!active) return null

  const exit = () => {
    disableDemo()
    setActive(false)
    router.push('/')
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 mb-5">
      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
      <p className="text-sm text-blue-900 flex-1 min-w-0">
        <span className="font-semibold">Demo mode.</span>{' '}
        <span className="text-blue-800/80">
          Every project, pay application and risk flag here is sample data. Changes
          are not saved.
        </span>
      </p>
      <button
        type="button"
        onClick={exit}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors shrink-0 rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <X className="w-3.5 h-3.5" />
        Exit demo
      </button>
    </div>
  )
}
