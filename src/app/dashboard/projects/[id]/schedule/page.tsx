'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Eye, Download, Edit, Grid, List } from 'lucide-react'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'extraction', name: 'Extraction', href: '/projects/123/extraction' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-concrete">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-navy border-b-2 border-steel/30">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-base text-white tracking-tight">
            Pay<span className="text-steel">Simple</span>
          </div>
          <div className="text-xs text-white/50">
            Projects / <span className="text-white/85 font-medium">Office Building Construction</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-white/75 border-white/20 hover:bg-white/10">
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button variant="ghost" size="sm" className="text-white/75 border-white/20 hover:bg-white/10">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button size="sm" className="bg-steel hover:bg-steel/90">
            Continue to Compliance
          </Button>
        </div>
      </div>

      {/* Step Bar */}
      <StepBar steps={steps} currentStep="schedule" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Summary Strip */}
        <div className="flex gap-2.5 px-5 py-3.5 bg-white border-b border-neutral-200">
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Contract Value
              </div>
              <div className="text-lg font-bold text-slate font-mono tracking-tight">
                $450,000
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Total Retainage
              </div>
              <div className="text-lg font-bold text-warning font-mono tracking-tight">
                $22,500
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Net Payments
              </div>
              <div className="text-lg font-bold text-success font-mono tracking-tight">
                $427,500
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 bg-concrete border-0">
            <CardContent className="p-3.5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
                Progress
              </div>
              <div className="text-lg font-bold text-slate font-mono tracking-tight">
                25%
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                3 of 12 payments
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
              <div className="h-full bg-gradient-to-r from-navy to-steel rounded transition-all duration-600" style={{ width: '25%' }}></div>
            </div>
            <span className="text-xs font-semibold text-slate min-w-[36px] text-right">
              25%
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-1.5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em] min-w-[90px]">
              Retainage
            </span>
            <div className="flex-1 h-2 bg-concrete rounded overflow-hidden">
              <div className="h-full bg-success rounded transition-all duration-600" style={{ width: '25%' }}></div>
            </div>
            <span className="text-xs font-semibold text-slate min-w-[36px] text-right">
              25%
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-neutral-300">
              <Edit className="w-3 h-3 mr-1" />
              Edit Schedule
            </Button>
            <Button variant="outline" size="sm" className="border-neutral-300">
              <Download className="w-3 h-3 mr-1" />
              Export PDF
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-neutral-300 rounded-md overflow-hidden">
              <Button variant="ghost" size="sm" className="border-0 rounded-none">
                <Grid className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="border-0 rounded-none bg-concrete">
                <List className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Schedule Table */}
        <div className="flex-1 overflow-auto bg-white">
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
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableRow key={i} className="border-b border-neutral-100">
                  <TableCell className="font-medium text-sm">{i}</TableCell>
                  <TableCell className="text-sm">Monthly Progress Payment</TableCell>
                  <TableCell className="text-sm">2024-0{i < 10 ? '0' : ''}{i + 1}-15</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">$37,500</TableCell>
                  <TableCell className="text-right font-mono text-sm text-warning font-semibold">$1,875</TableCell>
                  <TableCell className="text-right font-mono text-sm text-success font-semibold">$35,625</TableCell>
                  <TableCell>
                    {i <= 3 ? (
                      <Badge variant="default" className="bg-success text-white text-xs">
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Retainage Release Row */}
              <TableRow className="bg-warning/5 border-b border-neutral-100">
                <TableCell className="font-medium text-sm">Final</TableCell>
                <TableCell className="text-sm font-medium">Retainage Release</TableCell>
                <TableCell className="text-sm">2024-12-30</TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">-</TableCell>
                <TableCell className="text-right font-mono text-sm text-warning font-semibold">-$22,500</TableCell>
                <TableCell className="text-right font-mono text-sm text-success font-semibold">$22,500</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="w-3 h-3" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
