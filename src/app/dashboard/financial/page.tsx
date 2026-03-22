'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const financialMetrics = [
  {
    title: 'Total Revenue',
    value: '$18.4M',
    change: '+12.3%',
    changeType: 'increase',
    icon: DollarSign,
    iconColor: 'bg-green-100 text-green-600'
  },
  {
    title: 'Outstanding Invoices',
    value: '$2.3M',
    change: '-5.2%',
    changeType: 'decrease',
    icon: Clock,
    iconColor: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Cash Flow',
    value: '$4.7M',
    change: '+8.7%',
    changeType: 'increase',
    icon: TrendingUp,
    iconColor: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Profit Margin',
    value: '23.4%',
    change: '+2.1%',
    changeType: 'increase',
    icon: ArrowUpRight,
    iconColor: 'bg-purple-100 text-purple-600'
  }
]

const paymentHistory = [
  {
    id: 'PAY-001',
    project: 'Test Project 11',
    amount: 450000,
    status: 'paid',
    dueDate: '2024-03-15',
    paidDate: '2024-03-12',
    daysToPay: 18
  },
  {
    id: 'PAY-002',
    project: 'Westfield Office Build',
    amount: 325000,
    status: 'paid',
    dueDate: '2024-03-20',
    paidDate: '2024-03-25',
    daysToPay: 35
  },
  {
    id: 'PAY-003',
    project: 'Harbor View Residential',
    amount: 280000,
    status: 'pending',
    dueDate: '2024-03-28',
    paidDate: null,
    daysToPay: null
  },
  {
    id: 'PAY-004',
    project: 'Northampton Civic Center',
    amount: 195000,
    status: 'overdue',
    dueDate: '2024-03-10',
    paidDate: null,
    daysToPay: -12
  },
  {
    id: 'PAY-005',
    project: 'Test Project 11',
    amount: 520000,
    status: 'paid',
    dueDate: '2024-03-25',
    paidDate: '2024-03-22',
    daysToPay: 22
  }
]

const agingReport = [
  { category: 'Current (0-30 days)', amount: 1250000, count: 8, color: 'bg-green-100 text-green-700' },
  { category: '31-60 days', amount: 680000, count: 4, color: 'bg-yellow-100 text-yellow-700' },
  { category: '61-90 days', amount: 320000, count: 2, color: 'bg-orange-100 text-orange-700' },
  { category: '90+ days', amount: 450000, count: 3, color: 'bg-red-100 text-red-700' }
]

const cashFlowData = [
  { month: 'Jan', inflow: 2100000, outflow: 1800000, net: 300000 },
  { month: 'Feb', inflow: 2450000, outflow: 2100000, net: 350000 },
  { month: 'Mar', inflow: 2800000, outflow: 2200000, net: 600000 },
  { month: 'Apr', inflow: 2600000, outflow: 2300000, net: 300000 },
  { month: 'May', inflow: 2900000, outflow: 2100000, net: 800000 },
  { month: 'Jun', inflow: 3200000, outflow: 2400000, net: 800000 }
]

export default function FinancialPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('90d')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'overdue': return <AlertTriangle className="w-4 h-4" />
      default: return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = payment.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600 mt-1">Payment history, cash flow, and aging reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.iconColor}`}>
                  <metric.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.changeType === 'increase' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{metric.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cash Flow Analysis</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Monthly inflow vs outflow</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Inflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Outflow</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {cashFlowData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1">
                    <div
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(data.inflow / 3200000) * 200}px` }}
                    ></div>
                    <div
                      className="flex-1 bg-red-500 rounded-t"
                      style={{ height: `${(data.outflow / 3200000) * 200}px` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500">{data.month}</span>
                    <div className="text-xs font-medium text-green-600">{formatCurrency(data.net)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aging Report */}
        <Card>
          <CardHeader>
            <CardTitle>Aging Report</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Outstanding invoices by age</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agingReport.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category.category}</span>
                    <span className="font-medium">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(category.amount / 1250000) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{category.count} invoices</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Outstanding</span>
                <span className="text-lg font-bold">{formatCurrency(2700000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Recent transactions and status</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search payments..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Days to Pay</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{payment.id}</td>
                    <td className="py-3 px-4">{payment.project}</td>
                    <td className="py-3 px-4">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={getStatusColor(payment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{payment.dueDate}</td>
                    <td className="py-3 px-4">{payment.paidDate || '-'}</td>
                    <td className="py-3 px-4">
                      {payment.daysToPay !== null && (
                        <span className={`text-sm font-medium ${
                          payment.daysToPay > 30 ? 'text-red-600' : 
                          payment.daysToPay < 0 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {payment.daysToPay < 0 ? `${Math.abs(payment.daysToPay)} days overdue` : `${payment.daysToPay} days`}
                        </span>
                      )}
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
