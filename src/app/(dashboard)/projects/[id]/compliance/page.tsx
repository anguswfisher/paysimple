'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate">Compliance Check</h1>
        <p className="text-slate/70">Review compliance flags and requirements for your payment schedule</p>
      </div>

      <StepBar steps={steps} currentStep="compliance" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-success" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-success">94%</div>
              <Progress value={94} className="mt-4" />
              <p className="text-sm text-slate/70 mt-2">Excellent compliance rating</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compliance Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Missing Lien Waiver Clause</h3>
                <p className="text-sm text-slate/70 mt-1">
                  Contract does not specify requirements for conditional and unconditional lien waivers
                </p>
                <Badge variant="secondary" className="mt-2">Medium Priority</Badge>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <XCircle className="h-5 w-5 text-danger mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Retainage Rate Above 5%</h3>
                <p className="text-sm text-slate/70 mt-1">
                  Current retainage rate of 5% exceeds recommended industry standard
                </p>
                <Badge variant="destructive" className="mt-2">High Priority</Badge>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Payment Schedule Compliant</h3>
                <p className="text-sm text-slate/70 mt-1">
                  Monthly payment schedule aligns with project milestones
                </p>
                <Badge className="bg-success text-white mt-2">Resolved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { item: 'AIA G701/G702 forms referenced', completed: true },
              { item: 'Payment terms clearly defined', completed: true },
              { item: 'Retainage terms specified', completed: true },
              { item: 'Change order process defined', completed: true },
              { item: 'Lien waiver requirements included', completed: false },
              { item: 'Insurance requirements specified', completed: true },
              { item: 'Dispute resolution process', completed: true },
              { item: 'Termination clauses included', completed: false },
            ].map((checklist, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  checklist.completed ? 'bg-success border-success' : 'border-gray-300'
                }`}>
                  {checklist.completed && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className={`${checklist.completed ? 'text-slate' : 'text-slate/70'}`}>
                  {checklist.item}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
