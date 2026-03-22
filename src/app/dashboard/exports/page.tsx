'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, FileText, Table, Shield, File, FileArchive, TrendingUp, Search, Filter, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useExports } from '@/hooks/useExports'

export default function ExportsPage() {
  const { exports, processing, loading, error, createExport, downloadExport, deleteExport } = useExports()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const exportTypes = [
    {
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      title: 'Payment Schedule PDF',
      description: 'Full G702/G703-style schedule with retainage',
      format: 'PDF',
      type: 'payment_schedule_pdf'
    },
    {
      icon: Table,
      color: 'bg-green-100 text-green-600',
      title: 'Schedule of Values (CSV)',
      description: 'Line-item breakdown for accounting software',
      format: 'CSV',
      type: 'schedule_csv'
    },
    {
      icon: Shield,
      color: 'bg-yellow-100 text-yellow-600',
      title: 'Compliance Report PDF',
      description: 'Risk flags, scores, and clause analysis',
      format: 'PDF',
      type: 'compliance_pdf'
    },
    {
      icon: File,
      color: 'bg-purple-100 text-purple-600',
      title: 'Contract Terms (DOCX)',
      description: 'Extracted terms in Word format',
      format: 'DOCX',
      type: 'terms_docx'
    },
    {
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-600',
      title: 'Payment History (CSV)',
      description: 'Historical payment data and trends',
      format: 'CSV',
      type: 'payment_history_csv'
    },
    {
      icon: FileArchive,
      color: 'bg-red-100 text-red-600',
      title: 'Project Bundle (ZIP)',
      description: 'All documents and data for project',
      format: 'ZIP',
      type: 'project_bundle'
    }
  ]

  const handleCreateExport = async (type: string, projectId?: string) => {
    try {
      await createExport(type as any, projectId)
    } catch (error) {
      console.error('Failed to create export:', error)
    }
  }

  const handleDownload = async (exportId: string) => {
    try {
      await downloadExport(exportId)
    } catch (error) {
      console.error('Failed to download export:', error)
    }
  }

  const handleDelete = async (exportId: string) => {
    if (confirm('Are you sure you want to delete this export?')) {
      try {
        await deleteExport(exportId)
      } catch (error) {
        console.error('Failed to delete export:', error)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />
      case 'processing': return <RefreshCw className="w-4 h-4 text-warning animate-spin" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-danger" />
      default: return <Clock className="w-4 h-4 text-slate/50" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/20'
      case 'processing': return 'bg-warning/10 text-warning border-warning/20'
      case 'failed': return 'bg-danger/10 text-danger border-danger/20'
      default: return 'bg-slate/10 text-slate/70 border-slate/20'
    }
  }

  const filteredExports = exports?.filter((exportItem: any) => {
    const matchesSearch = exportItem.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exportItem.export_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || exportItem.export_type === typeFilter
    const matchesStatus = statusFilter === 'all' || exportItem.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  }) || []

  const exportHistory = [
    {
      name: 'Payment Schedule — App #3',
      project: 'Test Project 11',
      type: 'PDF',
      size: '284 KB',
      created: '3/21/26'
    },
    {
      name: 'Schedule of Values Q1',
      project: 'Test Project 11',
      type: 'CSV',
      size: '48 KB',
      created: '3/18/26'
    },
    {
      name: 'Compliance Report — March',
      project: 'Westfield Office Build',
      type: 'PDF',
      size: '512 KB',
      created: '3/15/26'
    },
    {
      name: 'Extracted Contract Terms',
      project: 'Harbor View Residential',
      type: 'DOCX',
      size: '120 KB',
      created: '3/10/26'
    },
    {
      name: 'Full Project Bundle',
      project: 'Northampton Civic Center',
      type: 'ZIP',
      size: '1.2 MB',
      created: '3/5/26'
    }
  ]

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'PDF': return 'bg-blue-100 text-blue-600'
      case 'CSV': return 'bg-green-100 text-green-600'
      case 'DOCX': return 'bg-slate/10 text-slate/70'
      case 'ZIP': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-slate/10 text-slate/70'
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Types */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate">Export a Report</h2>
          <p className="text-sm text-slate/70 mt-1">Choose a format to generate and download</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportTypes.map((exportType, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${exportType.color}`}>
                    <exportType.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate mb-1">{exportType.title}</h3>
                    <p className="text-sm text-slate/70 leading-relaxed">{exportType.description}</p>
                  </div>
                  <Button size="sm" className="bg-navy hover:bg-navy/90 flex-shrink-0">
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export History</CardTitle>
              <p className="text-sm text-slate/70 mt-1">Your recent downloads</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input 
                  placeholder="Search exports..." 
                  className="pl-10 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="zip">ZIP</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="test-project-11">Test Project 11</SelectItem>
                  <SelectItem value="westfield">Westfield Office</SelectItem>
                  <SelectItem value="harbor">Harbor View</SelectItem>
                  <SelectItem value="northampton">Northampton Civic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Report Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Size</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Created</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((exportItem, index) => (
                  <tr key={index} className="border-b border-slate/5 hover:bg-slate/5">
                    <td className="py-3 px-4 font-medium">{exportItem.name}</td>
                    <td className="py-3 px-4">{exportItem.project}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={getFormatColor(exportItem.type)}>
                        {exportItem.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{exportItem.size}</td>
                    <td className="py-3 px-4">{exportItem.created}</td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
