import { NextRequest, NextResponse } from 'next/server'
import { TeamService } from '@/lib/services/team'

const teamService = new TeamService()

export async function GET(request: NextRequest) {
  try {
    const members = await teamService.getTeamMembers()
    const invitations = await teamService.getPendingInvitations()

    return NextResponse.json({
      members,
      invitations
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const invitation = await teamService.inviteMember(email, role)
    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
