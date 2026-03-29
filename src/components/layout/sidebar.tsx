'use client'

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
  Receipt
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, section: 'main' },
  { name: 'Projects', href: '/dashboard/projects', icon: FileText, section: 'main' },
  { name: 'Pay Applications', href: '/pay-applications', icon: Receipt, section: 'main' },
  { name: 'Compliance', href: '/dashboard/compliance', icon: Shield, section: 'main' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, section: 'analytics' },
  { name: 'Reports', href: '/dashboard/reports', icon: TrendingUp, section: 'analytics' },
  { name: 'Financial', href: '/dashboard/financial', icon: DollarSign, section: 'analytics' },
  { name: 'Exports', href: '/dashboard/exports', icon: Download, section: 'account' },
  { name: 'Team', href: '/dashboard/team', icon: Users, section: 'account' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, section: 'account' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getUserInitials = (user: any) => {
    if (!user?.user_metadata?.name && !user?.email) return 'U'
    const name = user?.user_metadata?.name || user?.email || ''
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getUserName = (user: any) => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  }

  const groupedNavigation = navigation.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = []
    }
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, typeof navigation>)

  return (
    <aside className="w-[215px] min-w-[215px] bg-[#1e3a4f] flex flex-col fixed top-0 left-0 h-screen z-100">
      {/* Logo */}
      <div className="p-5 pb-3 border-b border-white/8">
        <h1 className="text-xl font-bold text-white tracking-tight">
          <span className="text-[#60b4f5]">Pay</span>Simple
        </h1>
      </div>
      
      {/* New Project Button */}
      <div className="mx-3.5 mt-3.5 mb-2">
        <Link href="/dashboard/create">
          <button className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-md hover:bg-[#1d4ed8] transition-colors">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Project
          </button>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-2">
        {Object.entries(groupedNavigation).map(([section, items]) => (
          <div key={section}>
            <div className="px-4 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </div>
            {items.map((item) => {
              const isActive = pathname === item.href || 
                             (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-white/65 hover:bg-[#2a4f6a] hover:text-white transition-all duration-150 cursor-pointer',
                    isActive && 'bg-[#2a4f6a] text-white border-l-3 border-[#3b82f6] pl-3.5'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-white/8 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">{getUserInitials(user)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{getUserName(user)}</p>
          <p className="text-xs text-white/45">Pro Plan</p>
        </div>
      </div>
    </aside>
  )
}
