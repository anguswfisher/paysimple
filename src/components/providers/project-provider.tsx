'use client'

import { createContext, useContext, ReactNode } from 'react'

interface Project {
  id: string
  name: string
  type?: string
  status?: string
  description?: string
}

interface ProjectContextType {
  project: Project | null
}

const ProjectContext = createContext<ProjectContextType>({ project: null })

export function ProjectProvider({ 
  children, 
  project 
}: { 
  children: ReactNode
  project: Project
}) {
  return (
    <ProjectContext.Provider value={{ project }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  return context.project
}
