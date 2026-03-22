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

  const handleInvite = async () => {
    try {
      await inviteMember(inviteEmail, inviteRole as any)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('member')
    } catch (error) {
      console.error('Failed to invite member:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole(userId, newRole as any)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      try {
        await removeMember(userId)
      } catch (error) {
        console.error('Failed to remove member:', error)
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
          <div className="space-y-1">
            {/* Admin */}
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-navy text-white font-semibold flex items-center justify-center">
                AF
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate">Angus Fisher</div>
                <div className="text-sm text-slate/70">angus@paysimple.io</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-navy/10 text-navy border-navy/20">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
                <span className="text-sm text-slate/50">Joined Jan 2026</span>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>

            {/* Member 1 */}
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-success text-white font-semibold flex items-center justify-center">
                SL
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate">Sarah Liu</div>
                <div className="text-sm text-slate/70">sarah@constructco.com</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Member
                </Badge>
                <span className="text-sm text-slate/50">Joined Feb 2026</span>
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-danger hover:text-danger">Remove</Button>
              </div>
            </div>

            {/* Member 2 */}
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-semibold flex items-center justify-center">
                MK
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate">Marcus Kim</div>
                <div className="text-sm text-slate/70">marcus@constructco.com</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Member
                </Badge>
                <span className="text-sm text-slate/50">Joined Feb 2026</span>
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-danger hover:text-danger">Remove</Button>
              </div>
            </div>

            {/* Viewer */}
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-warning text-white font-semibold flex items-center justify-center">
                JP
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate">Jessica Park</div>
                <div className="text-sm text-slate/70">j.park@constructco.com</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-slate/10 text-slate/70 border-slate/20">
                  <Eye className="w-3 h-3 mr-1" />
                  Viewer
                </Badge>
                <span className="text-sm text-slate/50">Joined Mar 2026</span>
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-danger hover:text-danger">Remove</Button>
              </div>
            </div>

            {/* Pending Invite */}
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate/5 transition-colors opacity-75">
              <div className="w-10 h-10 rounded-full bg-slate text-white font-semibold flex items-center justify-center">
                TW
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate">Tom Weston</div>
                <div className="text-sm text-slate/70">t.weston@gmail.com</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <Mail className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
                <span className="text-sm text-slate/50">Invited 3/20/26</span>
                <Button variant="outline" size="sm">Resend</Button>
                <Button variant="outline" size="sm" className="text-danger hover:text-danger">Revoke</Button>
              </div>
            </div>
          </div>
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
    </div>
  )
}
