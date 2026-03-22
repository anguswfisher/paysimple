import { supabase } from '@/lib/supabase/client'
import { TeamInvitation, TeamMember, TeamRole, UserActivity } from '@/types/team'

// Type casting for new tables until types are regenerated
type TeamInvitationRow = {
  id: string
  inviter_id: string
  email: string
  role: TeamRole
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

type TeamMemberRow = {
  id: string
  user_id: string
  inviter_id: string | null
  role: TeamRole
  permissions: Record<string, any>
  joined_at: string
}

type UserActivityRow = {
  id: string
  user_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, any>
  created_at: string
}

export class TeamService {
  async inviteMember(email: string, role: TeamRole): Promise<TeamInvitation> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await (supabase
      .from('team_invitations') as any)
      .insert({
        inviter_id: user.id,
        email,
        role,
        token,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invitation:', error)
      throw new Error('Failed to create invitation')
    }

    // Log activity
    await this.logActivity(user.id, 'invite_sent', 'team_invitation', data.id, { email, role })

    // TODO: Send invitation email
    await this.sendInvitationEmail(email, token)

    return data as TeamInvitation
  }

  async acceptInvitation(token: string): Promise<TeamMember> {
    // Get invitation
    const { data: invitation, error: inviteError } = await (supabase
      .from('team_invitations') as any)
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    if (invitation.expires_at < new Date().toISOString()) {
      throw new Error('Invitation has expired')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Check if user already has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    // Create team member
    const { data: member, error: memberError } = await (supabase
      .from('team_members') as any)
      .insert({
        user_id: user.id,
        inviter_id: invitation.inviter_id,
        role: invitation.role,
        permissions: this.getDefaultPermissions(invitation.role)
      })
      .select()
      .single()

    if (memberError) {
      console.error('Error creating team member:', memberError)
      throw new Error('Failed to accept invitation')
    }

    // Update invitation as accepted
    await (supabase
      .from('team_invitations') as any)
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token)

    // Log activity
    await this.logActivity(user.id, 'invitation_accepted', 'team_member', member.id, { role: invitation.role })

    return member as TeamMember
  }

  async updateMemberRole(userId: string, role: TeamRole): Promise<TeamMember> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Validate permissions
    if (!await this.validatePermissions(user.id, 'manage_team')) {
      throw new Error('Insufficient permissions')
    }

    const { data, error } = await (supabase
      .from('team_members') as any)
      .update({ 
        role, 
        permissions: this.getDefaultPermissions(role) 
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating member role:', error)
      throw new Error('Failed to update member role')
    }

    // Log activity
    await this.logActivity(user.id, 'role_changed', 'team_member', data.id, { new_role: role })

    return data as TeamMember
  }

  async removeMember(userId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Cannot remove yourself
    if (userId === user.id) {
      throw new Error('Cannot remove yourself from the team')
    }

    // Validate permissions
    if (!await this.validatePermissions(user.id, 'manage_team')) {
      throw new Error('Insufficient permissions')
    }

    const { error } = await (supabase
      .from('team_members') as any)
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing team member:', error)
      throw new Error('Failed to remove team member')
    }

    // Log activity
    await this.logActivity(user.id, 'member_removed', 'team_member', userId)
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await (supabase
      .from('team_members_details') as any)
      .select('*')
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching team members:', error)
      throw new Error('Failed to fetch team members')
    }

    return data || []
  }

  async getPendingInvitations(): Promise<TeamInvitation[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await (supabase
      .from('team_invitations') as any)
      .select('*')
      .eq('inviter_id', user.id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      throw new Error('Failed to fetch invitations')
    }

    return data || []
  }

  async resendInvitation(token: string): Promise<void> {
    const { data: invitation, error } = await (supabase
      .from('team_invitations') as any)
      .select('*')
      .eq('token', token)
      .single()

    if (error || !invitation) {
      throw new Error('Invitation not found')
    }

    // Update expiration
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    await (supabase
      .from('team_invitations') as any)
      .update({ expires_at: newExpiresAt })
      .eq('token', token)

    // Resend email
    await this.sendInvitationEmail(invitation.email, token)
  }

  async revokeInvitation(token: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { error } = await (supabase
      .from('team_invitations') as any)
      .delete()
      .eq('token', token)
      .eq('inviter_id', user.id)

    if (error) {
      console.error('Error revoking invitation:', error)
      throw new Error('Failed to revoke invitation')
    }
  }

  private async sendInvitationEmail(email: string, token: string): Promise<void> {
    // TODO: Implement email sending
    console.log('Sending invitation email to:', email, 'with token:', token)
    // This would integrate with your email service (Resend, SendGrid, etc.)
  }

  private async validatePermissions(userId: string, action: string): Promise<boolean> {
    const { data: member } = await (supabase
      .from('team_members') as any)
      .select('role')
      .eq('user_id', userId)
      .single()

    if (!member) return false

    const adminActions = ['manage_team', 'manage_settings', 'manage_billing']
    const memberActions = ['view_projects', 'create_exports']
    const viewerActions = ['view_projects']

    switch (member.role) {
      case 'admin':
        return adminActions.includes(action) || memberActions.includes(action) || viewerActions.includes(action)
      case 'member':
        return memberActions.includes(action) || viewerActions.includes(action)
      case 'viewer':
        return viewerActions.includes(action)
      default:
        return false
    }
  }

  private getDefaultPermissions(role: TeamRole): Record<string, any> {
    switch (role) {
      case 'admin':
        return {
          can_manage_team: true,
          can_manage_settings: true,
          can_manage_billing: true,
          can_view_all_projects: true,
          can_create_projects: true,
          can_export_data: true
        }
      case 'member':
        return {
          can_manage_team: false,
          can_manage_settings: false,
          can_manage_billing: false,
          can_view_all_projects: true,
          can_create_projects: true,
          can_export_data: true
        }
      case 'viewer':
        return {
          can_manage_team: false,
          can_manage_settings: false,
          can_manage_billing: false,
          can_view_all_projects: true,
          can_create_projects: false,
          can_export_data: false
        }
      default:
        return {}
    }
  }

  private async logActivity(
    userId: string, 
    action: string, 
    resourceType: string | null, 
    resourceId: string | null, 
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await (supabase
      .from('user_activity') as any)
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata
      })
  }
}
