'use client'

// ─────────────────────────────────────────────────────────────
// Simulated AI extraction pipeline for the demo.
//
// Runs a scripted sequence of stages with per-stage progress, a live log
// that types itself out, and findings that pop in as they are "detected".
// Nothing here calls a model — it is a choreographed animation over the
// fixtures in lib/demo/data.ts.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, Sparkles, FileSearch, ScanLine, ShieldAlert, Table2 } from 'lucide-react'

export interface AiStage {
  id: string
  label: string
  detail: string
  /** Milliseconds this stage runs for. */
  duration: number
  icon: React.ReactNode
  /** Log lines revealed while this stage runs. */
  log: string[]
}

export const CONTRACT_EXTRACTION_STAGES: AiStage[] = [
  {
    id: 'parse',
    label: 'Reading document',
    detail: 'Splitting pages, running OCR where needed',
    duration: 2200,
    icon: <FileSearch className="w-4 h-4" />,
    log: [
      'Detected PDF · 24 pages · text layer present',
      'Normalizing article and section numbering',
      'Indexed 187 clauses across 14 articles',
    ],
  },
  {
    id: 'classify',
    label: 'Identifying contract type',
    detail: 'Matching structure against known agreement forms',
    duration: 1900,
    icon: <ScanLine className="w-4 h-4" />,
    log: [
      'Structure matches a stipulated sum agreement',
      'General conditions referenced by incorporation',
      'Confidence 0.94',
    ],
  },
  {
    id: 'extract',
    label: 'Extracting payment terms',
    detail: 'Pulling sums, dates, retainage and billing cycle',
    duration: 3000,
    icon: <Sparkles className="w-4 h-4" />,
    log: [
      'Contract sum — $14,250,000',
      'Retainage — 10% of each progress payment',
      'Billing cycle — monthly, applications due the 25th',
      'Payment due — 30 days from certification',
      'Retainage reduction — to 5% at substantial completion',
    ],
  },
  {
    id: 'schedule',
    label: 'Building payment schedule',
    detail: 'Projecting draws across the contract term',
    duration: 2400,
    icon: <Table2 className="w-4 h-4" />,
    log: [
      'Derived 18 monthly draw periods',
      'Applied retainage step-down at period 11',
      'Schedule of values seeded with 23 CSI divisions',
    ],
  },
  {
    id: 'compliance',
    label: 'Checking compliance risk',
    detail: 'Comparing clauses against statute and standard terms',
    duration: 2600,
    icon: <ShieldAlert className="w-4 h-4" />,
    log: [
      'Cross-referencing state prompt payment act',
      'Flagged — substantial completion date undefined (low)',
      'No pay-if-paid language detected',
      'Compliance score 96 / 100',
    ],
  },
]

type StageState = 'pending' | 'running' | 'done'

export function AiProcessingSimulator({
  stages = CONTRACT_EXTRACTION_STAGES,
  onComplete,
  fileName = 'Northgate_Medical_Agreement.pdf',
}: {
  stages?: AiStage[]
  onComplete?: () => void
  fileName?: string
}) {
  const [stageIndex, setStageIndex] = useState(0)
  const [stageProgress, setStageProgress] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [finished, setFinished] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Drive one stage at a time; each tick advances progress and drip-feeds
  // that stage's log lines so the panel never sits still.
  useEffect(() => {
    if (stageIndex >= stages.length) {
      setFinished(true)
      const t = setTimeout(() => onCompleteRef.current?.(), 900)
      return () => clearTimeout(t)
    }

    const stage = stages[stageIndex]
    const tickMs = 60
    const ticks = Math.max(1, Math.round(stage.duration / tickMs))
    let tick = 0
    let revealed = 0

    const interval = setInterval(() => {
      tick += 1
      const pct = Math.min(100, Math.round((tick / ticks) * 100))
      setStageProgress(pct)

      // Reveal log lines evenly across the stage.
      const shouldHaveRevealed = Math.floor((pct / 100) * stage.log.length)
      if (shouldHaveRevealed > revealed) {
        const next = stage.log.slice(revealed, shouldHaveRevealed)
        revealed = shouldHaveRevealed
        setLog((prev) => [...prev, ...next])
      }

      if (tick >= ticks) {
        clearInterval(interval)
        setStageIndex((i) => i + 1)
        setStageProgress(0)
      }
    }, tickMs)

    return () => clearInterval(interval)
  }, [stageIndex, stages])

  // Keep the newest log line in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [log])

  const overallPct = Math.round(
    ((stageIndex + stageProgress / 100) / stages.length) * 100
  )

  const stateOf = (i: number): StageState =>
    i < stageIndex ? 'done' : i === stageIndex ? 'running' : 'pending'

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!finished && (
            <span className="absolute inset-0 rounded-xl bg-blue-500/40 animate-ping" />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">
            {finished ? 'Analysis complete' : 'Analyzing contract'}
          </h2>
          <p className="text-xs text-slate/55 truncate">{fileName}</p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {finished ? 100 : overallPct}%
          </div>
        </div>
      </div>

      {/* Overall bar */}
      <div
        className="h-1.5 bg-slate/10 rounded-full overflow-hidden mb-6"
        role="progressbar"
        aria-valuenow={finished ? 100 : overallPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Contract analysis progress"
      >
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-150 ease-out"
          style={{ width: `${finished ? 100 : overallPct}%` }}
        />
      </div>

      {/* Stages */}
      <ol className="space-y-1.5 mb-5">
        {stages.map((stage, i) => {
          const state = stateOf(i)
          return (
            <li
              key={stage.id}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-300 ${
                state === 'running'
                  ? 'border-blue-200 bg-blue-50/60'
                  : state === 'done'
                  ? 'border-transparent bg-transparent'
                  : 'border-transparent bg-transparent opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  state === 'done'
                    ? 'bg-emerald-500 text-white'
                    : state === 'running'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate/10 text-slate/40'
                }`}
              >
                {state === 'done' ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : state === 'running' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  stage.icon
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm ${
                    state === 'pending' ? 'text-slate/50' : 'font-medium text-slate-800'
                  }`}
                >
                  {stage.label}
                </div>
                {state === 'running' && (
                  <div className="text-xs text-slate/55 mt-0.5">{stage.detail}</div>
                )}
              </div>

              {state === 'running' && (
                <div className="w-16 h-1 bg-blue-200/60 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${stageProgress}%` }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {/* Live log */}
      <div
        ref={logRef}
        className="h-36 overflow-y-auto rounded-xl border border-slate/12 bg-slate-900 px-4 py-3 font-mono text-[11px] leading-relaxed"
        aria-live="polite"
        aria-label="Analysis log"
      >
        {log.length === 0 && <div className="text-slate-500">Waiting for document…</div>}
        {log.map((line, i) => (
          <div
            key={i}
            className="text-slate-300 animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <span className="text-emerald-400 select-none">›</span> {line}
          </div>
        ))}
        {!finished && (
          <div className="text-slate-500 mt-0.5">
            <span className="inline-block w-1.5 h-3 bg-emerald-400 align-middle animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}
