import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Create server-side Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // First, validate the invitation exists and is valid
    const { data: invitation, error: inviteError } = await (supabase
      .from('team_invitations') as any)
      .select('*')
      .eq('token', params.token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      )
    }

    if (invitation.expires_at < new Date().toISOString()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const authToken = authHeader.split(' ')[1]
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(authToken)
      
      if (!userError && authUser) {
        user = authUser
      }
    }

    // If not authenticated, return invitation details for the landing page
    if (!user) {
      return NextResponse.json({
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expires_at: invitation.expires_at,
          created_at: invitation.created_at
        },
        requiresAuth: true
      })
    }

    // User is authenticated - proceed with accepting the invitation
    // Check if user already has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 400 }
      )
    }

    // Create team member
    const { data: member, error: memberError } = await (supabase
      .from('team_members') as any)
      .insert({
        user_id: user.id,
        inviter_id: invitation.inviter_id,
        role: invitation.role,
        permissions: getDefaultPermissions(invitation.role)
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
      .eq('token', params.token)

    return NextResponse.json({
      success: true,
      member
    })
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
    const user = await getAuthenticatedUser(request)
    
    const body = await request.json()
    const { action } = body

    if (action === 'resend') {
      // Check if user owns this invitation
      const { data: invitation, error: inviteError } = await (supabase
        .from('team_invitations') as any)
        .select('*')
        .eq('token', params.token)
        .eq('inviter_id', user.id)
        .single()

      if (inviteError || !invitation) {
        return NextResponse.json(
          { error: 'Invitation not found or insufficient permissions' },
          { status: 404 }
        )
      }

      // Update expiration
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await (supabase
        .from('team_invitations') as any)
        .update({ expires_at: newExpiresAt })
        .eq('token', params.token)

      // TODO: Send email
      const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${params.token}`
      console.log('Resending invitation email to:', invitation.email, 'with link:', invitationLink)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error handling invitation:', error)
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
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
    const user = await getAuthenticatedUser(request)

    const { error } = await (supabase
      .from('team_invitations') as any)
      .delete()
      .eq('token', params.token)
      .eq('inviter_id', user.id)

    if (error) {
      console.error('Error revoking invitation:', error)
      throw new Error('Failed to revoke invitation')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking invitation:', error)
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke invitation' },
      { status: 500 }
    )
  }
}

function getDefaultPermissions(role: string) {
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
