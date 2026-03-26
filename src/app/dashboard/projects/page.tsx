'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Calendar, DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string
  total_value: number
  status: 'active' | 'completed' | 'on_hold'
  created_at: string
  payment_schedules_count: number
  compliance_flags_count: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - replace with real API call
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Downtown Office Complex',
        description: 'Commercial office building construction project',
        total_value: 2500000,
        status: 'active',
        created_at: '2024-01-15',
        payment_schedules_count: 12,
        compliance_flags_count: 2
      },
      {
        id: '2', 
        name: 'Highway Bridge Construction',
        description: 'Infrastructure project for highway expansion',
        total_value: 1800000,
        status: 'active',
        created_at: '2024-02-20',
        payment_schedules_count: 8,
        compliance_flags_count: 0
      },
      {
        id: '3',
        name: 'Residential Development Phase 1',
        description: 'Multi-family housing construction',
        total_value: 3200000,
        status: 'completed',
        created_at: '2023-11-10',
        payment_schedules_count: 15,
        compliance_flags_count: 1
      }
    ]
    
    setTimeout(() => {
      setProjects(mockProjects)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate">Projects</h1>
          <p className="text-slate/60">Manage your construction projects and payment schedules</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate/60">Total Projects</p>
                <p className="text-2xl font-bold text-slate">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate/60">Total Value</p>
                <p className="text-2xl font-bold text-slate">
                  {formatCurrency(projects.reduce((sum, p) => sum + p.total_value, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate/60">Compliance Flags</p>
                <p className="text-2xl font-bold text-slate">
                  {projects.reduce((sum, p) => sum + p.compliance_flags_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-slate/60 mb-4">{project.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-slate/60">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(project.total_value)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {project.payment_schedules_count} schedules
                    </div>
                    {project.compliance_flags_count > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangle className="w-4 h-4" />
                        {project.compliance_flags_count} flags
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate mb-2">No projects yet</h3>
              <p className="text-slate/60 mb-6">Get started by creating your first construction project</p>
              <Link href="/dashboard/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
