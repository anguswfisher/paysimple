'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Download,
  Settings,
  Users,
  Plus
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard', icon: FileText },
  { name: 'Compliance', href: '/dashboard/compliance', icon: AlertTriangle },
  { name: 'Exports', href: '/dashboard/exports', icon: Download },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-navy">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">Pay<span className="text-steel">Simple</span></h1>
        </div>
        
        {/* Quick Actions */}
        <div className="px-4 mt-6">
          <Link href="/dashboard/create">
            <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-steel rounded-md hover:bg-steel/90 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-navy/50 text-white border-l-3 border-steel'
                    : 'text-white/70 hover:bg-navy/30 hover:text-white',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-steel' : 'text-white/70 group-hover:text-steel',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* User Section */}
        <div className="px-4 mt-auto pt-4 border-t border-navy/30">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-steel/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-steel">{getUserInitials(user)}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{getUserName(user)}</p>
              <p className="text-xs text-white/60">Educational Demo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
