'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePayAppStore } from '@/app/pay-applications/store'
import { calculatePayAppTotals } from '@/app/pay-applications/calculations'
import { AlertTriangle, Save, ArrowRight, X } from 'lucide-react'
import type { LineItem } from '@/app/pay-applications/types'

// ── Helpers ───────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

// ── Read-only cell ────────────────────────────────────────────

function ReadCell({ value, className = '' }: { value: string; className?: string }) {
  return (
    <td className={`px-3 py-2 text-right tabular-nums text-slate-500 text-sm ${className}`}>
      {value}
    </td>
  )
}

// ── Editable number cell ──────────────────────────────────────

function EditCell({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [local, setLocal] = useState(String(value))

  return (
    <td className="px-1 py-1">
      <input
        type="number"
        min="0"
        step="0.01"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={(e) => {
          const parsed = parseFloat(e.target.value)
          const final = isNaN(parsed) ? 0 : parsed
          setLocal(String(final))
          onChange(final)
        }}
        className="w-full px-2 py-1.5 text-right tabular-nums text-sm bg-white border border-transparent rounded hover:border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
      />
    </td>
  )
}

// ── Main Page ─────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter()
  const { currentPayApp, updateLineItem } = usePayAppStore()
  const [showWarnings, setShowWarnings] = useState(false)

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 text-sm">No pay application loaded.</p>
      </div>
    )
  }

  const { lineItems, retainageSettings, materialsStoredEnabled } = currentPayApp
  const retainagePct = retainageSettings.retainagePercent / 100
  const totals = calculatePayAppTotals(currentPayApp)

  const warningItems = lineItems.filter(
    (item) => (item.earnedToDate ?? 0) > item.scheduledValue,
  )

  const handleFieldChange = (id: string, field: keyof LineItem, value: number | string) => {
    updateLineItem(id, { [field]: value })
  }

  // Column letter labels shift when materials column is present
  const col = (base: number) =>
    String.fromCharCode(64 + (materialsStoredEnabled ? base : base > 4 ? base - 1 : base))

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-20">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {currentPayApp.basics.projectName || 'Untitled Project'}
            {currentPayApp.basics.applicationNumber && (
              <span className="text-slate-400 font-normal ml-2">
                — App #{currentPayApp.basics.applicationNumber}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide font-medium">
            Schedule of Values
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/pay-applications')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Exit
          </button>
          <button
            onClick={() => router.push(`/pay-applications/${currentPayApp.id}/summary`)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Review Summary
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Warning Bar ──────────────────────────────────────── */}
      {warningItems.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-2.5 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-sm text-amber-800">
              <span className="font-medium">{warningItems.length} line item{warningItems.length !== 1 ? 's' : ''}</span>
              {' '}exceed their scheduled value
            </span>
          </div>
          <button
            onClick={() => setShowWarnings(true)}
            className="text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900"
          >
            View details
          </button>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: materialsStoredEnabled ? 1300 : 1150 }}>

          {/* Single thead with two rows */}
          <thead className="sticky top-0 z-10">
            {/* Row 1 — Column names */}
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description of Work</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Scheduled Value</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Previous Apps</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">This Period</th>
              {materialsStoredEnabled && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Materials Stored</th>
              )}
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Total to Date</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">%</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Balance</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Retainage</th>
            </tr>

            {/* Row 2 — pay application column letters */}
            <tr className="bg-slate-50 border-b-2 border-slate-200">
              <th className="px-3 py-1" />
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">A</th>
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">B</th>
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">C</th>
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">D</th>
              {materialsStoredEnabled && (
                <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">E</th>
              )}
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">{materialsStoredEnabled ? 'F' : 'E'}</th>
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">{materialsStoredEnabled ? 'G' : 'F'}</th>
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">{materialsStoredEnabled ? 'H' : 'G'}</th>
              <th className="px-3 py-1 text-center text-xs text-slate-400 font-medium">{materialsStoredEnabled ? 'I' : 'H'}</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100">
            {lineItems.length === 0 && (
              <tr>
                <td
                  colSpan={materialsStoredEnabled ? 10 : 9}
                  className="px-6 py-16 text-center text-sm text-slate-400"
                >
                  No line items yet. Go back to add your Schedule of Values.
                </td>
              </tr>
            )}

            {lineItems.map((item) => {
              const workToDate = item.previousWork + item.thisPeriodWork
              const materialsToDate = item.previousMaterialsStored + item.thisPeriodMaterialsStored
              const earnedToDate = workToDate + materialsToDate
              const retainageHeld = earnedToDate * retainagePct
              const balanceToFinish = item.scheduledValue - earnedToDate
              const percentComplete =
                item.scheduledValue > 0 ? (earnedToDate / item.scheduledValue) * 100 : 0
              const hasWarning = earnedToDate > item.scheduledValue

              return (
                <tr
                  key={item.id}
                  className={`group hover:bg-slate-50/80 transition-colors ${
                    hasWarning ? 'bg-amber-50/40' : ''
                  }`}
                >
                  {/* Line number — warning indicator lives here */}
                  <td
                    className={`px-3 py-2 text-center text-sm tabular-nums text-slate-400 ${
                      hasWarning ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    {item.lineNumber}
                  </td>

                  {/* Description — editable text */}
                  <td className="px-1 py-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                      placeholder="Enter description"
                      className="w-full px-2 py-1.5 text-sm bg-white border border-transparent rounded hover:border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </td>

                  {/* Scheduled Value — editable */}
                  <EditCell
                    value={item.scheduledValue}
                    onChange={(v) => handleFieldChange(item.id, 'scheduledValue', v)}
                  />

                  {/* Previous Applications — read-only */}
                  <ReadCell value={formatCurrency(item.previousWork)} />

                  {/* This Period — editable */}
                  <EditCell
                    value={item.thisPeriodWork}
                    onChange={(v) => handleFieldChange(item.id, 'thisPeriodWork', v)}
                  />

                  {/* Materials Stored — conditional editable */}
                  {materialsStoredEnabled && (
                    <EditCell
                      value={item.thisPeriodMaterialsStored}
                      onChange={(v) => handleFieldChange(item.id, 'thisPeriodMaterialsStored', v)}
                    />
                  )}

                  {/* Total Completed & Stored — read-only */}
                  <ReadCell
                    value={formatCurrency(earnedToDate)}
                    className={hasWarning ? 'text-amber-600 font-medium' : ''}
                  />

                  {/* % Complete — read-only */}
                  <ReadCell value={formatPercent(percentComplete)} />

                  {/* Balance to Finish — read-only */}
                  <ReadCell
                    value={formatCurrency(balanceToFinish)}
                    className={balanceToFinish < 0 ? 'text-red-500' : ''}
                  />

                  {/* Retainage — read-only */}
                  <ReadCell value={formatCurrency(retainageHeld)} />
                </tr>
              )
            })}
          </tbody>

          {/* Grand Totals — not sticky, lives at bottom of table naturally */}
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
              <td className="px-3 py-3 text-xs uppercase tracking-wide text-slate-500 text-center">
                Total
              </td>
              <td className="px-3 py-3 text-xs text-slate-400">Grand Totals</td>
              <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-900">
                {formatCurrency(totals.originalContractSum)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-500">
                {formatCurrency(totals.lessPreviousCertificates)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-900">
                {formatCurrency(totals.currentPaymentDue)}
              </td>
              {materialsStoredEnabled && (
                <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-500">
                  {formatCurrency(
                    lineItems.reduce((s, i) => s + i.thisPeriodMaterialsStored, 0),
                  )}
                </td>
              )}
              <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-900">
                {formatCurrency(totals.totalCompletedAndStoredToDate)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-500">
                {totals.contractSumToDate > 0
                  ? formatPercent(
                      (totals.totalCompletedAndStoredToDate / totals.contractSumToDate) * 100,
                    )
                  : '—'}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-900">
                {formatCurrency(totals.balanceToFinishIncludingRetainage)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-sm text-slate-900">
                {formatCurrency(totals.totalRetainage)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── KPI Footer ───────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">
              Contract Sum
            </div>
            <div className="text-base font-semibold tabular-nums text-slate-800">
              {formatCurrency(totals.contractSumToDate)}
            </div>
          </div>

          <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">
              Completed & Stored
            </div>
            <div className="text-base font-semibold tabular-nums text-slate-800">
              {formatCurrency(totals.totalCompletedAndStoredToDate)}
            </div>
          </div>

          <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">
              Less Retainage
            </div>
            <div className="text-base font-semibold tabular-nums text-slate-800">
              {formatCurrency(totals.totalRetainage)}
            </div>
          </div>

          <div className="px-4 py-3 rounded-lg bg-teal-600 border border-teal-700">
            <div className="text-xs text-teal-200 uppercase tracking-wide font-medium mb-1">
              Current Payment Due
            </div>
            <div className="text-base font-semibold tabular-nums text-white">
              {formatCurrency(totals.currentPaymentDue)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Warnings Modal ───────────────────────────────────── */}
      {showWarnings && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowWarnings(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-slate-900 text-sm">Line Item Warnings</h3>
              </div>
              <button
                onClick={() => setShowWarnings(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {warningItems.map((item) => {
                const earned =
                  item.previousWork +
                  item.thisPeriodWork +
                  item.previousMaterialsStored +
                  item.thisPeriodMaterialsStored
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-semibold text-amber-700">
                        {item.lineNumber}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {item.description || 'Untitled line item'}
                      </div>
                      <div className="text-xs text-amber-700 mt-0.5">
                        Earned {formatCurrency(earned)} exceeds scheduled value of{' '}
                        {formatCurrency(item.scheduledValue)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}