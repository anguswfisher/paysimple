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

  if (isProjectRoute) {
    // Project workflow header - single unified header
    return (
      <>
        <header className="bg-navy border-b-2 border-steel/30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div>
                  <h1 className="text-2xl font-semibold text-white">{projectName}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="text-xs text-white/50">
                      Projects / <span className="text-white/85 font-medium">{projectName}</span>
                    </div>
                    {project?.type && (
                      <span className="text-sm text-white/70">{project?.type}</span>
                    )}
                    {project?.status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project?.status === 'complete' ? 'bg-green-100 text-green-800' :
                        project?.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        project?.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project?.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-white/75 border-white/20 hover:bg-white/10">
                  Save Draft
                </Button>
                <Button size="sm" className="bg-steel hover:bg-steel/90" onClick={handleContinue}>
                  Continue to {getNextStep()?.name || 'Next'}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                        <AvatarFallback className="text-white">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.user_metadata?.name || user?.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        <ProjectSubheader steps={steps} currentStep={getCurrentStep()} />
      </>
    )
  }
  return (
    <header className="bg-navy border-b-2 border-steel/30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div>
              <h1 className="text-2xl font-semibold text-white">Project Dashboard</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="text-xs text-white/50">
                  Welcome back, <span className="text-white/85 font-medium">{user?.user_metadata?.name || user?.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                    <AvatarFallback className="text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.name || user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
