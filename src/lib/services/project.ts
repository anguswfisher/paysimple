import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Project, CreateProjectData } from '@/lib/database/projects'

// Re-export Project type for convenience
export type { Project } from '@/lib/database/projects'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface ProjectWithDetails extends Project {
  payment_schedule?: any
  compliance_flags?: any
  recent_activity?: ProjectActivity[]
}

export interface ProjectActivity {
  id: string
  type: 'project_created' | 'contract_uploaded' | 'schedule_created' | 'compliance_updated' | 'export_generated'
  title: string
  description: string
  created_at: string
  user_name?: string
}

export interface ProjectStats {
  total_projects: number
  active_projects: number
  completed_projects: number
  total_contract_value: number
  pending_compliance_flags: number
  recent_projects: Project[]
}

export class ProjectService {
  async getProject(projectId: string): Promise<ProjectWithDetails | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (projectError) throw projectError
      if (!project) return null

      // Get related data in parallel
      const [paymentSchedule, complianceFlags, activity] = await Promise.all([
        this.getPaymentSchedule(projectId),
        this.getComplianceFlags(projectId),
        this.getProjectActivity(projectId)
      ])

      return {
        ...project,
        payment_schedule: paymentSchedule,
        compliance_flags: complianceFlags,
        recent_activity: activity
      } as ProjectWithDetails
    } catch (error) {
      console.error('Error fetching project:', error)
      throw new Error('Failed to fetch project')
    }
  }

  async getUserProjects(userId?: string): Promise<Project[]> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!targetUserId) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user projects:', error)
      throw new Error('Failed to fetch user projects')
    }
  }

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project> {
    try {
      const { data, error } = await (supabase
        .from('projects') as any)
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to update project')

      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw new Error('Failed to update project')
    }
  }

  async updateProjectStatus(projectId: string, status: ProjectRow['status']): Promise<Project> {
    return await this.updateProject(projectId, { status })
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting project:', error)
      throw new Error('Failed to delete project')
    }
  }

  async duplicateProject(projectId: string, newName: string): Promise<Project> {
    try {
      const originalProject = await this.getProject(projectId)
      if (!originalProject) throw new Error('Original project not found')

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      const projectData: CreateProjectData = {
        name: newName,
        project_type: originalProject.project_type || undefined,
        contract_value: originalProject.contract_value || undefined,
        start_date: originalProject.start_date || undefined,
        estimated_completion: originalProject.estimated_completion || undefined,
        owner: originalProject.owner || undefined,
        contractor: originalProject.contractor || undefined,
        architect: originalProject.architect || undefined,
        description: originalProject.description || undefined,
        tags: originalProject.tags || undefined
      }

      // Use existing createProject function
      const { createProject } = await import('@/lib/database/projects')
      return await createProject(projectData)
    } catch (error) {
      console.error('Error duplicating project:', error)
      throw new Error('Failed to duplicate project')
    }
  }

  async getProjectStats(userId?: string): Promise<ProjectStats> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!targetUserId) throw new Error('User not authenticated')

      // Get all projects for the user
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', targetUserId)

      if (error) throw error

      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0

      const totalContractValue = projects?.reduce((sum: number, project: any) => {
        return sum + (project.contract_value ? parseFloat(project.contract_value) : 0)
      }, 0) || 0

      // Get compliance flags count
      const { data: flags } = await (supabase
        .from('compliance_flags') as any)
        .select('id')
        .in('project_id', projects?.map((p: any) => p.id) || [])
        .eq('is_resolved', false)

      const pendingComplianceFlags = flags?.length || 0

      // Get recent projects (last 5)
      const recentProjects = projects
        ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || []

      return {
        total_projects: totalProjects,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        total_contract_value: totalContractValue,
        pending_compliance_flags: pendingComplianceFlags,
        recent_projects: recentProjects
      }
    } catch (error) {
      console.error('Error fetching project stats:', error)
      throw new Error('Failed to fetch project stats')
    }
  }

  async searchProjects(query: string, userId?: string): Promise<Project[]> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!targetUserId) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', targetUserId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,project_type.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching projects:', error)
      throw new Error('Failed to search projects')
    }
  }

  async recordProjectActivity(
    projectId: string,
    type: ProjectActivity['type'],
    title: string,
    description: string
  ): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return

      const activity = {
        project_id: projectId,
        user_id: user.id,
        type,
        title,
        description,
        user_name: user.user_metadata?.name || user.email || 'Unknown'
      }

      await (supabase
        .from('project_activity') as any)
        .insert(activity)
    } catch (error) {
      console.error('Error recording project activity:', error)
      // Don't throw error for activity logging
    }
  }

  private async getPaymentSchedule(projectId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single()

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  private async getComplianceFlags(projectId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('compliance_flags')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  private async getProjectActivity(projectId: string): Promise<ProjectActivity[]> {
    try {
      const { data, error } = await supabase
        .from('project_activity')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) return []
      return (data || []).map((activity: any) => ({
        id: activity.id,
        type: activity.type as ProjectActivity['type'],
        title: activity.title,
        description: activity.description,
        created_at: activity.created_at,
        user_name: activity.user_name
      }))
    } catch (error) {
      return []
    }
  }

  // Advanced project calculations
  calculateProjectProgress(project: ProjectWithDetails): number {
    if (!project.payment_schedule) return 0

    const schedule = project.payment_schedule
    const payments = schedule.schedule_data?.payments || []
    
    if (payments.length === 0) return 0

    const totalValue = payments.reduce((sum: number, payment: any) => sum + payment.gross_amount, 0)
    const paidValue = payments
      .filter((payment: any) => payment.status === 'paid')
      .reduce((sum: number, payment: any) => sum + payment.net_amount, 0)

    return totalValue > 0 ? (paidValue / totalValue) * 100 : 0
  }

  calculateProjectHealth(project: ProjectWithDetails): 'excellent' | 'good' | 'warning' | 'critical' {
    const progress = this.calculateProjectProgress(project)
    const flags = project.compliance_flags || []
    const unresolvedFlags = flags.filter((flag: any) => !flag.is_resolved).length

    // Health scoring logic
    if (progress > 75 && unresolvedFlags === 0) return 'excellent'
    if (progress > 50 && unresolvedFlags <= 2) return 'good'
    if (progress > 25 && unresolvedFlags <= 5) return 'warning'
    return 'critical'
  }

  getUpcomingMilestones(project: ProjectWithDetails): Array<{ title: string; date: string; type: string }> {
    const milestones: Array<{ title: string; date: string; type: string }> = []
    
    if (project.payment_schedule) {
      const payments = project.payment_schedule.schedule_data?.payments || []
      const upcomingPayments = payments
        .filter((payment: any) => payment.status === 'pending')
        .slice(0, 3)

      upcomingPayments.forEach((payment: any) => {
        milestones.push({
          title: `Payment ${payment.payment_number}`,
          date: payment.due_date,
          type: 'payment'
        })
      })
    }

    if (project.estimated_completion) {
      milestones.push({
        title: 'Project Completion',
        date: project.estimated_completion,
        type: 'milestone'
      })
    }

    return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
}

export const projectService = new ProjectService()
