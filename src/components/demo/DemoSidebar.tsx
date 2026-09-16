'use client'

// Deliberately a copy of components/layout/sidebar.tsx rather than a shared
// component with a basePath prop: the demo tree is meant to be editable
// without any risk of changing the real app.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  FileText,
  Shield,
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Users,
  Settings,
  Plus,
  Receipt,
} from 'lucide-react'
import { DEMO_ACCOUNT } from '@/lib/demo/data'

const navigation = [
  { name: 'Dashboard', href: '/demo/dashboard', icon: Home, section: 'main' },
  { name: 'Projects', href: '/demo/projects', icon: FileText, section: 'main' },
  { name: 'Pay Applications', href: '/demo/pay-applications', icon: Receipt, section: 'main' },
  { name: 'Compliance', href: '/demo/compliance', icon: Shield, section: 'main' },
  { name: 'Analytics', href: '/demo/analytics', icon: BarChart3, section: 'analytics' },
  { name: 'Reports', href: '/demo/reports', icon: TrendingUp, section: 'analytics' },
  { name: 'Financial', href: '/demo/financial', icon: DollarSign, section: 'analytics' },
  { name: 'Exports', href: '/demo/exports', icon: Download, section: 'account' },
  { name: 'Team', href: '/demo/team', icon: Users, section: 'account' },
  { name: 'Settings', href: '/demo/settings', icon: Settings, section: 'account' },
]

const SECTION_LABELS: Record<string, string> = {
  main: 'Main',
  analytics: 'Analytics',
  account: 'Account',
}

export function DemoSidebar() {
  const pathname = usePathname()

  const grouped = navigation.reduce((acc, item) => {
    ;(acc[item.section] ||= []).push(item)
    return acc
  }, {} as Record<string, typeof navigation>)

  const initials = DEMO_ACCOUNT.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="w-[215px] min-w-[215px] bg-[#1e3a4f] flex flex-col fixed top-0 left-0 h-screen z-100">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/demo/dashboard" className="block">
          <span className="text-xl font-bold text-white tracking-tight">
            <span className="text-[#60b4f5]">Pay</span>Simple
          </span>
        </Link>
      </div>

      {/* Primary action */}
      <div className="mx-3.5 mt-1">
        <Link
          href="/demo/projects"
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-[#3b82f6] text-white text-sm font-semibold hover:bg-[#2563eb] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-5 px-3">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="mb-5">
            <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/35">
              {SECTION_LABELS[section] ?? section}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                        active
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-white/65 hover:text-white hover:bg-white/5',
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {DEMO_ACCOUNT.name}
            </div>
            <div className="text-[11px] text-white/45 truncate">{DEMO_ACCOUNT.company}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
