'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate">Payment Schedule</h1>
        <p className="text-slate/70">View and manage your project payment schedule with retainage calculations</p>
      </div>

      <StepBar steps={steps} currentStep="schedule" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">$450,000</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Retainage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-warning">$22,500</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">$427,500</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Gross Amount</TableHead>
                <TableHead className="text-right">Retainage</TableHead>
                <TableHead className="text-right">Net Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{i}</TableCell>
                  <TableCell>Monthly Progress Payment</TableCell>
                  <TableCell>2024-0{i + 1}-15</TableCell>
                  <TableCell className="text-right font-mono">$37,500</TableCell>
                  <TableCell className="text-right font-mono text-warning">$1,875</TableCell>
                  <TableCell className="text-right font-mono text-success">$35,625</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Pending
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
