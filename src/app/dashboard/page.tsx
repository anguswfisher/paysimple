'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUserProjects } from '@/lib/database/projects'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const userProjects = await getUserProjects()
        setProjects(userProjects)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'uploaded' || p.status === 'processing').length,
    pending: projects.filter(p => p.status === 'reviewed').length,
    totalValue: projects.reduce((sum, p) => sum + Number(p.contract_value || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate">Dashboard</h1>
          <p className="text-slate/70">Manage your construction payment schedules</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="bg-navy hover:bg-navy/90">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{stats.pending} pending review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% improvement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your most recently created payment schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
              <p className="text-sm text-slate/70 mt-2">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate mb-2">No projects yet</h3>
              <p className="text-sm text-slate/70 mb-4">Create your first project</p>
              <Link href="/dashboard/create">
                <Button className="bg-navy hover:bg-navy/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-slate/70">
                      {project.project_type || 'Construction Project'} • {project.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {project.contract_value ? `$${Number(project.contract_value).toLocaleString()}` : 'N/A'}
                    </p>
                    <p className="text-sm text-slate/70">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/projects/${project.id}/upload`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
