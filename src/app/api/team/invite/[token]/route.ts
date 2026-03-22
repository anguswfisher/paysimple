import { NextRequest, NextResponse } from 'next/server'
import { TeamService } from '@/lib/services/team'

const teamService = new TeamService()

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const member = await teamService.acceptInvitation(params.token)
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'resend') {
      await teamService.resendInvitation(params.token)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error handling invitation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to handle invitation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await teamService.revokeInvitation(params.token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking invitation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke invitation' },
      { status: 500 }
    )
  }
}
