export type TeamRole = 'admin' | 'member' | 'viewer'

export interface TeamInvitation {
  id: string
  inviter_id: string
  email: string
  role: TeamRole
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  user_id: string
  inviter_id: string | null
  role: TeamRole
  permissions: Record<string, any>
  joined_at: string
  // Joined user profile data
  user?: {
    id: string
    name: string | null
    company_name: string | null
    created_at: string
  }
}

export interface UserActivity {
  id: string
  user_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface TeamUpdate {
  type: 'member_joined' | 'member_left' | 'role_changed' | 'invitation_sent'
  data: Record<string, any>
  timestamp: string
}
