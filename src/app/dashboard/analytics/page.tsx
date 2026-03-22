'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Shield, 
  Clock,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

// Dummy data
const kpiData = [
  {
    label: 'Total Billed',
    value: '$18.4M',
    delta: '+12.3% vs prior period',
    deltaType: 'up',
    icon: DollarSign,
    iconColor: 'bg-blue-100 text-blue-600'
  },
  {
    label: 'Payments Received',
    value: '$16.1M',
    delta: '87.5% collection rate',
    deltaType: 'up',
    icon: CheckCircle,
    iconColor: 'bg-green-100 text-green-600'
  },
  {
    label: 'Retainage Held',
    value: '$2.3M',
    delta: 'Across 4 projects',
    deltaType: 'neutral',
    icon: Shield,
    iconColor: 'bg-yellow-100 text-yellow-600'
  },
  {
    label: 'Avg Days to Pay',
    value: '23',
    delta: '4 days faster than avg',
    deltaType: 'up',
    icon: Clock,
    iconColor: 'bg-purple-100 text-purple-600'
  }
]

const billingData = [
  { month: 'Aug', billed: 2.1, received: 1.8 },
  { month: 'Sep', billed: 2.8, received: 2.4 },
  { month: 'Oct', billed: 3.2, received: 2.9 },
  { month: 'Nov', billed: 3.8, received: 3.4 },
  { month: 'Dec', billed: 2.9, received: 2.6 },
  { month: 'Jan', billed: 4.1, received: 3.7 },
  { month: 'Feb', billed: 4.6, received: 4.2 },
  { month: 'Mar', billed: 4.9, received: 4.5 }
]

const contractTypes = [
  { name: 'AIA A101', value: 13000000, percentage: 52, color: '#3b82f6' },
  { name: 'AIA A102', value: 7750000, percentage: 31, color: '#10b981' },
  { name: 'AIA A103', value: 4250000, percentage: 17, color: '#f59e0b' }
]

const complianceTrend = [
  { month: 'Oct', score: 82 },
  { month: 'Nov', score: 85 },
  { month: 'Dec', score: 87 },
  { month: 'Jan', score: 90 },
  { month: 'Feb', score: 93 },
  { month: 'Mar', score: 94 }
]

const paymentVelocity = [
  { app: 'App1', days: 27 },
  { app: 'App2', days: 31 },
  { app: 'App3', days: 18 },
  { app: 'App4', days: 34 },
  { app: 'App5', days: 22 },
  { app: 'App6', days: 23 }
]

const riskFlags = [
  { category: 'Pay-When-Paid', count: 8, color: '#3b82f6' },
  { category: 'Retainage Rate', count: 5, color: '#f59e0b' },
  { category: 'Lien Waivers', count: 4, color: '#10b981' },
  { category: 'Stored Materials', count: 3, color: '#8b5cf6' },
  { category: 'Substantial Completion', count: 2, color: '#ef4444' }
]

const projectPerformance = [
  {
    name: 'Test Project 11',
    contract: 'A101',
    contractValue: 25000002,
    billedToDate: 9200000,
    received: 8100000,
    retainage: 1100000,
    compliance: 94,
    trend: [40, 55, 60, 75, 90]
  },
  {
    name: 'Westfield Office Build',
    contract: 'A102',
    contractValue: 12400000,
    billedToDate: 5800000,
    received: 5200000,
    retainage: 650000,
    compliance: 71,
    trend: [70, 60, 65, 55, 71]
  },
  {
    name: 'Harbor View Residential',
    contract: 'A101',
    contractValue: 8750000,
    billedToDate: 2100000,
    received: 1900000,
    retainage: 280000,
    compliance: 83,
    trend: [30, 40, 55, 70, 83]
  },
  {
    name: 'Northampton Civic Center',
    contract: 'A103',
    contractValue: 4250000,
    billedToDate: 1300000,
    received: 1200000,
    retainage: 260000,
    compliance: 98,
    trend: [85, 88, 90, 95, 98]
  }
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30D')
  const [searchTerm, setSearchTerm] = useState('')

  const formatDate = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const getDeltaIcon = (type: string) => {
    switch (type) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      default: return null
    }
  }

  const getDeltaColor = (type: string) => {
    switch (type) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getContractBadgeColor = (type: string) => {
    switch (type) {
      case 'A101': return 'bg-blue-100 text-blue-700'
      case 'A102': return 'bg-green-100 text-green-700'
      case 'A103': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderSparkline = (data: number[], color: string = '#3b82f6') => {
    const max = Math.max(...data)
    return (
      <div className="flex items-end gap-0.5" style={{ width: '50px', height: '28px' }}>
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-100 rounded-t-sm"
            style={{
              height: `${(value / max) * 100}%`,
              backgroundColor: index === data.length - 1 ? color : '#dbeafe'
            }}
          />
        ))}
      </div>
    )
  }

  const filteredProjects = projectPerformance.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Portfolio performance across all projects</p>
        </div>
        <div className="flex items-center gap-2">
          {['7D', '30D', '90D', 'YTD', 'All'].map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
              className={dateRange === range ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.iconColor}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>
              <div className={`flex items-center gap-1 text-sm font-medium ${getDeltaColor(kpi.deltaType)}`}>
                {getDeltaIcon(kpi.deltaType)}
                <span>{kpi.delta}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing vs Received Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Billing vs. Payments Received</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Monthly comparison — last 8 months</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Billed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Received</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {billingData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(data.billed / 5) * 100}px` }}
                    ></div>
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(data.received / 5) * 100}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contract Type Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Value by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 160 160" className="w-full h-full">
                  {contractTypes.map((type, index) => {
                    const circumference = 2 * Math.PI * 56
                    const offset = index === 0 ? 0 : contractTypes.slice(0, index).reduce((sum, t) => sum + t.percentage, 0) * circumference / 100
                    const dashArray = (type.percentage * circumference / 100)
                    return (
                      <circle
                        key={type.name}
                        cx="80"
                        cy="80"
                        r="56"
                        fill="none"
                        stroke={type.color}
                        strokeWidth="22"
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={-88 - offset}
                        transform="rotate(-90 80 80)"
                      />
                    )
                  })}
                  <circle cx="80" cy="80" r="44" fill="white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-gray-900">$25M</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
              <div className="w-full space-y-2">
                {contractTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{type.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatDate(type.value)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {type.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compliance Score Trend</CardTitle>
            <p className="text-xs text-gray-600">Rolling 6-month average</p>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-1 mb-4">
              {complianceTrend.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(data.score / 100) * 128}px` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-2 text-center">
              {complianceTrend.map((data, index) => (
                <div key={index}>
                  <p className="text-xs text-gray-500">{data.month}</p>
                  <p className="text-sm font-medium">{data.score}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment Velocity</CardTitle>
            <p className="text-xs text-gray-600">Avg days to receive payment per app</p>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2 mb-4">
              {paymentVelocity.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t ${index === paymentVelocity.length - 1 ? 'bg-blue-500' : 'bg-blue-100'}`}
                    style={{ height: `${(data.days / 40) * 128}px` }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-1">{data.days}d</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-center border-t pt-2">
              <div>
                <p className="text-xs text-gray-500">Fastest</p>
                <p className="text-sm font-medium text-green-600">18 days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Average</p>
                <p className="text-sm font-medium">27 days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Slowest</p>
                <p className="text-sm font-medium text-red-600">34 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Flags by Category</CardTitle>
            <p className="text-xs text-gray-600">All-time distribution</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {riskFlags.map((risk) => (
                <div key={risk.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{risk.category}</span>
                    <span className="font-medium">{risk.count}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(risk.count / 10) * 100}%`,
                        backgroundColor: risk.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2 border-t text-center">
              <div>
                <p className="text-xs text-gray-500">Total Flags</p>
                <p className="text-lg font-bold">22</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Resolved</p>
                <p className="text-lg font-bold text-green-600">19</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Open</p>
                <p className="text-lg font-bold text-red-600">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Performance Summary</CardTitle>
              <p className="text-sm text-gray-600 mt-1">All active projects, YTD</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Value</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Billed to Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Retainage</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{project.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={getContractBadgeColor(project.contract)}>
                        {project.contract}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{formatDate(project.contractValue)}</td>
                    <td className="py-3 px-4">
                      {formatDate(project.billedToDate)}
                      <span className="text-gray-500 text-xs ml-1">
                        ({Math.round((project.billedToDate / project.contractValue) * 100)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 font-medium">{formatDate(project.received)}</span>
                    </td>
                    <td className="py-3 px-4">{formatDate(project.retainage)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getComplianceColor(project.compliance)}`}>
                        {project.compliance}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {renderSparkline(project.trend)}
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
