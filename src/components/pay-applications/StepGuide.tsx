'use client'

import type { ReactNode } from 'react'
import { Lightbulb, AlertCircle, BookOpen, HelpCircle, Info } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────

export type GuideBlock =
  | { type: 'intro';   text: string }
  | { type: 'section'; icon?: ReactNode; heading: string; body: string | string[] }
  | { type: 'tip';     text: string }
  | { type: 'warning'; text: string }
  | { type: 'glossary'; terms: { term: string; definition: string }[] }
  | { type: 'checklist'; heading?: string; items: string[] }
  | { type: 'divider' }

export interface StepGuideProps {
  title: string
  subtitle?: string
  blocks: GuideBlock[]
}

// ── Sub-components ────────────────────────────────────────────────

function Body({ text }: { text: string | string[] }) {
  if (Array.isArray(text)) {
    return (
      <div className="space-y-1.5">
        {text.map((p, i) => (
          <p key={i} className="text-sm text-slate/65 leading-relaxed">{p}</p>
        ))}
      </div>
    )
  }
  return <p className="text-sm text-slate/65 leading-relaxed">{text}</p>
}

// ── Main component ────────────────────────────────────────────────

export function StepGuide({ title, subtitle, blocks }: StepGuideProps) {
  return (
    <div className="px-7 py-7 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b border-slate/10">
        <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-navy" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate/50 mt-0.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Blocks */}
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'divider':
            return <hr key={i} className="border-slate/10" />

          case 'intro':
            return (
              <p key={i} className="text-sm text-slate/65 leading-relaxed">
                {block.text}
              </p>
            )

          case 'section':
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  {block.icon && (
                    <span className="text-teal-600 shrink-0">{block.icon}</span>
                  )}
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate/50">
                    {block.heading}
                  </h4>
                </div>
                <Body text={block.body} />
              </div>
            )

          case 'tip':
            return (
              <div key={i} className="flex gap-3 p-3.5 bg-teal-50 border border-teal-100 rounded-xl">
                <Lightbulb className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <p className="text-sm text-teal-800 leading-relaxed">{block.text}</p>
              </div>
            )

          case 'warning':
            return (
              <div key={i} className="flex gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">{block.text}</p>
              </div>
            )

          case 'glossary':
            return (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-slate/40" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate/50">
                    Key Terms
                  </h4>
                </div>
                <div className="space-y-2">
                  {block.terms.map((t, j) => (
                    <div key={j} className="p-3 bg-white border border-slate/10 rounded-lg">
                      <div className="text-xs font-semibold text-slate-700 mb-0.5">{t.term}</div>
                      <div className="text-xs text-slate/55 leading-relaxed">{t.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )

          case 'checklist':
            return (
              <div key={i} className="space-y-2">
                {block.heading && (
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate/40" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate/50">
                      {block.heading}
                    </h4>
                  </div>
                )}
                <ul className="space-y-1.5">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate/65">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )

          default:
            return null
        }
      })}

      {/* Footer note */}
      <div className="pt-3 border-t border-slate/10">
        <p className="text-xs text-slate/35 leading-relaxed">
          PaySimple follows the <span className="font-medium">AIA G702/G703</span> standard for
          construction payment applications, widely required by owners, lenders, and architects.
        </p>
      </div>
    </div>
  )
}
