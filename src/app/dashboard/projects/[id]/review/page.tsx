'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Check, AlertCircle } from 'lucide-react'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'extraction', name: 'Extraction', href: '/projects/123/extraction' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function ReviewPage() {
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
            Save Draft
          </Button>
          <Button size="sm" className="bg-steel hover:bg-steel/90">
            Continue to Schedule
          </Button>
        </div>
      </div>

      {/* Step Bar */}
      <StepBar steps={steps} currentStep="review" />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Contract Viewer */}
        <div className="flex-1 border-r border-neutral-200 bg-white">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-sm font-semibold text-slate">Contract Document</h2>
            <p className="text-xs text-neutral-500">AIA A201-2017 - Office Building Construction</p>
          </div>
          <div className="p-4">
            <div className="bg-neutral-50 rounded-lg p-8 h-96 flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm">Contract viewer will be displayed here</p>
                <p className="text-xs mt-1">PDF preview with highlighted extracted terms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Extracted Terms */}
        <div className="w-96 bg-white">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate">Extracted Terms</h2>
                <p className="text-xs text-neutral-500">12 terms identified with 94% confidence</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
          
          <div className="p-4 space-y-4 overflow-y-auto max-h-96">
            {/* Contract Basics */}
            <Card className="border border-neutral-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-navy flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy/10 rounded flex items-center justify-center text-xs font-bold text-navy">
                    1
                  </div>
                  Contract Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Contract Sum</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate">$450,000</span>
                    <Badge variant="outline" className="text-xs border-success text-success">
                      High Confidence
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Project Duration</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate">12 months</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Start Date</span>
                  <span className="font-mono text-sm font-bold text-slate">Jan 15, 2024</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="border border-neutral-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-navy flex items-center gap-2">
                  <div className="w-6 h-6 bg-steel/10 rounded flex items-center justify-center text-xs font-bold text-steel">
                    2
                  </div>
                  Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Payment Schedule</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate">Monthly</span>
                    <Badge variant="outline" className="text-xs border-success text-success">
                      High Confidence
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Net Payment Terms</span>
                  <span className="font-mono text-sm font-bold text-slate">30 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Payment Application Due</span>
                  <span className="font-mono text-sm font-bold text-slate">15th of month</span>
                </div>
              </CardContent>
            </Card>

            {/* Retainage */}
            <Card className="border border-neutral-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-navy flex items-center gap-2">
                  <div className="w-6 h-6 bg-warning/10 rounded flex items-center justify-center text-xs font-bold text-warning">
                    3
                  </div>
                  Retainage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Retainage Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate">5%</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Release Point</span>
                  <span className="font-mono text-sm font-bold text-slate">Substantial Completion</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-600">Final Release</span>
                  <span className="font-mono text-sm font-bold text-slate">30 days after completion</span>
                </div>
              </CardContent>
            </Card>

            {/* Items Needing Review */}
            <Card className="border border-warning/50 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  Items Needing Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded border border-warning/30">
                  <div>
                    <p className="text-xs font-medium text-slate">Change Order Terms</p>
                    <p className="text-xs text-neutral-500">Low confidence extraction</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs border-warning text-warning">
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
