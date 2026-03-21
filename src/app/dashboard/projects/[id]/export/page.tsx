'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Share2, Mail, Link, Check, Calendar, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'extraction', name: 'Extraction', href: '/projects/123/extraction' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function ExportPage() {
  const [selectedExports, setSelectedExports] = useState<string[]>(['pdf'])
  const [shareLink, setShareLink] = useState('https://paysimple.app/share/abc123xyz')
  const [emailRecipients, setEmailRecipients] = useState('')
  const [sharePermissions, setSharePermissions] = useState('view')

  const exportOptions = [
    {
      id: 'pdf',
      icon: FileText,
      title: 'PDF Report',
      description: 'Complete payment schedule with compliance report',
      iconBg: 'bg-navy/10',
      iconColor: 'text-navy',
      badge: 'POPULAR',
      badgeColor: 'bg-steel/10 text-steel'
    },
    {
      id: 'excel',
      icon: FileSpreadsheet,
      title: 'Excel Workbook',
      description: 'Detailed payment schedule with calculations',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      badge: 'NEW',
      badgeColor: 'bg-success/10 text-success'
    },
    {
      id: 'csv',
      icon: FileText,
      title: 'CSV Data',
      description: 'Raw payment data for import into other systems',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    {
      id: 'calendar',
      icon: Calendar,
      title: 'Calendar File',
      description: 'Payment due dates in ICS format',
      iconBg: 'bg-gold/10',
      iconColor: 'text-gold'
    }
  ]

  const toggleExport = (id: string) => {
    setSelectedExports(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

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
            <Download className="w-3 h-3 mr-1" />
            Download All
          </Button>
          <Button size="sm" className="bg-steel hover:bg-steel/90">
            Complete Project
          </Button>
        </div>
      </div>

      {/* Step Bar */}
      <StepBar steps={steps} currentStep="export" />

      {/* Main Content */}
      <div className="flex-1 p-6 flex gap-5">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-3.5">
          <div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-[0.06em] mb-0.5">
              Export Formats
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {exportOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`border border-neutral-200 p-4 cursor-pointer transition-all hover:border-steel hover:-translate-y-0.5 ${
                    selectedExports.includes(option.id) ? 'border-2 border-steel bg-steel/5' : ''
                  }`}
                  onClick={() => toggleExport(option.id)}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className={`w-9 h-9 ${option.iconBg} rounded-lg flex items-center justify-center`}>
                      <option.icon className={`w-4 h-4 ${option.iconColor}`} />
                    </div>
                    {option.badge && (
                      <Badge className={`text-xs ${option.badgeColor}`}>
                        {option.badge}
                      </Badge>
                    )}
                    {selectedExports.includes(option.id) && (
                      <div className="w-5 h-5 bg-steel text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate mb-0.5">{option.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{option.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-white border border-neutral-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-slate">Share Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate mb-2.5">Share Link</h3>
                <div className="flex gap-2 mb-2.5">
                  <input 
                    type="text" 
                    value={shareLink}
                    readOnly
                    className="flex-1 h-8.5 rounded border border-neutral-300 px-2.5 text-xs text-slate bg-concrete"
                  />
                  <Button size="sm" className="h-8.5 px-3.5 rounded border-none bg-navy text-white text-xs font-semibold">
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Anyone with this link can view the payment schedule. You can revoke access at any time.
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs px-2.5 py-1 border border-neutral-300 bg-white text-neutral-600 hover:bg-concrete hover:border-neutral-400 ${
                      sharePermissions === 'view' ? 'bg-concrete border-neutral-400 text-slate' : ''
                    }`}
                    onClick={() => setSharePermissions('view')}
                  >
                    View Only
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs px-2.5 py-1 border border-neutral-300 bg-white text-neutral-600 hover:bg-concrete hover:border-neutral-400 ${
                      sharePermissions === 'edit' ? 'bg-concrete border-neutral-400 text-slate' : ''
                    }`}
                    onClick={() => setSharePermissions('edit')}
                  >
                    Can Edit
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate mb-2.5">Email Report</h3>
                <div className="flex gap-2 mb-2.5">
                  <input 
                    type="email" 
                    placeholder="Enter email addresses"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    className="flex-1 h-8.5 rounded border border-neutral-300 px-2.5 text-xs text-slate bg-concrete"
                  />
                  <Button size="sm" className="h-8.5 px-3.5 rounded border-none bg-navy text-white text-xs font-semibold">
                    Send
                  </Button>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Send payment schedule PDF to stakeholders. Multiple emails separated by commas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-neutral-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-slate">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate">Email Notifications</h3>
                  <p className="text-xs text-neutral-500">Get notified when schedule is viewed</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs border-neutral-300">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="w-80 space-y-3.5">
          <Card className="bg-white border border-neutral-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-slate">Export History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: 'PDF', date: '2 hours ago', user: 'John Doe', action: 'Downloaded by', icon: FileText },
                { type: 'Excel', date: '1 day ago', user: 'Jane Smith', action: 'Shared via link', icon: FileSpreadsheet },
                { type: 'PDF', date: '2 days ago', user: 'John Doe', action: 'Emailed to', icon: FileText },
                { type: 'CSV', date: '3 days ago', user: 'Mike Johnson', action: 'Downloaded by', icon: FileText },
                { type: 'Calendar', date: '1 week ago', user: 'Sarah Wilson', action: 'Exported by', icon: Calendar },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-concrete rounded">
                  <item.icon className="w-4 h-4 text-slate" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate truncate">{item.action} {item.user}</p>
                    <p className="text-xs text-neutral-500">{item.type} • {item.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border border-neutral-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-slate">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs border-neutral-300">
                <Download className="w-3 h-3 mr-2" />
                Download All Formats
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs border-neutral-300">
                <Share2 className="w-3 h-3 mr-2" />
                Create Share Link
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs border-neutral-300">
                <Mail className="w-3 h-3 mr-2" />
                Email Stakeholders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
