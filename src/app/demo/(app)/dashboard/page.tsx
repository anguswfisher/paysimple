'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DEMO_PROJECTS, DEMO_PORTFOLIO, DEMO_RISK_FLAGS } from '@/lib/demo/data'
import {
  FileText,
  Calendar,
  AlertTriangle,
  DollarSign,
  Plus,
  ArrowRight,
} from 'lucide-react'

const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

export default function DemoDashboardPage() {
  const active = DEMO_PROJECTS.filter((p) => p.billedToDate > 0)
  const pending = DEMO_PROJECTS.filter(
    (p) => p.status === 'uploaded' || p.status === 'processing',
  ).length
  const openFlags = DEMO_RISK_FLAGS.filter((f) => f.status === 'open')

  const recent = [...active].sort((a, b) => b.billedToDate - a.billedToDate).slice(0, 5)

  const stats = [
    {
      title: 'Total Projects',
      icon: FileText,
      value: String(DEMO_PROJECTS.length),
      detail: `${active.length} with billing activity`,
    },
    {
      title: 'Active Schedules',
      icon: Calendar,
      value: String(active.length),
      detail: `${pending} pending review`,
    },
    {
      title: 'Compliance Score',
      icon: AlertTriangle,
      value: `${DEMO_PORTFOLIO.complianceScore}%`,
      detail: `${openFlags.length} open findings`,
    },
    {
      title: 'Total Contract Value',
      icon: DollarSign,
      value: `$${(DEMO_PORTFOLIO.totalContractValue / 1_000_000).toFixed(1)}M`,
      detail: `${money(DEMO_PORTFOLIO.billedToDate)} billed to date`,
    },
  ]

  return (
    <div className="flex-1 min-w-0 p-6">
      <div className="max-w-[1400px] min-w-0 mx-auto space-y-6">

        {/* Action row — the title lives in the topbar */}
        <div className="flex items-center justify-end">
          <Button className="bg-navy hover:bg-navy/90">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 min-w-0">
          {/* Recent projects */}
          <Card className="min-w-0">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>
                    Your most recently active payment schedules
                  </CardDescription>
                </div>
                <Link
                  href="/demo/projects"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 shrink-0"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate mb-2">No projects yet</h3>
                  <p className="text-sm text-slate/70 mb-4">Create your first project</p>
                  <Button className="bg-navy hover:bg-navy/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((project) => (
                    <div
                      key={project.id}
                      className="flex flex-wrap items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1 min-w-[12rem]">
                        <h3 className="font-semibold text-slate">{project.name}</h3>
                        <p className="text-sm text-slate/70">
                          {project.project_type} • {project.percentComplete}% complete
                        </p>
                        <div className="h-1.5 rounded-full bg-slate/10 overflow-hidden mt-2 max-w-[14rem]">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${project.percentComplete}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-semibold tabular-nums text-slate">
                          {money(Number(project.contract_value ?? 0))}
                        </p>
                        <p className="text-sm text-slate/70 tabular-nums">
                          {money(project.billedToDate)} billed
                        </p>
                      </div>

                      <Link href={`/demo/projects/${project.id}/upload`} className="shrink-0">
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

          {/* Needs attention */}
          <Card className="min-w-0">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Needs Attention</CardTitle>
                  <CardDescription>
                    {openFlags.length} open compliance findings
                  </CardDescription>
                </div>
                <Link
                  href="/demo/compliance"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 shrink-0"
                >
                  All
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {openFlags.slice(0, 5).map((flag) => (
                  <li key={flag.id} className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        flag.severity === 'high'
                          ? 'bg-red-500'
                          : flag.severity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate">{flag.title}</div>
                      <div className="text-xs text-slate/60 truncate">{flag.projectName}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
