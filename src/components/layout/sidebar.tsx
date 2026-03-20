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
  Users
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: FileText },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Compliance', href: '/dashboard/compliance', icon: AlertTriangle },
  { name: 'Exports', href: '/dashboard/exports', icon: Download },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-navy">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">PaySimple</h1>
        </div>
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
                    ? 'bg-navy/50 text-white border-r-3 border-steel'
                    : 'text-navy/70 hover:bg-navy/30 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-steel' : 'text-navy/70 group-hover:text-steel',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
