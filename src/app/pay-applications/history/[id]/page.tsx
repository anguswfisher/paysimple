'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { usePayAppStore } from '@/app/pay-applications/store'
import { calculatePayAppTotals } from '@/app/pay-applications/calculations'
import { ArrowLeft, Download, FilePlus, AlertTriangle, FileQuestion } from 'lucide-react'
import type { PayAppTotals } from '@/app/pay-applications/types'

export default function HistoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()
  const { currentPayApp, loadPayAppById } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [totals, setTotals] = useState<PayAppTotals | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    const load = async (userId: string) => {
      setIsLoading(true)
      try {
        await loadPayAppById(params.id, userId)
      } catch (error) {
        console.error('Failed to load pay application:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load(user.id)
    return () => {
      cancelled = true
    }
  }, [params.id, loadPayAppById, authLoading, user])

  useEffect(() => {
    if (currentPayApp) setTotals(calculatePayAppTotals(currentPayApp))
  }, [currentPayApp])

  const money = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

  const shortDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const STATUS_STYLES: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    finalized: { label: 'Finalized', className: 'bg-teal-50 text-teal-700 border-teal-200' },
    'corrected-draft': { label: 'Corrected Draft', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  }

  // Column totals for the schedule of values footer.
  const columnTotals = useMemo(() => {
    const items = currentPayApp?.lineItems ?? []
    return items.reduce(
      (acc, item) => ({
        scheduledValue: acc.scheduledValue + item.scheduledValue,
        previousWork: acc.previousWork + item.previousWork,
        thisPeriodWork: acc.thisPeriodWork + item.thisPeriodWork,
        materialsToDate: acc.materialsToDate + (item.materialsToDate ?? 0),
        earnedToDate: acc.earnedToDate + (item.earnedToDate ?? 0),
        retainageHeld: acc.retainageHeld + (item.retainageHeld ?? 0),
        balanceToFinish: acc.balanceToFinish + (item.balanceToFinish ?? 0),
      }),
      {
        scheduledValue: 0, previousWork: 0, thisPeriodWork: 0,
        materialsToDate: 0, earnedToDate: 0, retainageHeld: 0, balanceToFinish: 0,
      },
    )
  }, [currentPayApp])

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-[1400px] mx-auto space-y-4">
          <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-96 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!currentPayApp || !totals) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-5 h-5 text-slate-400" />
          </div>
          <h1 className="text-base font-semibold text-slate-800 mb-1.5">
            Pay application not found
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            It may have been deleted, or the link may be incorrect.
          </p>
          <Link
            href="/pay-applications/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to history
          </Link>
        </div>
      </div>
    )
  }

  const status = STATUS_STYLES[currentPayApp.status] ?? STATUS_STYLES.draft
  const { basics, signatureInfo, materialsStoredEnabled } = currentPayApp
  const overBilledCount = currentPayApp.lineItems.filter(
    (i) => (i.percentComplete ?? 0) > 100,
  ).length

  const detailRows: { label: string; value: string }[] = [
    { label: 'Owner', value: basics.ownerName },
    { label: 'Contractor', value: basics.contractorName },
    {
      label: 'Billing period',
      value: `${shortDate(basics.periodStartDate)} – ${shortDate(basics.periodEndDate)}`,
    },
    { label: 'Payment due', value: shortDate(basics.paymentDueDate) },
    {
      label: 'Retainage',
      value: `${currentPayApp.retainageSettings.retainagePercent}% of ${
        currentPayApp.retainageSettings.appliesTo === 'both'
          ? 'work and materials'
          : currentPayApp.retainageSettings.appliesTo
      }`,
    },
    {
      label: 'Change orders',
      value: currentPayApp.changeOrderSettings.hasChangeOrders
        ? `${currentPayApp.changeOrderSettings.changeOrders.length} · ${money(
            totals.netChangeByChangeOrders,
          )}`
        : 'None',
    },
  ]

  return (
    <div className="flex-1 min-w-0 p-6">
      <div className="max-w-[1400px] min-w-0 mx-auto space-y-5">

        {/* ── Header ──────────────────────────────────────── */}
        <div>
          <Link
            href="/pay-applications/history"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to history
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {basics.projectName}
                </h1>
                <span
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Application #{basics.applicationNumber}
                {currentPayApp.finalizedAt && (
                  <> · Finalized {shortDate(currentPayApp.finalizedAt)}</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => alert('Coming soon')}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              {currentPayApp.status === 'finalized' && (
                <button
                  type="button"
                  onClick={() => router.push(`/pay-applications/${params.id}/corrected-draft`)}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <FilePlus className="w-4 h-4" />
                  Create Corrected Draft
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Money band ──────────────────────────────────── */}
        {/* Payment due is the number people open this page for, so it gets the
            weight; the rest supports it at a smaller size. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_2fr] gap-4">
          <div className="rounded-xl border border-teal-200 bg-teal-50 px-5 py-4 flex flex-col justify-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 mb-1">
              Current Payment Due
            </div>
            <div className="text-3xl font-bold text-teal-800 tabular-nums tracking-tight">
              {money(totals.currentPaymentDue)}
            </div>
            <div className="text-xs text-teal-700/70 mt-1">
              Net of {money(totals.totalRetainage)} retainage
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-slate-200 rounded-xl border border-slate-200 overflow-hidden">
            {[
              { label: 'Contract sum', value: totals.contractSumToDate },
              { label: 'Completed & stored', value: totals.totalCompletedAndStoredToDate },
              { label: 'Less retainage', value: totals.totalRetainage },
              { label: 'Balance incl. retainage', value: totals.balanceToFinishIncludingRetainage },
            ].map((stat) => (
              <div key={stat.label} className="bg-white px-4 py-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                  {stat.label}
                </div>
                <div className="text-base font-semibold text-slate-900 tabular-nums">
                  {money(stat.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Details + certification ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <section className="rounded-xl border border-slate-200 bg-white">
            <h2 className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              Application details
            </h2>
            <dl className="px-5 py-1 divide-y divide-slate-100">
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-6 py-2.5">
                  <dt className="text-sm text-slate-500 shrink-0">{row.label}</dt>
                  <dd className="text-sm font-medium text-slate-900 text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <h2 className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              Certification
            </h2>
            {signatureInfo ? (
              <div className="px-5 py-4">
                <div className="text-base font-semibold text-slate-900">
                  {signatureInfo.signerName}
                </div>
                <div className="text-sm text-slate-500">{signatureInfo.title}</div>
                <div className="text-sm text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
                  Signed {shortDate(signatureInfo.date)}
                </div>
                {signatureInfo.notes && (
                  <p className="text-sm text-slate-600 mt-2.5">{signatureInfo.notes}</p>
                )}
              </div>
            ) : (
              <p className="px-5 py-4 text-sm text-slate-500">
                This application has not been signed.
              </p>
            )}
          </section>
        </div>

        {/* ── Schedule of values ──────────────────────────── */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden min-w-0">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Schedule of values
            </h2>
            <span className="text-xs text-slate-400">
              {currentPayApp.lineItems.length} line items
            </span>
            {overBilledCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                <AlertTriangle className="w-3 h-3" />
                {overBilledCount} line{overBilledCount === 1 ? '' : 's'} over scheduled value
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse text-sm"
              style={{ minWidth: materialsStoredEnabled ? 1180 : 1050 }}
            >
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap w-24">#</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Description of work</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-32">Scheduled value</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-32">Previous apps</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-32">This period</th>
                  {materialsStoredEnabled && (
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-32">Materials stored</th>
                  )}
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-32">Completed to date</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-20">%</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-32">Balance to finish</th>
                </tr>
              </thead>

              <tbody>
                {currentPayApp.lineItems.map((item, index) => {
                  const pct = item.percentComplete ?? 0
                  const over = pct > 100
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-2 text-slate-500 tabular-nums whitespace-nowrap">
                        {item.lineNumber || index + 1}
                      </td>
                      <td className="px-4 py-2 text-slate-800">{item.description}</td>
                      <td className="px-4 py-2 text-right text-slate-800 tabular-nums">{money(item.scheduledValue)}</td>
                      <td className="px-4 py-2 text-right text-slate-500 tabular-nums">{money(item.previousWork)}</td>
                      <td className="px-4 py-2 text-right text-slate-800 tabular-nums">{money(item.thisPeriodWork)}</td>
                      {materialsStoredEnabled && (
                        <td className="px-4 py-2 text-right text-slate-500 tabular-nums">{money(item.materialsToDate ?? 0)}</td>
                      )}
                      <td className="px-4 py-2 text-right font-medium text-slate-900 tabular-nums">{money(item.earnedToDate ?? 0)}</td>
                      <td className={`px-4 py-2 text-right tabular-nums font-medium ${over ? 'text-amber-700' : 'text-slate-600'}`}>
                        <span className="inline-flex items-center gap-1 justify-end">
                          {over && <AlertTriangle className="w-3 h-3 shrink-0" />}
                          {pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-slate-500 tabular-nums">{money(item.balanceToFinish ?? 0)}</td>
                    </tr>
                  )
                })}
              </tbody>

              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-900">
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-[11px] uppercase tracking-wide text-slate-500">Totals</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(columnTotals.scheduledValue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(columnTotals.previousWork)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(columnTotals.thisPeriodWork)}</td>
                  {materialsStoredEnabled && (
                    <td className="px-4 py-3 text-right tabular-nums">{money(columnTotals.materialsToDate)}</td>
                  )}
                  <td className="px-4 py-3 text-right tabular-nums">{money(columnTotals.earnedToDate)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {columnTotals.scheduledValue > 0
                      ? ((columnTotals.earnedToDate / columnTotals.scheduledValue) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(columnTotals.balanceToFinish)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
