'use client'

import { useState, useEffect } from 'react'
import { ExportJob, ExportType, ExportFilters } from '@/types/exports'

export function useExports() {
  const [exports, setExports] = useState<ExportJob[]>([])
  const [processing, setProcessing] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExports = async (filters?: ExportFilters) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.project_id) params.append('project_id', filters.project_id)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.date_from) params.append('date_from', filters.date_from)
      if (filters?.date_to) params.append('date_to', filters.date_to)

      const response = await fetch(`/api/exports?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch exports')
      }

      const data = await response.json()
      setExports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createExport = async (type: ExportType, projectId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, project_id: projectId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create export')
      }

      const exportJob = await response.json()
      
      // Add to processing set
      setProcessing(prev => new Set(prev).add(exportJob.id))
      
      // Add to exports list
      setExports(prev => [exportJob, ...prev])

      // Start polling for status updates
      pollExportStatus(exportJob.id)

      return exportJob
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create export')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const downloadExport = async (exportId: string) => {
    try {
      const response = await fetch(`/api/exports/${exportId}/download`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download export')
      }

      // The response should be a redirect to the signed URL
      if (response.redirected) {
        return response.url
      }

      // Fallback: get the export details and download manually
      const exportJob = await getExportJob(exportId)
      if (exportJob.file_url) {
        window.open(exportJob.file_url, '_blank')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download export')
      throw err
    }
  }

  const getExportJob = async (exportId: string): Promise<ExportJob> => {
    const response = await fetch(`/api/exports/${exportId}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch export job')
    }

    return await response.json()
  }

  const deleteExport = async (exportId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/exports/${exportId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete export')
      }

      // Remove from exports list
      setExports(prev => prev.filter((exportItem: any) => exportItem.id !== exportId))
      
      // Remove from processing set
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(exportId)
        return newSet
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete export')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const pollExportStatus = async (exportId: string, maxAttempts = 60) => {
    let attempts = 0

    const poll = async () => {
      attempts++
      
      try {
        const exportJob = await getExportJob(exportId)
        
        // Update the export in the list
        setExports(prev => 
          prev.map((exportItem: any) => 
            exportItem.id === exportId ? { ...exportItem, ...exportJob } : exportItem
          )
        )

        // If completed or failed, remove from processing and stop polling
        if (exportJob.status === 'completed' || exportJob.status === 'failed') {
          setProcessing(prev => {
            const newSet = new Set(prev)
            newSet.delete(exportId)
            return newSet
          })
          return
        }

        // Continue polling if still processing and under max attempts
        if (exportJob.status === 'processing' && attempts < maxAttempts) {
          setTimeout(poll, 2000) // Poll every 2 seconds
        } else if (attempts >= maxAttempts) {
          // Max attempts reached, remove from processing
          setProcessing(prev => {
            const newSet = new Set(prev)
            newSet.delete(exportId)
            return newSet
          })
        }
      } catch (err) {
        console.error('Error polling export status:', err)
        // Remove from processing on error
        setProcessing(prev => {
          const newSet = new Set(prev)
          newSet.delete(exportId)
          return newSet
        })
      }
    }

    // Start polling after a short delay
    setTimeout(poll, 1000)
  }

  useEffect(() => {
    fetchExports()
  }, [])

  return {
    exports,
    processing,
    loading,
    error,
    refetch: fetchExports,
    createExport,
    downloadExport,
    deleteExport,
    pollExportStatus,
  }
}
