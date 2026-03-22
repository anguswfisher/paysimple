'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Upload, FileText } from 'lucide-react'

const steps = [
  { id: 'upload', name: 'Upload', href: '/upload' },
  { id: 'review', name: 'Review', href: '/review' },
  { id: 'schedule', name: 'Schedule', href: '/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/compliance' },
  { id: 'export', name: 'Export', href: '/export' },
]

export default function ProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate">Office Building Project</h1>
          <p className="text-slate/70">AIA Payment Schedule - G701/G702</p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          View Contract
        </Button>
      </div>

      <StepBar steps={steps} currentStep="upload" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Contract Documents
            </CardTitle>
            <CardDescription>
              Upload your AIA contract documents to begin the payment scheduling process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-lg font-medium text-slate">Drop your files here</p>
                <p className="text-sm text-slate/70">or click to browse</p>
              </div>
              <Button className="mt-4 bg-navy hover:bg-navy/90">
                Select Files
              </Button>
              <p className="text-xs text-slate/50 mt-2">
                Supported formats: PDF, DOCX (Max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate/70">Contract Value</p>
              <p className="text-lg font-semibold">$450,000</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate/70">Project Duration</p>
              <p className="text-lg font-semibold">12 months</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate/70">Retainage Rate</p>
              <p className="text-lg font-semibold">5%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate/70">Status</p>
              <p className="text-lg font-semibold text-warning">Ready for Upload</p>
            </div>
            <Button className="w-full bg-navy hover:bg-navy/90">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
