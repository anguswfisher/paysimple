'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DEMO_PROJECTS, DEMO_PAY_APPS, DEMO_PORTFOLIO } from '@/lib/demo/data'
import {
  FileText,
  Plus,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'

const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

// Portfolio figures run to nine digits; compact notation keeps them readable
// in a four-across stat row instead of truncating mid-number.
const compactMoney = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)

const STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  uploaded: { label: 'Uploaded', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'Processing', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  reviewed: { label: 'In Review', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  complete: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200' },
}

export default function DemoProjectsPage() {
  const payAppCount = (projectName: string) =>
    DEMO_PAY_APPS.filter((a) => a.basics.projectName === projectName).length

  const stats = [
    {
      label: 'Total Projects',
      value: String(DEMO_PROJECTS.length),
      icon: FileText,
      tile: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Value',
      value: compactMoney(DEMO_PORTFOLIO.totalContractValue),
      icon: DollarSign,
      tile: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Billed to Date',
      value: compactMoney(DEMO_PORTFOLIO.billedToDate),
      icon: TrendingUp,
      tile: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      label: 'Compliance Flags',
      value: String(DEMO_PORTFOLIO.openRiskFlags),
      icon: AlertTriangle,
      tile: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ]

  return (
    <div className="flex-1 min-w-0 p-6">
      <div className="max-w-[1400px] min-w-0 mx-auto space-y-6">

        {/* Action row — the title lives in the topbar */}
        <div className="flex items-center justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.tile} rounded-lg flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate/60">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects */}
        <div className="space-y-4">
          {DEMO_PROJECTS.map((project) => {
            const status = STATUS[project.status] ?? STATUS.draft
            const contractValue = Number(project.contract_value ?? 0)
            const schedules = payAppCount(project.name)

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="flex-1 min-w-[18rem]">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate">{project.name}</h3>
                        <Badge className={status.className}>{status.label}</Badge>
                        {project.riskFlagCount > 0 && (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {project.riskFlagCount} flag{project.riskFlagCount === 1 ? '' : 's'}
                          </Badge>
                        )}
                      </div>

                      <p className="text-slate/60 mb-4">{project.description}</p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate/60">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" />
                          {money(contractValue)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {project.start_date
                            ? new Date(project.start_date).toLocaleDateString()
                            : '—'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          {schedules} pay application{schedules === 1 ? '' : 's'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          {money(project.billedToDate)} billed
                        </div>
                      </div>
                    </div>

                    {/* Progress + actions */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="w-36">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-medium uppercase tracking-wider text-slate/50">
                            Complete
                          </span>
                          <span className="text-xs font-semibold text-slate tabular-nums">
                            {project.percentComplete}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate/10 overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${project.percentComplete}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate/45 mt-1.5">
                          {money(project.retainageHeld)} retainage held
                        </div>
                      </div>

                      <Link href={`/demo/projects/${project.id}/upload`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {DEMO_PROJECTS.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate mb-2">No projects yet</h3>
                <p className="text-slate/60 mb-6">
                  Get started by creating your first construction project
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
