'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, UserPlus, Search, Filter, Edit, Trash2, Mail, Crown, Shield, Eye, RefreshCw } from 'lucide-react'
import { useTeam } from '@/hooks/useTeam'

export default function TeamPage() {
  const { members, invitations, loading, error, inviteMember, updateRole, removeMember, resendInvitation, revokeInvitation } = useTeam()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteError, setInviteError] = useState('')

  const handleInvite = async () => {
    setInviteError('')
    try {
      await inviteMember(inviteEmail, inviteRole as any)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('member')
    } catch (error) {
      console.error('Failed to invite member:', error)
      setInviteError(error instanceof Error ? error.message : 'Failed to send invitation')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole(userId, newRole as any)
    } catch (error) {
      console.error('Failed to update role:', error)
      // You could add a toast notification here
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      try {
        await removeMember(userId)
      } catch (error) {
        console.error('Failed to remove member:', error)
        // You could add a toast notification here
      }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />
      case 'member': return <Shield className="w-4 h-4" />
      case 'viewer': return <Eye className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'member': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'viewer': return 'bg-slate/10 text-slate/70 border-slate/20'
      default: return 'bg-slate/10 text-slate/70 border-slate/20'
    }
  }
  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <div></div>
        <Button className="bg-navy hover:bg-navy/90" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate/70">Total Members</p>
                <p className="text-3xl font-bold text-slate mt-2">{members.length}</p>
                <p className="text-sm text-slate/70 mt-1">Across all roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate/70">Active This Week</p>
                <p className="text-3xl font-bold text-slate mt-2">{Math.max(0, members.length - 1)}</p>
                <p className="text-sm text-success mt-1">▲ +1 from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate/70">Pending Invites</p>
                <p className="text-3xl font-bold text-slate mt-2">{invitations.length}</p>
                <p className="text-sm text-slate/70 mt-1">Awaiting response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <p className="text-sm text-slate/70 mt-1">Manage roles and project access</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input 
                  placeholder="Search members..." 
                  className="pl-10 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate/40" />
              <span className="ml-2 text-slate/60">Loading team data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg mb-4">
              <p className="text-sm text-danger">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Team Members List */}
          {!loading && !error && (
            <div className="space-y-1">
              {/* Real Team Members */}
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate/5 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-navy text-white font-semibold flex items-center justify-center">
                    {member.user?.name ? member.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate">
                      {member.user?.name || `User ${member.user_id.slice(0, 8)}`}
                    </div>
                    <div className="text-sm text-slate/70">
                      {member.user?.company_name || 'No company set'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={getRoleColor(member.role)}>
                      {getRoleIcon(member.role)}
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                    <span className="text-sm text-slate/50">
                      Joined {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <Select 
                      value={member.role} 
                      onValueChange={(value) => handleRoleChange(member.user_id, value)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-danger hover:text-danger"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pending Invitations */}
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate/5 transition-colors opacity-75">
                  <div className="w-10 h-10 rounded-full bg-slate text-white font-semibold flex items-center justify-center">
                    {invitation.email.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate">{invitation.email}</div>
                    <div className="text-sm text-slate/70">Invitation pending</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      <Mail className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                    <span className="text-sm text-slate/50">
                      Expires {new Date(invitation.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => resendInvitation(invitation.token)}
                    >
                      Resend
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-danger hover:text-danger"
                      onClick={() => revokeInvitation(invitation.token)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {members.length === 0 && invitations.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate mb-2">No team members yet</h3>
                  <p className="text-sm text-slate/70 mb-4">Invite team members to start collaborating on projects</p>
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite First Member
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Permission</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Admin</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Member</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate/70 uppercase tracking-wider">Viewer</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate/5 hover:bg-slate/5">
                  <td className="py-3 px-4">Upload & analyze contracts</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate/30 text-lg">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-slate/5 hover:bg-slate/5">
                  <td className="py-3 px-4">View payment schedules</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-slate/5 hover:bg-slate/5">
                  <td className="py-3 px-4">Export reports</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate/30 text-lg">✗</span>
                  </td>
                </tr>
                <tr className="border-b border-slate/5 hover:bg-slate/5">
                  <td className="py-3 px-4">Manage team members</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate/30 text-lg">✗</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate/30 text-lg">✗</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate/5">
                  <td className="py-3 px-4">Billing & plan management</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-success text-lg">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate/30 text-lg">✗</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate/30 text-lg">✗</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate mb-2">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="member">Member - Can manage projects</SelectItem>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Display */}
              {inviteError && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="text-sm text-danger">{inviteError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteError('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail || loading}
                className="flex-1 bg-navy hover:bg-navy/90"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
