'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSupabase } from '@/components/providers/supabase-provider'
import { usePayAppStore } from '@/app/pay-applications/store'
import { calculatePayAppTotals } from '@/app/pay-applications/calculations'
import { FileText, Plus, Download, Eye, Edit } from 'lucide-react'

export default function PayApplicationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()
  const { payApps, loadPayApps } = usePayAppStore()

  useEffect(() => {
    if (!authLoading && user) {
      loadPayApps(user.id)
    }
  }, [authLoading, user, loadPayApps])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Draft</Badge>
      case 'finalized':
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Finalized</Badge>
      case 'corrected-draft':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Corrected Draft</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (payApps.length === 0) {
    return (
      <div className="flex-1 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pay Applications</h1>
            <p className="text-slate/70 mt-1">
              Create, manage, and track your construction pay applications
            </p>
          </div>
          <Button 
            onClick={() => router.push('/pay-applications/new')}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Pay Application
          </Button>
        </div>

        {/* Empty State */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-slate/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate/40" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Pay Applications Yet
            </h3>
            <p className="text-slate/70 text-center mb-6">
              Get started by creating your first pay application to track project payments and retainage.
            </p>
            <Button 
              onClick={() => router.push('/pay-applications/new')}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Pay Application
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pay Applications</h1>
          <p className="text-slate/70 mt-1">
            Create, manage, and track your construction pay applications
          </p>
        </div>
        <Button 
          onClick={() => router.push('/pay-applications/new')}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Pay Application
        </Button>
      </div>

      {/* Pay Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontVariant: 'small-caps' }}>
            All Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10">
                  <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm">
                    App #
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm">
                    Period End
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate/70 text-sm">
                    Amount Requested
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm">
                    Last Updated
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate/70 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {payApps.map((payApp) => {
                  const totals = calculatePayAppTotals(payApp)
                  return (
                    <tr key={payApp.id} className="border-b border-slate/5 hover:bg-slate/5">
                      <td className="py-3 px-4 text-sm font-medium tabular-nums">
                        {payApp.basics.applicationNumber}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {payApp.basics.projectName}
                      </td>
                      <td className="py-3 px-4 text-sm tabular-nums">
                        {formatDate(payApp.basics.periodEndDate)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(payApp.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium tabular-nums">
                        {formatCurrency(totals.currentPaymentDue)}
                      </td>
                      <td className="py-3 px-4 text-sm tabular-nums">
                        {formatDate(payApp.updatedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/pay-applications/history/${payApp.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          
                          {payApp.status === 'draft' && (
                            <Link href={`/pay-applications/${payApp.id}/basics`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Continue Draft
                              </Button>
                            </Link>
                          )}
                          
                          {payApp.status === 'finalized' && (
                            <Link href={`/pay-applications/${payApp.id}/corrected-draft`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Corrected Draft
                              </Button>
                            </Link>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => alert('Export coming soon')}
                          >
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
        </CardContent>
      </Card>
    </div>
  )
}
