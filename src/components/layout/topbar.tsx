'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { useProject } from '@/components/providers/project-provider'
import { getProject } from '@/lib/database/projects'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProjectSubheader } from '@/components/layout/project-subheader'
import { User, LogOut, Settings } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { StepBar } from './step-bar'

const steps = [
  { id: 'upload', name: 'Upload', href: '/upload' },
  { id: 'extraction', name: 'Extraction', href: '/extraction' },
  { id: 'review', name: 'Review', href: '/review' },
  { id: 'schedule', name: 'Schedule', href: '/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/compliance' },
  { id: 'export', name: 'Export', href: '/export' },
]

export function Topbar() {
  const { user, signOut } = useSupabase()
  const project = useProject()
  const pathname = usePathname()
  const router = useRouter()
  const [resolvedProjectName, setResolvedProjectName] = useState<string | null>(null)
  
  const isProjectRoute = pathname?.includes('/projects/')

  const getProjectNameFromPath = () => {
    if (!pathname) return null

    const segments = pathname.split('/').filter(Boolean)
    const projectsIndex = segments.indexOf('projects')

    if (projectsIndex === -1 || projectsIndex + 1 >= segments.length) return null

    const projectSegment = decodeURIComponent(segments[projectsIndex + 1])

    return projectSegment
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  const getProjectIdFromPath = () => {
    if (!pathname) return null

    const segments = pathname.split('/').filter(Boolean)
    const projectsIndex = segments.indexOf('projects')

    if (projectsIndex === -1 || projectsIndex + 1 >= segments.length) return null

    return decodeURIComponent(segments[projectsIndex + 1])
  }

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

  const pathProjectId = getProjectIdFromPath()
  const pathProjectName = getProjectNameFromPath()

  const fallbackProjectName = useMemo(() => {
    if (!pathProjectName) return null
    return pathProjectId && isUuid(pathProjectId) ? null : pathProjectName
  }, [pathProjectId, pathProjectName])

  useEffect(() => {
    let cancelled = false

    const resolveProjectName = async () => {
      if (!isProjectRoute) {
        setResolvedProjectName(null)
        return
      }

      if (project?.name) {
        setResolvedProjectName(project.name)
        return
      }

      if (fallbackProjectName) {
        setResolvedProjectName(fallbackProjectName)
        return
      }

      if (!pathProjectId || !isUuid(pathProjectId)) {
        setResolvedProjectName(null)
        return
      }

      try {
        const fetchedProject = await getProject(pathProjectId)
        if (!cancelled) {
          setResolvedProjectName(fetchedProject.name)
        }
      } catch {
        if (!cancelled) {
          setResolvedProjectName(null)
        }
      }
    }

    resolveProjectName()

    return () => {
      cancelled = true
    }
  }, [fallbackProjectName, isProjectRoute, pathProjectId, project?.name])

  const projectName = resolvedProjectName || 'Project'
  
  const getCurrentStep = () => {
    if (pathname?.includes('/upload')) return 'upload'
    if (pathname?.includes('/extraction')) return 'extraction'
    if (pathname?.includes('/review')) return 'review'
    if (pathname?.includes('/schedule')) return 'schedule'
    if (pathname?.includes('/compliance')) return 'compliance'
    if (pathname?.includes('/export')) return 'export'
    return 'upload'
  }

  const getNextStep = () => {
    const current = getCurrentStep()
    const currentIndex = steps.findIndex(step => step.id === current)
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1]
    }
    return null
  }

  const handleContinue = () => {
    const nextStep = getNextStep()
    console.log('handleContinue called', { nextStep, pathProjectId, pathname })
    if (nextStep && pathProjectId) {
      const nextUrl = `/dashboard/projects/${pathProjectId}${nextStep.href}`
      console.log('Navigating to:', nextUrl)
      router.push(nextUrl)
    }
  }

  // Get page title and subtitle based on current path
  const getPageInfo = () => {
    // Checked before the rest: pay application routes live outside /dashboard,
    // so without this they fall through to the "Dashboard" default.
    if (pathname?.startsWith('/pay-applications')) {
      if (pathname.includes('/history')) {
        return {
          title: 'Pay Application History',
          subtitle: 'Finalized and draft applications'
        }
      }
      if (pathname === '/pay-applications' || pathname === '/pay-applications/new') {
        return {
          title: 'Pay Applications',
          subtitle: 'Create, manage, and track your construction pay applications'
        }
      }
      return {
        title: 'Pay Application',
        subtitle: 'Complete each step to submit for certification'
      }
    }
    if (pathname?.includes('/analytics')) {
      return {
        title: 'Analytics',
        subtitle: 'Portfolio performance across all projects'
      }
    }
    if (pathname?.includes('/reports')) {
      return {
        title: 'Reports',
        subtitle: 'Custom reports and scheduled deliveries'
      }
    }
    if (pathname?.includes('/financial')) {
      return {
        title: 'Financial',
        subtitle: 'Payment history and financial metrics'
      }
    }
    if (pathname?.includes('/exports')) {
      return {
        title: 'Exports',
        subtitle: 'Download reports and project data'
      }
    }
    if (pathname?.includes('/team')) {
      return {
        title: 'Team',
        subtitle: 'Manage team members and permissions'
      }
    }
    if (pathname?.includes('/settings')) {
      return {
        title: 'Settings',
        subtitle: 'Account settings and preferences'
      }
    }
    if (pathname?.includes('/compliance')) {
      return {
        title: 'Compliance',
        subtitle: 'Risk assessment and compliance tracking'
      }
    }
    return {
      title: 'Dashboard',
      subtitle: 'Project overview and recent activity'
    }
  }

  const pageInfo = getPageInfo()

  if (isProjectRoute) {
    // Project workflow header - single unified header
    return (
      <>
        <header className="bg-[#1e3a4f] h-[60px] flex items-center justify-between px-7 fixed top-0 left-[215px] right-0 z-50">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white">{projectName}</h1>
            <p className="text-xs text-white/55 mt-0.5">Project workflow and progress</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" className="text-white/75 border-white/20 hover:bg-white/10">
              Save Draft
            </Button>
            <Button size="sm" className="bg-[#3b82f6] hover:bg-[#1d4ed8]" onClick={handleContinue}>
              Continue to {getNextStep()?.name || 'Next'}
            </Button>
            <div className="w-8.5 h-8.5 rounded-full bg-white"></div>
          </div>
        </header>
        <ProjectSubheader steps={steps} currentStep={getCurrentStep()} />
      </>
    )
  }

  return (
    <header className="bg-[#1e3a4f] h-[60px] flex items-center justify-between px-7 fixed top-0 left-[215px] right-0 z-50">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-white">{pageInfo.title}</h1>
        <p className="text-xs text-white/55 mt-0.5">{pageInfo.subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">
        {/* Date filter for analytics page */}
        {pathname?.includes('/analytics') && (
          <div className="flex bg-white/10 rounded-md overflow-hidden">
            {['7D', '30D', '90D', 'YTD', 'All'].map((range) => (
              <button
                key={range}
                className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/8 transition-all"
              >
                {range}
              </button>
            ))}
          </div>
        )}
        <div className="w-8.5 h-8.5 rounded-full bg-white"></div>
      </div>
    </header>
  )
}
