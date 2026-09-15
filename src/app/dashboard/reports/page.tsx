'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  FileText, 
  Shield, 
  DollarSign,
  Clock,
  Download,
  Plus,
  Search,
  Calendar,
  TrendingUp
} from 'lucide-react'

const savedReports = [
  {
    id: 1,
    name: 'Monthly Payment Summary',
    description: 'Pay application billing vs. received — all projects',
    type: 'Scheduled',
    formats: ['PDF', 'CSV'],
    icon: BarChart3,
    iconColor: 'bg-blue-100 text-blue-600',
    lastRun: '2024-03-21',
    nextRun: '2024-04-01'
  },
  {
    id: 2,
    name: 'Compliance Risk Report',
    description: 'Open flags, scores, clause coverage by project',
    type: 'Saved',
    formats: ['PDF'],
    icon: Shield,
    iconColor: 'bg-green-100 text-green-600',
    lastRun: '2024-03-15',
    nextRun: null
  },
  {
    id: 3,
    name: 'Retainage Release Tracker',
    description: 'Held amounts, % complete, release forecast',
    type: 'Saved',
    formats: ['PDF', 'XLSX'],
    icon: DollarSign,
    iconColor: 'bg-yellow-100 text-yellow-600',
    lastRun: '2024-03-10',
    nextRun: null
  },
  {
    id: 4,
    name: 'Schedule of Values',
    description: 'Full line-item breakdown with completion %',
    type: 'Scheduled',
    formats: ['XLSX'],
    icon: FileText,
    iconColor: 'bg-purple-100 text-purple-600',
    lastRun: '2024-03-19',
    nextRun: '2024-04-01'
  },
  {
    id: 5,
    name: 'Aging Receivables',
    description: 'Outstanding payments by days overdue',
    type: 'Alert',
    formats: ['PDF'],
    icon: Clock,
    iconColor: 'bg-red-100 text-red-600',
    lastRun: '2024-03-05',
    nextRun: null
  }
]

const reportHistory = [
  { report: 'Payment Summary', project: 'Test Project 11', format: 'PDF', runBy: 'Angus F.', date: '3/21/26' },
  { report: 'Schedule of Values', project: 'Westfield Office', format: 'XLSX', runBy: 'Sarah L.', date: '3/19/26' },
  { report: 'Compliance Risk', project: 'All Projects', format: 'PDF', runBy: 'Angus F.', date: '3/15/26' },
  { report: 'Retainage Tracker', project: 'Harbor View', format: 'DOCX', runBy: 'Marcus K.', date: '3/10/26' },
  { report: 'Aging Receivables', project: 'All Projects', format: 'PDF', runBy: 'Angus F.', date: '3/5/26' }
]

const scheduledReports = [
  { name: 'Monthly Payment Summary', frequency: 'Monthly', nextRun: 'Apr 1, 2026', formats: 'PDF + CSV' },
  { name: 'Quarterly Compliance Review', frequency: 'Quarterly', nextRun: 'Apr 15, 2026', formats: 'PDF' },
  { name: 'Financial Summary', frequency: 'Monthly', nextRun: 'Apr 1, 2026', formats: 'XLSX' }
]

export default function ReportsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700'
      case 'Saved': return 'bg-green-100 text-green-700'
      case 'Alert': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'PDF': return 'bg-blue-100 text-blue-600'
      case 'CSV': return 'bg-green-100 text-green-600'
      case 'XLSX': return 'bg-purple-100 text-purple-600'
      case 'DOCX': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const filteredReports = savedReports.filter(report => {
    const matchesFilter = activeFilter === 'all' || report.type.toLowerCase() === activeFilter
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'saved', 'scheduled', 'shared'].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              placeholder="Search reports..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Saved Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.iconColor}`}>
                  <report.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{report.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className={getTypeColor(report.type)}>
                      {report.type}
                    </Badge>
                    {report.formats.map((format) => (
                      <Badge key={format} variant="outline" className={getFormatColor(format)}>
                        {format}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last run: {report.lastRun}</span>
                    {report.nextRun && <span>Next: {report.nextRun}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Run
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Report Card */}
        <Card className="border-dashed border-2 cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Build Custom Report</h3>
            <p className="text-sm text-gray-500">Choose metrics, filters, and format</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Report Run History</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Last 10 report generations</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Run By</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.report}</td>
                      <td className="py-3 px-4">{item.project}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className={getFormatColor(item.format)}>
                          {item.format}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{item.runBy}</td>
                      <td className="py-3 px-4">{item.date}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Deliveries</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Auto-generated reports</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledReports.map((report, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{report.name}</div>
                    <div className="text-xs text-gray-500">{report.formats}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{report.nextRun}</div>
                    <div className="text-xs text-gray-500">{report.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
