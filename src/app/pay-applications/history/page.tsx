'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePayAppStore } from '@/app/pay-applications/store'
import { ArrowLeft, Search, Eye, FileText, AlertCircle } from 'lucide-react'

export default function HistoryPage() {
  const router = useRouter()
  const { payApps } = usePayAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized' | 'corrected-draft'>('all')

  useEffect(() => {
    // This page reads from payApps in store, no additional loading needed
  }, [])

  const handleBack = () => {
    router.push('/pay-applications')
  }

  const handleViewPayApp = (id: string) => {
    router.push(`/pay-applications/history/${id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'finalized':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'corrected-draft':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'finalized':
        return 'Finalized'
      case 'corrected-draft':
        return 'Corrected Draft'
      default:
        return status
    }
  }

  // Filter and search logic
  const filteredPayApps = useMemo(() => {
    return payApps.filter(payApp => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'draft' && payApp.status !== 'draft') return false
        if (statusFilter === 'finalized' && payApp.status !== 'finalized') return false
        if (statusFilter === 'corrected-draft' && payApp.status !== 'corrected-draft') return false
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const projectName = payApp.basics.projectName.toLowerCase()
        const appNumber = `#${payApp.basics.applicationNumber}`.toLowerCase()
        
        if (!projectName.includes(searchLower) && !appNumber.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [payApps, searchTerm, statusFilter])

  const hasFilters = searchTerm !== '' || statusFilter !== 'all'
  const hasNoAppsAtAll = payApps.length === 0
  const hasNoResults = filteredPayApps.length === 0 && !hasNoAppsAtAll

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate/5 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate/70" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pay Application History</h1>
            <p className="text-slate/70 text-sm">View and manage all your pay applications</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-slate/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate/40" />
            <input
              type="text"
              placeholder="Search by project name or app number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
            <option value="corrected-draft">Corrected Draft</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Empty States */}
          {hasNoAppsAtAll ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate/40" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Pay Applications Yet
                </h3>
                <p className="text-slate/70 mb-6">
                  You haven't created any pay applications yet. Get started by creating your first one.
                </p>
                <button
                  onClick={() => router.push('/pay-applications/new')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Create First Pay App
                </button>
              </CardContent>
            </Card>
          ) : hasNoResults ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate/40" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-slate/70">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Pay Apps List */
            <div className="space-y-3">
              {filteredPayApps.map((payApp) => (
                <Card
                  key={payApp.id}
                  className="cursor-pointer hover:border-teal-200 transition-colors"
                  onClick={() => handleViewPayApp(payApp.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Left: Project Name + App # */}
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {payApp.basics.projectName}
                        </div>
                        <div className="text-sm text-slate/60">
                          App #{payApp.basics.applicationNumber}
                        </div>
                      </div>

                      {/* Center: Period End Date + Status Badge */}
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-slate/70 text-right">
                          {formatDate(payApp.basics.periodEndDate)}
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payApp.status)}`}>
                          {getStatusLabel(payApp.status)}
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewPayApp(payApp.id)
                          }}
                          className="p-2 text-slate/60 hover:text-slate-900 hover:bg-slate/5 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {payApp.status === 'finalized' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Handle corrected draft creation
                              console.log('Create corrected draft for', payApp.id)
                            }}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                            title="Create Corrected Draft"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
