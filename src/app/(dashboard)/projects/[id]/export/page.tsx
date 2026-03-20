'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Share2, Mail, Link } from 'lucide-react'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate">Export & Share</h1>
        <p className="text-slate/70">Export your payment schedule and share with stakeholders</p>
      </div>

      <StepBar steps={steps} currentStep="export" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Export Formats
            </CardTitle>
            <CardDescription>
              Download your payment schedule in various formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-navy hover:bg-navy/90">
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
              <Badge variant="secondary" className="ml-auto">Recommended</Badge>
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Export Calendar (ICS)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="mr-2 h-5 w-5" />
              Share Options
            </CardTitle>
            <CardDescription>
              Share your payment schedule with team members and stakeholders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Share Link</h3>
                  <p className="text-sm text-slate/70">View-only access to payment schedule</p>
                </div>
                <Link className="h-5 w-5 text-slate/50" />
              </div>
              <div className="mt-3 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Copy Link
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Report</h3>
                  <p className="text-sm text-slate/70">Send PDF report via email</p>
                </div>
                <Mail className="h-5 w-5 text-slate/50" />
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Recent exports and shares from this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'PDF', date: '2024-01-15', user: 'John Doe', action: 'Downloaded' },
              { type: 'CSV', date: '2024-01-14', user: 'Jane Smith', action: 'Shared via link' },
              { type: 'PDF', date: '2024-01-13', user: 'John Doe', action: 'Emailed to stakeholder' },
            ].map((export_item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-slate/50" />
                  <div>
                    <p className="font-medium">{export_item.type} Export</p>
                    <p className="text-sm text-slate/70">
                      {export_item.action} by {export_item.user}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate/70">{export_item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
