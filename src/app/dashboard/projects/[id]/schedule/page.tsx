'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Eye, Download, Edit, Grid, List, Save, X, Plus, Trash2 } from 'lucide-react'

interface PaymentItem {
  id: number
  paymentNumber: string
  description: string
  dueDate: string
  grossAmount: string
  retainage: string
  netAmount: string
  status: 'paid' | 'pending'
  isEditing?: boolean
}

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isEditing, setIsEditing] = useState(false)
  const [payments, setPayments] = useState<PaymentItem[]>([
    { id: 1, paymentNumber: '1', description: 'Monthly Progress Payment', dueDate: '2024-01-15', grossAmount: '37500', retainage: '1875', netAmount: '35625', status: 'paid' },
    { id: 2, paymentNumber: '2', description: 'Monthly Progress Payment', dueDate: '2024-02-15', grossAmount: '37500', retainage: '1875', netAmount: '35625', status: 'paid' },
    { id: 3, paymentNumber: '3', description: 'Monthly Progress Payment', dueDate: '2024-03-15', grossAmount: '37500', retainage: '1875', netAmount: '35625', status: 'paid' },
    { id: 4, paymentNumber: '4', description: 'Monthly Progress Payment', dueDate: '2024-04-15', grossAmount: '37500', retainage: '1875', netAmount: '35625', status: 'pending' },
    { id: 5, paymentNumber: '5', description: 'Monthly Progress Payment', dueDate: '2024-05-15', grossAmount: '37500', retainage: '1875', netAmount: '35625', status: 'pending' },
    { id: 6, paymentNumber: '6', description: 'Monthly Progress Payment', dueDate: '2024-06-15', grossAmount: '37500', retainage: '1875', netAmount: '35625', status: 'pending' },
    { id: 7, paymentNumber: 'Final', description: 'Retainage Release', dueDate: '2024-12-30', grossAmount: '0', retainage: '-22500', netAmount: '22500', status: 'pending' }
  ])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      // Reset editing state when canceling
      setPayments(payments.map(p => ({ ...p, isEditing: false })))
    }
  }

  const handlePaymentEdit = (id: number, field: keyof PaymentItem, value: string) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, [field]: value } : payment
    ))
  }

  const handleSavePayment = (id: number) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, isEditing: false } : payment
    ))
  }

  const handleEditPayment = (id: number) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, isEditing: true } : payment
    ))
  }

  const handleCancelEdit = (id: number) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, isEditing: false } : payment
    ))
  }

  const handleAddPayment = () => {
    const newPayment: PaymentItem = {
      id: Math.max(...payments.map(p => p.id)) + 1,
      paymentNumber: String(payments.length),
      description: 'New Payment',
      dueDate: '2024-07-15',
      grossAmount: '0',
      retainage: '0',
      netAmount: '0',
      status: 'pending',
      isEditing: true
    }
    setPayments([...payments, newPayment])
  }

  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter(p => p.id !== id))
  }

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount) || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  const calculateTotals = () => {
    const grossTotal = payments.reduce((sum, p) => sum + (parseFloat(p.grossAmount) || 0), 0)
    const retainageTotal = payments.reduce((sum, p) => sum + (parseFloat(p.retainage) || 0), 0)
    const netTotal = payments.reduce((sum, p) => sum + (parseFloat(p.netAmount) || 0), 0)
    const paidCount = payments.filter(p => p.status === 'paid').length
    
    return { grossTotal, retainageTotal, netTotal, paidCount }
  }

  const totals = calculateTotals()
  return (
    <div className="flex-1 bg-concrete p-6">
      <div className="max-w-7xl mx-auto">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Summary Strip */}
        <div className="flex gap-2.5 px-5 py-3.5 bg-white border-b border-neutral-200">
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Contract Value
              </div>
              <div className="text-lg font-bold text-slate font-mono tracking-tight">
                {formatCurrency(String(totals.grossTotal))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Total Retainage
              </div>
              <div className="text-lg font-bold text-warning font-mono tracking-tight">
                {formatCurrency(String(Math.abs(totals.retainageTotal)))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Net Payments
              </div>
              <div className="text-lg font-bold text-success font-mono tracking-tight">
                {formatCurrency(String(totals.netTotal))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Progress
              </div>
              <div className="text-lg font-bold text-slate font-mono tracking-tight">
                {Math.round((totals.paidCount / payments.length) * 100)}%
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                {totals.paidCount} of {payments.length} payments
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="px-5 py-2.5 bg-white border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em] min-w-[90px]">
              Overall Progress
            </span>
            <div className="flex-1 h-2 bg-concrete rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-navy to-steel rounded transition-all duration-600" style={{ width: `${Math.round((totals.paidCount / payments.length) * 100)}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-slate min-w-[36px] text-right">
              {Math.round((totals.paidCount / payments.length) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-1.5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em] min-w-[90px]">
              Retainage
            </span>
            <div className="flex-1 h-2 bg-concrete rounded overflow-hidden">
              <div className="h-full bg-success rounded transition-all duration-600" style={{ width: `${Math.round((totals.paidCount / payments.length) * 100)}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-slate min-w-[36px] text-right">
              {Math.round((totals.paidCount / payments.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-neutral-300"
              onClick={handleEditToggle}
            >
              {isEditing ? (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Cancel Editing
                </>
              ) : (
                <>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit Schedule
                </>
              )}
            </Button>
            {isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-neutral-300"
                onClick={handleAddPayment}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Payment
              </Button>
            )}
            <Button variant="outline" size="sm" className="border-neutral-300">
              <Download className="w-3 h-3 mr-1" />
              Export PDF
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-neutral-300 rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`border-0 rounded-none ${viewMode === 'grid' ? 'bg-concrete' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`border-0 rounded-none ${viewMode === 'list' ? 'bg-concrete' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Schedule Content */}
        <div className="flex-1 overflow-auto bg-white">
          {viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-concrete border-b border-neutral-200">
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em]">Payment #</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em]">Description</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em]">Due Date</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em] text-right">Gross Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em] text-right">Retainage</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em] text-right">Net Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em]">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.04em] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className={`border-b border-neutral-100 ${payment.isEditing ? 'bg-blue-50' : ''}`}>
                    <TableCell className="font-medium text-sm">
                      {payment.isEditing ? (
                        <Input 
                          value={payment.paymentNumber} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'paymentNumber', e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        payment.paymentNumber
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.isEditing ? (
                        <Input 
                          value={payment.description} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'description', e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        payment.description
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.isEditing ? (
                        <Input 
                          type="date"
                          value={payment.dueDate} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'dueDate', e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        payment.dueDate
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.isEditing ? (
                        <Input 
                          type="number"
                          value={payment.grossAmount} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'grossAmount', e.target.value)}
                          className="h-8 text-sm text-right font-mono"
                        />
                      ) : (
                        <span className="font-mono text-sm font-semibold">{formatCurrency(payment.grossAmount)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.isEditing ? (
                        <Input 
                          type="number"
                          value={payment.retainage} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'retainage', e.target.value)}
                          className="h-8 text-sm text-right font-mono text-warning"
                        />
                      ) : (
                        <span className="font-mono text-sm text-warning font-semibold">{formatCurrency(payment.retainage)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.isEditing ? (
                        <Input 
                          type="number"
                          value={payment.netAmount} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'netAmount', e.target.value)}
                          className="h-8 text-sm text-right font-mono text-success"
                        />
                      ) : (
                        <span className="font-mono text-sm text-success font-semibold">{formatCurrency(payment.netAmount)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.isEditing ? (
                        <select 
                          value={payment.status}
                          onChange={(e) => handlePaymentEdit(payment.id, 'status', e.target.value as 'paid' | 'pending')}
                          className="h-8 text-xs border rounded px-2"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                        </select>
                      ) : (
                        <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'} className={payment.status === 'paid' ? 'bg-success text-white text-xs' : 'text-xs'}>
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {payment.isEditing ? (
                          <>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleSavePayment(payment.id)}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCancelEdit(payment.id)}>
                              <X className="w-3 h-3" />
                            </Button>
                            {isEditing && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDeletePayment(payment.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            {isEditing && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditPayment(payment.id)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            // Grid View
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments.map((payment) => (
                <Card key={payment.id} className={`${payment.isEditing ? 'border-blue-300 bg-blue-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {payment.isEditing ? (
                          <Input 
                            value={payment.paymentNumber} 
                            onChange={(e) => handlePaymentEdit(payment.id, 'paymentNumber', e.target.value)}
                            className="h-8 text-sm font-medium"
                          />
                        ) : (
                          `Payment ${payment.paymentNumber}`
                        )}
                      </CardTitle>
                      <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'} className={payment.status === 'paid' ? 'bg-success text-white text-xs' : 'text-xs'}>
                        {payment.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-500">Description</label>
                      {payment.isEditing ? (
                        <Input 
                          value={payment.description} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'description', e.target.value)}
                          className="h-8 text-sm mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium">{payment.description}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Due Date</label>
                      {payment.isEditing ? (
                        <Input 
                          type="date"
                          value={payment.dueDate} 
                          onChange={(e) => handlePaymentEdit(payment.id, 'dueDate', e.target.value)}
                          className="h-8 text-sm mt-1"
                        />
                      ) : (
                        <p className="text-sm">{payment.dueDate}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-neutral-500">Gross</label>
                        {payment.isEditing ? (
                          <Input 
                            type="number"
                            value={payment.grossAmount} 
                            onChange={(e) => handlePaymentEdit(payment.id, 'grossAmount', e.target.value)}
                            className="h-8 text-sm mt-1 font-mono text-right"
                          />
                        ) : (
                          <p className="text-sm font-mono font-semibold">{formatCurrency(payment.grossAmount)}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500">Retainage</label>
                        {payment.isEditing ? (
                          <Input 
                            type="number"
                            value={payment.retainage} 
                            onChange={(e) => handlePaymentEdit(payment.id, 'retainage', e.target.value)}
                            className="h-8 text-sm mt-1 font-mono text-right text-warning"
                          />
                        ) : (
                          <p className="text-sm font-mono text-warning font-semibold">{formatCurrency(payment.retainage)}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500">Net</label>
                        {payment.isEditing ? (
                          <Input 
                            type="number"
                            value={payment.netAmount} 
                            onChange={(e) => handlePaymentEdit(payment.id, 'netAmount', e.target.value)}
                            className="h-8 text-sm mt-1 font-mono text-right text-success"
                          />
                        ) : (
                          <p className="text-sm font-mono text-success font-semibold">{formatCurrency(payment.netAmount)}</p>
                        )}
                      </div>
                    </div>
                    {payment.isEditing ? (
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" onClick={() => handleSavePayment(payment.id)}>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancelEdit(payment.id)}>
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeletePayment(payment.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-2">
                        {isEditing && (
                          <Button variant="outline" size="sm" onClick={() => handleEditPayment(payment.id)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
