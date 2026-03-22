'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle, FileText, Search, Filter, ChevronDown, AlertCircle, Info, Download, RefreshCw } from 'lucide-react'
import { ComplianceMetrics } from '@/types/compliance'
import { ComplianceFlag } from '@/types/project'
import { supabase } from '@/lib/supabase/client'

export default function CompliancePage() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [flags, setFlags] = useState<ComplianceFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')

  const fetchComplianceData = async () => {
    setLoading(true)
    try {
      // Get user ID from auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch metrics
      const metricsResponse = await fetch(`/api/compliance/metrics?user_id=${user.id}`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      // Fetch flags
      const flagsResponse = await fetch('/api/compliance/flags')
      if (flagsResponse.ok) {
        const flagsData = await flagsResponse.json()
        setFlags(flagsData)
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveFlag = async (flagId: string) => {
    try {
      const response = await fetch(`/api/compliance/flags/${flagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resolved: true, 
          resolved_at: new Date().toISOString(),
          resolution_note: 'Resolved by user'
        })
      })

      if (response.ok) {
        setFlags(prev => prev.map(flag => 
          flag.id === flagId 
            ? { ...flag, is_resolved: true, resolved_at: new Date().toISOString() }
            : flag
        ))
        fetchComplianceData() // Refresh metrics
      }
    } catch (error) {
      console.error('Error resolving flag:', error)
    }
  }

  const analyzeContract = async (projectId: string) => {
    try {
      const response = await fetch('/api/compliance/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })

      if (response.ok) {
        fetchComplianceData() // Refresh data
      }
    } catch (error) {
      console.error('Error analyzing contract:', error)
    }
  }

  const exportComplianceReport = async (projectId: string) => {
    try {
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'compliance_pdf', 
          project_id: projectId 
        })
      })

      if (response.ok) {
        // Show success message or handle download
        console.log('Compliance report export started')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = flag.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'open' && !flag.is_resolved) ||
                         (statusFilter === 'resolved' && flag.is_resolved)
    const matchesSeverity = severityFilter === 'all' || flag.severity === severityFilter
    
    return matchesSearch && matchesStatus && matchesSeverity
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading compliance data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate/70 flex items-center gap-2">
                  Overall Score 
                  <Shield className="w-4 h-4" />
                </p>
                <p className="text-3xl font-bold text-slate mt-2">
                  {metrics?.overall_score || 0}%
                </p>
                <p className="text-sm text-success mt-1">
                  Across {metrics?.total_projects || 0} projects
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate/70 flex items-center gap-2">
                  Open Risks 
                  <AlertCircle className="w-4 h-4" />
                </p>
                <p className="text-3xl font-bold text-slate mt-2">
                  {metrics?.open_flags || 0}
                </p>
                <p className="text-sm text-danger mt-1">
                  {flags.filter(f => !f.is_resolved && f.severity === 'high').length} high priority
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate/70 flex items-center gap-2">
                  Resolved 
                  <CheckCircle className="w-4 h-4" />
                </p>
                <p className="text-3xl font-bold text-slate mt-2">
                  {metrics?.resolved_flags || 0}
                </p>
                <p className="text-sm text-success mt-1">
                  This month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate/70 flex items-center gap-2">
                  Contracts Reviewed 
                  <FileText className="w-4 h-4" />
                </p>
                <p className="text-3xl font-bold text-slate mt-2">
                  {metrics?.contracts_reviewed || 0}
                </p>
                <p className="text-sm text-slate/70 mt-1">
                  Total analyzed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Flags and Compliance by Project */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Risk Flags */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Risk Flags</CardTitle>
                <p className="text-sm text-slate/70 mt-1">Issues requiring attention</p>
              </div>
              <Badge variant="destructive" className="bg-danger/10 text-danger border-danger/20">
                <span className="w-2 h-2 bg-danger rounded-full mr-2"></span>
                {flags.filter(f => !f.is_resolved).length} Open
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {flags.filter(f => !f.is_resolved).slice(0, 3).map((flag) => (
              <div key={flag.id} className="flex items-start gap-3 p-3 rounded-lg border border-danger/20 bg-danger/5">
                <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-danger" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate">{flag.title}</h4>
                  <p className="text-sm text-slate/70 mt-1">{flag.description}</p>
                  <p className="text-xs text-slate/50 mt-2">
                    {flag.category} · {flag.severity} · Flagged {new Date(flag.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="destructive" 
                    className={`${
                      flag.severity === 'high' ? 'bg-danger/10 text-danger border-danger/20' :
                      flag.severity === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-blue-100 text-blue-600 border-blue-200'
                    }`}
                  >
                    {flag.severity}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveFlag(flag.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
            
            {flags.filter(f => !f.is_resolved).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="font-semibold text-slate">All Clear!</h3>
                <p className="text-sm text-slate/70 mt-1">No active compliance flags</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance by Project */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance by Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {metrics?.scores_by_project.map((project) => (
                <div key={project.project_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.project_name}</span>
                    <span className={`font-semibold ${
                      project.score >= 90 ? 'text-success' :
                      project.score >= 70 ? 'text-warning' : 'text-danger'
                    }`}>
                      {project.score}%
                    </span>
                  </div>
                  <Progress value={project.score} className="h-2" />
                </div>
              ))}
              
              {(!metrics?.scores_by_project || metrics.scores_by_project.length === 0) && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate/40 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate">No Projects Yet</h3>
                  <p className="text-sm text-slate/70 mt-1">Upload contracts to see compliance scores</p>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-slate">Clause Coverage</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Retainage Terms</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Prompt Payment</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Lien Waivers</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Stored Materials</span>
                    <span>62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compliance History</CardTitle>
              <p className="text-sm text-slate/70 mt-1">All resolved and active flags</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input 
                  placeholder="Search flags..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchComplianceData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Flag</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Contract</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Severity</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody>
                  {filteredFlags.map((flag) => (
                    <tr key={flag.id} className="border-b border-slate/5 hover:bg-slate/5">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{flag.title}</div>
                          {flag.description && (
                            <div className="text-sm text-slate/70 mt-1 line-clamp-2">{flag.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {flag.project_id || 'Unknown Project'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{flag.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="destructive" 
                          className={`${
                            flag.severity === 'high' ? 'bg-danger/10 text-danger border-danger/20' :
                            flag.severity === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-blue-100 text-blue-600 border-blue-200'
                          }`}
                        >
                          {flag.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={flag.is_resolved ? "secondary" : "destructive"}
                          className={`${
                            flag.is_resolved 
                              ? 'bg-success/10 text-success border-success/20' 
                              : 'bg-danger/10 text-danger border-danger/20'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            flag.is_resolved ? 'bg-success' : 'bg-danger'
                          }`}></span>
                          {flag.is_resolved ? 'Resolved' : 'Open'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(flag.created_at).toLocaleDateString()}
                          {flag.resolved_at && (
                            <div className="text-xs text-slate/50">
                              Resolved {new Date(flag.resolved_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {!flag.is_resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveFlag(flag.id)}
                            >
                              Resolve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportComplianceReport(flag.project_id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredFlags.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center">
                        <div className="text-slate/50">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                          <h3 className="font-semibold text-slate mb-2">No compliance flags found</h3>
                          <p className="text-sm">
                            {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Upload contracts to see compliance analysis'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
