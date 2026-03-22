'use client'

import { useState, useEffect } from 'react'
import { projectService, ProjectWithDetails, ProjectStats, Project } from '@/lib/services/project'

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const data = await projectService.getProject(projectId)
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (updates: Partial<Project>) => {
    if (!projectId) throw new Error('Project ID is required')

    setLoading(true)
    setError(null)

    try {
      const updatedProject = await projectService.updateProject(projectId, updates)
      setProject(prev => prev ? { ...prev, ...updatedProject } : null)
      return updatedProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProjectStatus = async (status: Project['status']) => {
    return await updateProject({ status })
  }

  const deleteProject = async () => {
    if (!projectId) throw new Error('Project ID is required')

    setLoading(true)
    setError(null)

    try {
      await projectService.deleteProject(projectId)
      setProject(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const duplicateProject = async (newName: string) => {
    if (!projectId) throw new Error('Project ID is required')

    setLoading(true)
    setError(null)

    try {
      const duplicatedProject = await projectService.duplicateProject(projectId, newName)
      return duplicatedProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate project')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const recordActivity = async (type: 'project_created' | 'contract_uploaded' | 'schedule_created' | 'compliance_updated' | 'export_generated', title: string, description: string) => {
    try {
      await projectService.recordProjectActivity(projectId, type, title, description)
      // Refresh project to get updated activity
      await fetchProject()
    } catch (err) {
      console.error('Failed to record activity:', err)
    }
  }

  const getProgress = () => {
    if (!project) return 0
    return projectService.calculateProjectProgress(project)
  }

  const getHealth = () => {
    if (!project) return 'critical' as const
    return projectService.calculateProjectHealth(project)
  }

  const getUpcomingMilestones = () => {
    if (!project) return []
    return projectService.getUpcomingMilestones(project)
  }

  useEffect(() => {
    fetchProject()
  }, [projectId])

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    duplicateProject,
    recordActivity,
    getProgress,
    getHealth,
    getUpcomingMilestones
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async (userId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await projectService.getUserProjects(userId)
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (userId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await projectService.getProjectStats(userId)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project stats')
    } finally {
      setLoading(false)
    }
  }

  const searchProjects = async (query: string, userId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await projectService.searchProjects(query, userId)
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search projects')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async (userId?: string) => {
    await Promise.all([
      fetchProjects(userId),
      fetchStats(userId)
    ])
  }

  useEffect(() => {
    refresh()
  }, [])

  return {
    projects,
    stats,
    loading,
    error,
    refetch: refresh,
    fetchProjects,
    fetchStats,
    searchProjects
  }
}
