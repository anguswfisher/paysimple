import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { isDemoActive } from '@/lib/demo/mode'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface Project extends ProjectRow {}

export interface CreateProjectData {
  name: string
  project_type?: string
  contract_value?: string
  contract_file_url?: string
  start_date?: string
  estimated_completion?: string
  owner?: string
  contractor?: string
  architect?: string
  description?: string
  tags?: string[]
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Prepare project data
  const getUserInitials = (user: any) => {
    if (!user?.user_metadata?.name && !user?.email) return 'U'
    const name = user?.user_metadata?.name || user?.email || ''
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const projectData = {
    user_id: user.id,
    name: data.name,
    project_type: data.project_type || null,
    contract_value: data.contract_value ? parseFloat(data.contract_value.replace(/[^0-9.-]/g, '')) : null,
    start_date: data.start_date || null,
    estimated_completion: data.estimated_completion || null,
    owner: data.owner || null,
    contractor: data.contractor || null,
    architect: data.architect || null,
    description: data.description || null,
    tags: data.tags || [],
    status: 'draft' as const
  }

  // Insert project
  const { data: project, error } = await supabase
    .from('projects')
    .insert(projectData as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }

  return project as Project
}

export async function getUserProjects(): Promise<Project[]> {
  if (isDemoActive()) {
    const { DEMO_PROJECTS } = await import('@/lib/demo/data')
    return DEMO_PROJECTS
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Fetch user's projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    throw new Error('Failed to fetch projects')
  }

  return projects || []
}

export async function getProject(projectId: string): Promise<Project> {
  if (isDemoActive()) {
    const { getDemoProject } = await import('@/lib/demo/data')
    const demo = getDemoProject(projectId)
    if (demo) return demo
    throw new Error('Project not found')
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Fetch project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    throw new Error('Project not found')
  }

  return project
}

export async function updateProject(projectId: string, data: Partial<CreateProjectData>): Promise<Project> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Prepare update data
  const updateData: ProjectUpdate = {
    ...data,
    updated_at: new Date().toISOString()
  }

  // Keep contract_value aligned with database type (string)
  if (data.contract_value) {
    updateData.contract_value = data.contract_value
  }

  // Update project
  const { data: project, error } = await (supabase
    .from('projects') as any)
    .update(updateData)
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }

  return project as Project
}

export async function updateProjectStatus(projectId: string, status: Project['status']): Promise<Project> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const statusUpdate: ProjectUpdate = {
    status,
    updated_at: new Date().toISOString()
  }

  // Update project status
  const { data: project, error } = await (supabase
    .from('projects') as any)
    .update(statusUpdate)
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project status:', error)
    throw new Error('Failed to update project status')
  }

  return project as Project
}

export async function deleteProject(projectId: string): Promise<void> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Delete project (cascade will delete related data)
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }
}
