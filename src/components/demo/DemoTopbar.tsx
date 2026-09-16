'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DEMO_ACCOUNT } from '@/lib/demo/data'

/** Title/subtitle for each demo section, keyed by path prefix. */
const PAGE_INFO: { match: (p: string) => boolean; title: string; subtitle: string }[] = [
  {
    match: (p) => p.startsWith('/demo/pay-applications/history'),
    title: 'Pay Application History',
    subtitle: 'Finalized and draft applications',
  },
  {
    match: (p) => /^\/demo\/pay-applications\/[^/]+\//.test(p),
    title: 'Pay Application',
    subtitle: 'Complete each step to submit for certification',
  },
  {
    match: (p) => p.startsWith('/demo/pay-applications'),
    title: 'Pay Applications',
    subtitle: 'Create, manage, and track your construction pay applications',
  },
  {
    match: (p) => p.startsWith('/demo/projects'),
    title: 'Projects',
    subtitle: 'Contracts, schedules, and payment status',
  },
  { match: (p) => p.startsWith('/demo/analytics'), title: 'Analytics', subtitle: 'Portfolio performance across all projects' },
  { match: (p) => p.startsWith('/demo/compliance'), title: 'Compliance', subtitle: 'Contract risk findings across the portfolio' },
  { match: (p) => p.startsWith('/demo/reports'), title: 'Reports', subtitle: 'Custom reports and scheduled deliveries' },
  { match: (p) => p.startsWith('/demo/financial'), title: 'Financial', subtitle: 'Payment history and financial metrics' },
  { match: (p) => p.startsWith('/demo/exports'), title: 'Exports', subtitle: 'Download reports and project data' },
  { match: (p) => p.startsWith('/demo/team'), title: 'Team', subtitle: 'Manage team members and permissions' },
  { match: (p) => p.startsWith('/demo/settings'), title: 'Settings', subtitle: 'Account and workspace preferences' },
]

export function DemoTopbar() {
  const pathname = usePathname() ?? ''
  const info =
    PAGE_INFO.find((entry) => entry.match(pathname)) ?? {
      title: 'Dashboard',
      subtitle: 'Project overview and recent activity',
    }

  const initials = DEMO_ACCOUNT.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="bg-[#1e3a4f] h-[60px] flex items-center justify-between px-7 fixed top-0 left-[215px] right-0 z-50">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-white truncate">{info.title}</h1>
        <p className="text-xs text-white/55 mt-0.5 truncate">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/"
          className="text-xs font-medium text-white/60 hover:text-white transition-colors rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          Leave demo
        </Link>
        <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-bold text-white">
          {initials}
        </div>
      </div>
    </header>
  )
}
