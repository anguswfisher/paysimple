'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DEMO_PAY_APPS } from '@/lib/demo/data'
import { calculatePayAppTotals } from '@/app/pay-applications/calculations'
import { Plus, Eye, Edit, Download, FileText } from 'lucide-react'

const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

const shortDate = (v: string) =>
  new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  finalized: { label: 'Finalized', className: 'bg-teal-100 text-teal-800 border-teal-200' },
  'corrected-draft': { label: 'Corrected Draft', className: 'bg-purple-100 text-purple-800 border-purple-200' },
}

export default function DemoPayApplicationsPage() {
  const rows = [...DEMO_PAY_APPS]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map((app) => ({ app, totals: calculatePayAppTotals(app) }))

  return (
    <div className="flex-1 min-w-0 p-6">
      <div className="max-w-[1400px] min-w-0 mx-auto">

        {/* Title comes from the app topbar; this row carries the page action. */}
        <div className="flex items-center justify-end mb-8">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Pay Application
          </Button>
        </div>

        <Card className="min-w-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle style={{ fontVariant: 'small-caps' }}>All Applications</CardTitle>
              <span className="text-xs text-slate/45">{rows.length} total</span>
            </div>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate mb-2">
                  No Pay Applications Yet
                </h3>
                <p className="text-slate/60 mb-6">
                  Get started by creating your first pay application to track project
                  payments and retainage.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pay Application
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: 1280 }}>
                  <thead>
                    <tr className="border-b border-slate/10">
                      <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm w-20">App #</th>
                      <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm">Project</th>
                      <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm w-32">Period End</th>
                      <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm w-36">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-slate/70 text-sm w-40">Amount Requested</th>
                      <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm w-32">Last Updated</th>
                      <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm w-72">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ app, totals }) => {
                      const status = STATUS[app.status] ?? STATUS.draft
                      return (
                        <tr key={app.id} className="border-b border-slate/5 hover:bg-slate/5 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium tabular-nums">
                            {app.basics.applicationNumber}
                          </td>
                          <td className="py-3 px-4 text-sm min-w-[14rem]">{app.basics.projectName}</td>
                          <td className="py-3 px-4 text-sm tabular-nums">
                            {shortDate(app.basics.periodEndDate)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold tabular-nums">
                            {money(totals.currentPaymentDue)}
                          </td>
                          <td className="py-3 px-4 text-sm tabular-nums text-slate/70">
                            {shortDate(app.updatedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Link href={`/demo/pay-applications/history/${app.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </Link>

                              {app.status === 'draft' && (
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Continue Draft
                                </Button>
                              )}

                              {app.status === 'finalized' && (
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Corrected Draft
                                </Button>
                              )}

                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Export
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
