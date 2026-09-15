'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, XCircle, Shield, FileText, Calendar, Users } from 'lucide-react'

export default function CompliancePage() {
  return (
    <div className="flex-1 bg-concrete p-6">
      <div className="max-w-7xl mx-auto">
        {/* Score Strip */}
        <div className="flex gap-2.5 px-5 py-4 bg-white border-b border-neutral-200">
          <div className="flex items-center gap-4 flex-0-0-[220px] bg-concrete rounded-lg p-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#e8e8e8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#27AE60"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28 * 0.94} ${2 * Math.PI * 28}`}
                  className="transition-all duration-800"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold tracking-tight text-success">
                94%
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em]">
                Overall Score
              </div>
              <div className="text-sm font-bold text-slate">Excellent</div>
              <div className="text-xs text-neutral-400">2 issues found</div>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-4 gap-2">
            <Card className="bg-concrete border-0">
              <CardContent className="p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em]">
                    Contract Terms
                  </span>
                  <Badge className="text-xs bg-success/10 text-success">PASS</Badge>
                </div>
                <div className="h-1 bg-neutral-200 rounded mt-2 overflow-hidden">
                  <div className="h-full bg-success rounded" style={{ width: '100%' }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-concrete border-0">
              <CardContent className="p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em]">
                    Payment Rules
                  </span>
                  <Badge className="text-xs bg-warning/10 text-warning">WARN</Badge>
                </div>
                <div className="h-1 bg-neutral-200 rounded mt-2 overflow-hidden">
                  <div className="h-full bg-warning rounded" style={{ width: '75%' }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-concrete border-0">
              <CardContent className="p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em]">
                    Documentation
                  </span>
                  <Badge className="text-xs bg-success/10 text-success">PASS</Badge>
                </div>
                <div className="h-1 bg-neutral-200 rounded mt-2 overflow-hidden">
                  <div className="h-full bg-success rounded" style={{ width: '100%' }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-concrete border-0">
              <CardContent className="p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.04em]">
                    Legal
                  </span>
                  <Badge className="text-xs bg-danger/10 text-danger">FAIL</Badge>
                </div>
                <div className="h-1 bg-neutral-200 rounded mt-2 overflow-hidden">
                  <div className="h-full bg-danger rounded" style={{ width: '60%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Flags Column */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-200 bg-white">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-sm font-semibold text-slate">Compliance Flags</h2>
              <p className="text-xs text-neutral-500">2 issues requiring attention</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <Card className="border border-danger/50 bg-danger/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-danger/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-4 h-4 text-danger" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate">Missing Lien Waiver Requirements</h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        Contract does not specify requirements for conditional and unconditional lien waivers as required by state law.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className="text-xs bg-danger/10 text-danger">HIGH</Badge>
                        <span className="text-xs text-neutral-500">Section 9.4</span>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border border-danger/30">
                        <p className="text-xs text-slate mb-2">Recommended Action:</p>
                        <p className="text-xs text-neutral-600">Add lien waiver clause specifying both conditional and unconditional waiver requirements.</p>
                        <Button variant="outline" size="sm" className="text-xs border-danger text-danger mt-2">
                          Add Clause
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-warning/50 bg-warning/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate">Retainage Rate Above Recommended</h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        Current retainage rate of 5% exceeds recommended industry standard of 5% for commercial projects.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className="text-xs bg-warning/10 text-warning">MEDIUM</Badge>
                        <span className="text-xs text-neutral-500">Section 8.2</span>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border border-warning/30">
                        <p className="text-xs text-slate mb-2">Recommended Action:</p>
                        <p className="text-xs text-neutral-600">Consider reducing retainage to 5% or provide justification for higher rate.</p>
                        <Button variant="outline" size="sm" className="text-xs border-warning text-warning mt-2">
                          Review Terms
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-success/50 bg-success/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate">Payment Schedule Compliant</h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        Monthly payment schedule aligns with project milestones and industry standards.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className="text-xs bg-success/10 text-success">RESOLVED</Badge>
                        <span className="text-xs text-neutral-500">Section 7.1</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Checklist Column */}
          <div className="w-80 bg-white">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-sm font-semibold text-slate">Compliance Checklist</h2>
              <p className="text-xs text-neutral-500">8 of 10 items completed</p>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-2 bg-concrete rounded">
                <FileText className="w-4 h-4 text-slate" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate">Contract Documentation</p>
                  <p className="text-xs text-neutral-500">Contract forms referenced</p>
                </div>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>

              <div className="flex items-center gap-3 p-2 bg-concrete rounded">
                <Calendar className="w-4 h-4 text-slate" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate">Payment Schedule</p>
                  <p className="text-xs text-neutral-500">Monthly schedule defined</p>
                </div>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>

              <div className="flex items-center gap-3 p-2 bg-concrete rounded">
                <Users className="w-4 h-4 text-slate" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate">Party Information</p>
                  <p className="text-xs text-neutral-500">All parties identified</p>
                </div>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>

              <div className="flex items-center gap-3 p-2 bg-danger/10 rounded border border-danger/30">
                <Shield className="w-4 h-4 text-danger" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate">Lien Waivers</p>
                  <p className="text-xs text-neutral-500">Requirements missing</p>
                </div>
                <XCircle className="w-4 h-4 text-danger" />
              </div>

              <div className="flex items-center gap-3 p-2 bg-warning/10 rounded border border-warning/30">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate">Retainage Terms</p>
                  <p className="text-xs text-neutral-500">Rate above recommended</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>

              <div className="flex items-center gap-3 p-2 bg-concrete rounded">
                <FileText className="w-4 h-4 text-slate" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate">Insurance Requirements</p>
                  <p className="text-xs text-neutral-500">Coverage specified</p>
                </div>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
