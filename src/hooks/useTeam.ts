'use client'

import { useState, useEffect } from 'react'
import { TeamMember, TeamInvitation, TeamRole } from '@/types/team'

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/team')
      if (!response.ok) {
        throw new Error('Failed to fetch team data')
      }

      const data = await response.json()
      setMembers(data.members || [])
      setInvitations(data.invitations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async (email: string, role: TeamRole) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send invitation')
      }

      const invitation = await response.json()
      setInvitations(prev => [invitation, ...prev])
      return invitation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId: string, role: TeamRole) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/team/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update role')
      }

      const updatedMember = await response.json()
      setMembers(prev => 
        prev.map(member => 
          member.user_id === userId ? { ...member, ...updatedMember } : member
        )
      )
      return updatedMember
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/team/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove member')
      }

      setMembers(prev => prev.filter(member => member.user_id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendInvitation = async (token: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/team/invite/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resend' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to resend invitation')
      }

      // Update the invitation's expiration time locally
      setInvitations(prev =>
        prev.map(inv =>
          inv.token === token
            ? { ...inv, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
            : inv
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invitation')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const revokeInvitation = async (token: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/team/invite/${token}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to revoke invitation')
      }

      setInvitations(prev => prev.filter(inv => inv.token !== token))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invitation')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()
  }, [])

  return {
    members,
    invitations,
    loading,
    error,
    refetch: fetchTeamData,
    inviteMember,
    updateRole,
    removeMember,
    resendInvitation,
    revokeInvitation,
  }
}
