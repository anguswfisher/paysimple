'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AiProcessingSimulator } from '@/components/demo/AiProcessingSimulator'
import { enableDemo } from '@/lib/demo/mode'
import { DollarSign } from 'lucide-react'

/**
 * Demo entry point. Turns on demo mode, plays the simulated contract
 * analysis, then drops the visitor into a fully seeded dashboard.
 */
export default function DemoPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    enableDemo()
    setReady(true)
    // Warm the dashboard so the hand-off is instant.
    router.prefetch('/dashboard')
  }, [router])

  const goToDashboard = () => router.push('/dashboard')

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      {/* Minimal header */}
      <header className="px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <span className="text-lg font-serif text-slate-900 tracking-tight">
            <em className="not-italic text-blue-500">Pay</em>Simple
          </span>
        </Link>
        <button
          type="button"
          onClick={goToDashboard}
          className="text-sm font-medium text-slate/55 hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
        >
          Skip to dashboard →
        </button>
      </header>

      {/* Simulation */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full">
          <div className="text-center mb-8">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-blue-500 mb-2">
              Interactive demo
            </span>
            <h1 className="text-2xl font-serif text-slate-900 tracking-tight">
              Watch PaySimple read a contract
            </h1>
            <p className="text-sm text-slate/55 mt-1.5 max-w-md mx-auto">
              This is a scripted walkthrough using sample project data. Nothing is
              uploaded and no account is required.
            </p>
          </div>

          {ready && <AiProcessingSimulator onComplete={goToDashboard} />}
        </div>
      </div>
    </div>
  )
}
